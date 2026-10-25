# ReelTrip

Paste a travel reel from Instagram, YouTube, or TikTok and get a clean, structured travel note saved into one of your trips.

## Stack

React 18 + Vite + TypeScript + Tailwind + Radix UI + Firebase Auth/Firestore (project `erickmob-apps`). Deployed to GitHub Pages with HashRouter. The AI backend is [erickmob-api](https://github.com/erickmobltda/erickmob-api) at `https://api.erickmob.dev`.

Sign-up is disabled: accounts are created in the Firebase console (Authentication → Users).

## Local development

```bash
cp .env.example .env       # fill in the Firebase web config and backend URL
npm install
npm run dev
```

The dev server runs at `http://localhost:5173/`. The frontend calls `POST /travel-note` on `VITE_API_URL` (defaults to `http://localhost:8010`) with the signed-in user's Firebase ID token.

## Build & preview

```bash
npm run build    # tsc + vite build
npm run preview  # serves dist/
```

## Deploy

`.github/workflows/deploy.yml` builds and publishes `dist/` to the `gh-pages` branch on every push to `main`/`master`. Repo secrets:

- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`
- `VITE_API_URL`

Enable GitHub Pages → source: `gh-pages` branch. App URL: **https://reeltrip.erickmob.dev** (custom domain, set by the `cname` option of the deploy step; DNS is a CNAME to `erickmobltda.github.io` in Cloudflare, not proxied). The old `erickmobltda.github.io/reeltrip/` URL redirects there.

## Domain model

Stored in Firestore under `apps/reeltrip/users/{uid}/`; the security rules live in erickmob-api (`firebase/firestore.rules`).

- **Trip** (`trips`) — name (required), description, start/end dates, country.
- **POI** (`pois`) — travel-note response linked to one trip, with a user-assigned category (eat, sleep, see, do, save-money, transport, shop, other).
- **API token** (`apps/reeltrip/api_tokens/{sha256}`) — lets external tools (e.g. an iOS Shortcut) send reels to one trip via `POST https://api.erickmob.dev/reeltrip/process-url`. Only the hash is stored.

When you create a trip with a country, ReelTrip checks for POIs you saved with that country in other trips and offers to import them. Deleting a trip also deletes its POIs and API tokens.
