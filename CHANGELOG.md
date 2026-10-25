# Changelog

## 2026-10-24 — Supabase → Firebase + erickmob-api, new domain

**Why:** the Supabase project behind ReelTrip (`dcpzormfxpnmimhqldmq`) had been deleted, and the AI backend at `transcriptor.erickmob.dev` stopped resolving when `erickmob.dev` was lost. The app could neither sign in nor process reels.

### Where things moved

| | Before | After |
|---|---|---|
| URL | `erickmobltda.github.io/reeltrip/` | **`https://reeltrip.erickmob.com`** (old URL redirects) |
| Login | Supabase Auth (password, sign-up, magic link) | Firebase Auth, project `erickmob-apps`, shared with the other apps. Password only; sign-up off (accounts are created in the Firebase console) |
| Data | Supabase Postgres `trips`, `pois`, `api_tokens` | Firestore `apps/reeltrip/users/{uid}/{trips,pois}` and `apps/reeltrip/api_tokens/{sha256}` |
| AI (`/travel-note`) | `transcriptor.erickmob.dev`, no auth | `https://api.erickmob.com/travel-note` ([erickmob-api](https://github.com/erickmobltda/erickmob-api)), requires the user's Firebase ID token |
| API tokens per trip | Supabase edge function `process-url` (code never committed, lost with the project) | `POST https://api.erickmob.com/reeltrip/process-url`, rebuilt in erickmob-api; token stored only as SHA-256 |
| Security rules | Postgres RLS | Firestore rules in erickmob-api `firebase/firestore.rules` |

### Changes

- `src/lib/firebase.ts` replaces `src/lib/supabase.ts`; hooks (`useAuth`, `useTrips`, `usePois`, `useApiTokens`) rewritten for Firestore.
- Firestore has no joins or cascading deletes: lists are sorted in the client, and deleting a trip deletes its POIs and API tokens in one batch.
- Magic link, sign-up and the auth callback page were removed.
- The API token dialog shows how to call `process-url`.
- Vite `base` is `/` and the deploy publishes a `CNAME` (`reeltrip.erickmob.com`).
- Repo secrets: `VITE_FIREBASE_*` and `VITE_API_URL=https://api.erickmob.com`; the Supabase ones were deleted.

### Data

Nothing to migrate: the old Supabase project no longer existed. The app started empty.

Commits: `28de2e4` (migration), `ae9fa18` (domain).
