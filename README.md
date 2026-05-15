# ReelTrip

Paste a travel reel from Instagram, YouTube, or TikTok and get a clean, structured travel note saved into one of your trips.

## Stack

React 18 + Vite + TypeScript + Tailwind + Radix UI + Supabase Auth/DB. Mirrors the labsync project layout, deployed to GitHub Pages with HashRouter.

## Local development

```bash
cp .env.example .env       # fill in Supabase URL/anon key and backend URL
npm install
npm run dev
```

The dev server runs at `http://localhost:5173/reeltrip/`. The frontend expects the travel-note backend at `VITE_API_URL` (defaults to `http://localhost:8000`) exposing `POST /travel-note`.

## Build & preview

```bash
npm run build    # tsc + vite build
npm run preview  # serves dist/ under /reeltrip/
```

## Deploy

`.github/workflows/deploy.yml` builds and publishes `dist/` to the `gh-pages` branch on every push to `main`/`master`. Set these repo secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

Enable GitHub Pages → source: `gh-pages` branch. App URL: `https://<user>.github.io/reeltrip/`.

## Domain model

- **Trip** — name (required), description, start/end dates, country.
- **POI** — travel-note response linked to one trip, with a user-assigned category (eat, sleep, see, do, save-money, transport, shop, other).

When you create a trip with a country, ReelTrip checks for POIs you saved with that country in other trips and offers to import them.
