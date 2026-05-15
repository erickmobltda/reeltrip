# Transcriptor — Instagram Photo Post Fallback

## Context

The `/travel-note` endpoint fails with `422` when the submitted Instagram URL points to a
photo post (no video). yt-dlp raises `"No video formats found"` and the global `DownloadError`
handler returns early.

The fix adds a fallback path:
1. Detect the no-video error specifically (`NoVideoError`)
2. Re-extract the post using yt-dlp in metadata-only mode to get image CDN URLs + caption
3. Download the images to `/tmp`
4. Send them to Claude vision alongside the caption
5. Return the same travel-note JSON structure as the video path

Three files need to change: `services/downloader.py`, `services/claude_service.py`, `main.py`.

---

## 1. `services/downloader.py`

### 1a. Add `NoVideoError` right below `DownloadError`

```python
class DownloadError(Exception):
    """Raised when yt-dlp fails to download or extract audio."""


class NoVideoError(DownloadError):
    """Raised when the URL points to a photo post with no video."""
```

### 1b. In `_blocking_download`, replace the `except YtDlpDownloadError` block

```python
    except YtDlpDownloadError as exc:
        if os.path.exists(final_path):
            try:
                os.remove(final_path)
            except OSError:
                pass
        msg = str(exc)
        if "No video formats found" in msg:
            raise NoVideoError(msg) from exc
        raise DownloadError(msg) from exc
```

### 1c. Add two new functions at the bottom of the file

```python
def _blocking_extract_photo(url: str) -> dict:
    """Extract image(s) and metadata from a photo post without requiring video."""
    import urllib.request

    ydl_opts = {"quiet": True, "no_warnings": True, "noprogress": True}
    cookies_path = os.environ.get("INSTAGRAM_COOKIES_FILE")
    if cookies_path and os.path.exists(cookies_path):
        ydl_opts["cookiefile"] = cookies_path

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as exc:
        raise DownloadError(f"Could not extract photo post info: {exc}") from exc

    # Collect image URLs (single post or carousel)
    image_urls: list[str] = []
    if info.get("_type") == "playlist":
        for entry in info.get("entries") or []:
            u = entry.get("url") or entry.get("thumbnail")
            if u:
                image_urls.append(u)
    else:
        u = info.get("url") or info.get("thumbnail")
        if u:
            image_urls.append(u)

    # Download up to 4 images
    temp_id = uuid4().hex
    image_paths: list[str] = []
    for i, img_url in enumerate(image_urls[:4]):
        ext = "jpg"
        for candidate in (".png", ".webp", ".jpg", ".jpeg"):
            if candidate in img_url:
                ext = candidate.lstrip(".")
                break
        path = f"/tmp/{temp_id}_{i}.{ext}"
        try:
            req = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                with open(path, "wb") as f:
                    f.write(resp.read())
            image_paths.append(path)
        except Exception as exc:
            logger.warning("Failed to download image %s: %s", img_url, exc)

    if not image_paths:
        raise DownloadError("No images could be downloaded from this photo post.")

    extractor = (info.get("extractor_key") or info.get("extractor") or "").strip()
    return {
        "image_paths": image_paths,
        "title": info.get("title") or "",
        "description": info.get("description") or "",
        "webpage_url": info.get("webpage_url") or url,
        "platform": _normalize_platform(extractor),
    }


async def extract_photo_post(url: str) -> dict:
    """Async wrapper: extract images and metadata from a photo post."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _blocking_extract_photo, url)
```

---

## 2. `services/claude_service.py`

### 2a. Add `import base64` at the top with the other stdlib imports

```python
import base64
```

### 2b. Add `_blocking_message_multimodal` after `_blocking_message`

```python
def _blocking_message_multimodal(system: str, content: list) -> str:
    client = _client()
    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=MAX_TOKENS,
        system=system,
        messages=[{"role": "user", "content": content}],
    )
    parts = []
    for block in response.content:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "".join(parts)
```

### 2c. Add `generate_travel_note_from_images` at the bottom of the file

```python
async def generate_travel_note_from_images(
    image_paths: list[str],
    title: str,
    description: str,
    source_url: str,
) -> dict:
    def _media_type(path: str) -> str:
        if path.endswith(".png"):
            return "image/png"
        if path.endswith(".webp"):
            return "image/webp"
        return "image/jpeg"

    content: list = []
    for path in image_paths:
        with open(path, "rb") as f:
            data = base64.standard_b64encode(f.read()).decode()
        content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": _media_type(path), "data": data},
        })

    content.append({
        "type": "text",
        "text": (
            f"Post URL: {source_url}\n"
            f"Post title / username: {title}\n"
            f"Post caption: {description}\n\n"
            "Read any visible text in the image(s), identify the location, attractions, "
            "food, or other travel-relevant details. "
            "Extract all travel information and return ONLY a JSON object:\n"
            "{\n"
            '  "title": "...",\n'
            '  "tldr": "...",\n'
            '  "location": { "name": "...", "country": "...", "region": "..." },\n'
            '  "full_description": "...",\n'
            '  "highlights": ["...", "..."],\n'
            '  "practical_info": {\n'
            '    "best_time_to_visit": "...",\n'
            '    "estimated_cost": "...",\n'
            '    "how_to_get_there": "...",\n'
            '    "accommodation_tips": "...",\n'
            '    "food_tips": "..."\n'
            "  },\n"
            '  "useful_links": [{ "label": "...", "url": "..." }],\n'
            '  "source": { "original_url": "...", "title": "...", "platform": "..." }\n'
            "}"
        ),
    })

    loop = asyncio.get_running_loop()
    raw = await loop.run_in_executor(
        None, _blocking_message_multimodal, TRAVEL_SYSTEM, content
    )
    return _parse_json_response(raw)
```

---

## 3. `main.py`

### 3a. Update the two service import lines

```python
from services.claude_service import generate_repurpose, generate_travel_note, generate_travel_note_from_images
from services.downloader import DownloadError, NoVideoError, extract_photo_post
```

### 3b. Replace the entire `/travel-note` endpoint

```python
@app.post("/travel-note")
@limiter.limit(os.environ.get("RATE_LIMIT_PER_HOUR", "20") + "/hour")
async def travel_note(request: Request, body: TravelNoteRequest) -> dict:
    try:
        extracted = await extract_transcript(str(body.url))
    except NoVideoError:
        photo = await extract_photo_post(str(body.url))
        try:
            note = await generate_travel_note_from_images(
                image_paths=photo["image_paths"],
                title=photo["title"],
                description=photo["description"],
                source_url=photo["webpage_url"],
            )
        finally:
            for path in photo["image_paths"]:
                try:
                    os.remove(path)
                except OSError:
                    pass
        note.setdefault(
            "source",
            {
                "original_url": photo["webpage_url"],
                "title": photo["title"],
                "platform": photo["platform"],
            },
        )
        return note

    note = await generate_travel_note(
        transcript=extracted["transcript"],
        title=extracted["title"],
        description=extracted["description"],
        source_url=extracted["source_url"],
    )
    note.setdefault(
        "source",
        {
            "original_url": extracted["source_url"],
            "title": extracted["title"],
            "platform": extracted["platform"],
        },
    )
    return note
```

---

## After applying all changes

Restart the service:

```bash
sudo systemctl restart media-transcription-service
```
