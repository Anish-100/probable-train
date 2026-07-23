# UCI Classroom Finder — Development & Deployment Plan

Build and ship in five phases: get the basics running end-to-end (local + deployed), add the real data and interactive map, polish the frontend experience, then two future-roadmap phases for larger additions.

---

## Part 1: Basics to Setup

### 1. Environment setup
- Node.js + npm, Docker Desktop, Supabase CLI (`npm install -g supabase`)
- `npx create-next-app@latest` with Tailwind for the frontend

### 2. Local database
- `supabase init` then `supabase start` — spins up Postgres, realtime, and auth locally in Docker, no cloud account needed yet
- Design tables: `rooms`, `schedule_cache` (the `claims` table is Phase 4 — see Future Changes)
- Migrations via `supabase/migrations` so schema is portable to the cloud later

### 3. Basic frontend shell — three-tier (Vite React + Node/Express + Supabase)

Stack changed from Next.js to a plain three-tier setup so the client/server boundary and data-fetching are explicit and learnable (see `architecture-decisions.md` → "Frontend stack"). Built teach-first, in small steps.

- **Frontend** — a **Vite + React** app (`frontend/`). React fundamentals: components, `useState`, `useEffect`, and an explicit `fetch()` to the backend.
- **Backend** — a small **Node/Express** API (`backend/`) exposing routes like `GET /api/buildings` that query Supabase with `@supabase/supabase-js`. Also the future home of the AnteaterAPI sync.
- **Database** — Supabase, unchanged (local at `http://127.0.0.1:54321`).
- **Map** — **MapLibre GL JS** (chosen over Leaflet to keep a path to 3D), rendering UCI building markers.
  - Start in **2D** using an inline OpenStreetMap raster style — no map-provider token needed, works immediately.
  - **TODO (later, Part 3 polish): upgrade to 3D.** Swap the OSM raster style for a vector style with building-height data (free MapTiler key) to get tilt/pitch + extruded 3D campus buildings. Same library, so it's a style swap, not a rewrite.

> Note: the original Next.js scaffold under `web/` is being retired in favor of `frontend/` + `backend/`. It remains recoverable in git history.

### 4. Get the pipeline live early
- Create the Supabase cloud project and a Vercel project now, even with placeholder data — connect the GitHub repo to Vercel (auto-deploys on push), push local migrations (`supabase link --project-ref <ref>` then `supabase db push`)
- Add environment variables in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Goal: a blank map is live on a real `*.vercel.app` URL before building any real features, so deployment isn't a mystery saved for the end

### 5. Exit criteria
- Local dev loop works, blank map deployed and reachable on Vercel, schema pushed to cloud Supabase

---

## Part 2: Interactive Features + Data

### 1. AnteaterAPI sync
- Standalone Node/Python script that fetches the registrar schedule and writes "official availability" into `schedule_cache`
- Run manually / on an interval while developing the parsing logic, then move into `/scripts/sync-schedule.js` and schedule via a GitHub Actions cron (`.github/workflows/sync.yml`, e.g. every 5–10 min) hitting the cloud Supabase instance with a service-role key (stored as a GitHub Secret, never exposed client-side)
- Alternative: Supabase Edge Functions with `pg_cron` if you'd rather keep it inside Supabase instead of GitHub

### 2. Live schedule dashboard
- Map markers colored by real availability pulled from `schedule_cache`, not placeholders
- Click a building/room to see its full-day availability and the gaps between classes

### 3. Interactivity
- Search/filter by building

### 4. RLS
- Public read access for `rooms` and `schedule_cache` in Supabase — no writes needed yet since claims are Phase 4

### 5. Exit criteria
- Real UCI schedule data flowing into the live deployed map, refreshing on the cron schedule, no manual data entry needed

---

## Part 3: Polishing Frontend Features

### 1. PWA
- Web manifest + service worker so the app is installable via "Add to Home Screen"; single Next.js codebase serves both desktop and mobile

### 2. Location
- Browser Geolocation API for opt-in "live location" (works on localhost as a secure context; needs real HTTPS — which Vercel provides by default — in production)
- "Nearest available classroom" layered on top of the map, not gating the core experience
- Test with `ngrok http 3000` (or your LAN IP) while walking around campus on a phone against the local dev server, then verify on the real Vercel deployment

### 3. Timer
- Countdown showing time left until the next class in a given room, shown in the per-room dashboard view

### 4. Visual/UX polish
- Responsive layout pass, loading/error states for the map and sync failures, general styling pass
- Optional: swap Leaflet/OpenStreetMap for Mapbox if nicer styling is wanted (`MAPBOX_TOKEN` as a Vercel env var — watch the free-tier usage cap)

### 5. Launch checklist
- [ ] Schedule sync reliable and monitored (GitHub Actions: 2,000 free minutes/month on public repos — a 5-min cron uses very little)
- [ ] Supabase free-tier limits checked (500MB DB, connection limits) against expected campus-scale usage
- [ ] PWA installs correctly on iOS/Android
- [ ] Soft-launch to a small group before wider rollout

---

## Part 4: Future Changes

Claims feature — a live "I am here" layer on top of the schedule. See `architecture-decisions.md` for full design rationale; summary below.

### 1. Schema
- New `claims` table: room, slot (1-hour, up to 1 week in advance), user, timestamp, auto-expire at slot end

### 2. Auth
- Supabase magic-link email, restricted to `@uci.edu` addresses — scoped only to the claim action; browsing stays open to everyone

### 3. Realtime
- Supabase Realtime subscription on the `claims` table so a claim/expiry propagates to every open client instantly, no polling
- Schedule layer stays on periodic fetch — don't spend realtime connection budget there

### 4. RLS
- Public read on `claims`, writes restricted to authenticated `@uci.edu` users

### 5. Open design questions
- Per-user cap on active/future claims (no-show/squatting risk from week-ahead reservations)
- Cancellation path for releasing a future claim before its slot arrives

---

## Part 5: Bigger Future Changes

Discord bot — pulls events from club Discords and marks classrooms as busy during those events.

### 1. Bot service
- Discord bots need a persistent connection, so they can't run as a Vercel serverless function
- `node bot.js`, deployed to Railway (free tier) or Fly.io (free allowance) — develop locally first, connecting to the Discord gateway directly from your machine

### 2. Data flow
- Bot writes directly into the cloud `schedule_cache`/`claims` tables using a Supabase service key, stored as a platform env secret

### 3. Deployment
- Set `DISCORD_TOKEN` and the Supabase service key as environment secrets on Railway/Fly.io
- Check current free-tier always-on hour limits before committing the bot to either platform

### 4. Other larger-scope ideas (unscoped, revisit later)
- Multi-campus support beyond UCI
- Native mobile app, if PWA limitations (e.g. iOS background location) become a real blocker