# UCI Classroom Finder — Development & Deployment Plan

Build and test everything locally first, then migrate each piece to the cloud once it works end-to-end.

---

## Part 1: Local Development

### 1. Environment setup
- Node.js + npm, Docker Desktop, Supabase CLI (`npm install -g supabase`)
- `npx create-next-app@latest` with Tailwind for the frontend

### 2. Local database
- `supabase init` then `supabase start` — spins up Postgres, realtime, and auth locally in Docker, no cloud account needed yet
- Design tables: `rooms`, `schedule_cache`, `claims` (who claimed, timestamp, auto-expire)
- Migrations via `supabase/migrations` so schema is portable to the cloud later

### 3. AnteaterAPI sync script
- Standalone Node/Python script that fetches the registrar schedule and writes "official availability" into `schedule_cache`
- Run manually or with `setInterval`/local cron while developing the parsing logic
- Iterate fast without waiting on deploys

### 4. Frontend
- Next.js pages consuming local Supabase via `@supabase/supabase-js` pointed at `http://localhost:54321`
- Leaflet map with UCI building coordinates, colored markers for room status
- Browser Geolocation API for "live location" (works fine on localhost as a secure context)

### 5. Realtime claiming
- Use Supabase's local realtime channel to subscribe to `claims` table changes
- Test with two browser tabs to simulate two users claiming rooms

### 6. Discord bot
- `node bot.js` running locally, connects to Discord gateway directly from your machine
- Writes announcement data into the local Supabase Postgres

### 7. Multi-device / mobile testing
- Use `ngrok http 3000` (or your LAN IP) to test live location while walking around campus on your phone, hitting your local dev server

### 8. Exit criteria for "ready to deploy"
- Schema stable, sync job reliable, realtime claiming works across devices, timer logic correct

---

## Part 2: Cloud Deployment

### 1. Database & Realtime — Supabase (Cloud)
- Create a Supabase project (free tier: 500MB Postgres, realtime included)
- Push local migrations: `supabase link --project-ref <ref>` then `supabase db push`
- Move `rooms`, `schedule_cache`, and `claims` tables over as-is — no schema changes needed if local dev used Supabase CLI
- Set Row Level Security (RLS) policies:
  - Public read access for `rooms` and `schedule_cache`
  - Restrict writes to `claims` to authenticated UCI users (optional, via Supabase Auth + email domain check)
- Grab the project's `SUPABASE_URL` and `SUPABASE_ANON_KEY` for the frontend

### 2. Frontend + API Routes — Vercel
- Connect GitHub repo to Vercel (auto-deploys on push)
- Add environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Swap local Supabase URL for the cloud project URL
- Vercel free tier covers hosting, HTTPS, and CDN — good fit for Next.js

### 3. AnteaterAPI Sync Job — GitHub Actions (cron)
- Move the local sync script into `/scripts/sync-schedule.js`
- Add a GitHub Actions workflow (`.github/workflows/sync.yml`) running every 5–10 minutes:
  ```yaml
  on:
    schedule:
      - cron: '*/5 * * * *'
  ```
- Script connects to the cloud Supabase instance using a service-role key (stored as a GitHub Secret, never exposed client-side)
- Alternative: Supabase Edge Functions with `pg_cron` if you want everything inside Supabase instead of GitHub

### 4. Discord Bot — Railway or Fly.io
- Discord bots need a persistent connection, so they can't run as serverless functions
- Deploy `bot.js` to Railway (free tier) or Fly.io (free allowance)
- Set `DISCORD_TOKEN` and Supabase service key as environment secrets on the platform
- Bot writes directly into the cloud `claims`/`schedule_cache` tables

### 5. Maps
- Leaflet + OpenStreetMap tiles — no hosting change needed, works identically in prod
- If switching to Mapbox for nicer styling, add `MAPBOX_TOKEN` as a Vercel env variable and watch the free-tier usage cap

### 6. Domain & HTTPS
- Vercel provides a free `*.vercel.app` subdomain with HTTPS by default
- Optional: buy a custom domain and point it at Vercel (not required for geolocation — Vercel's HTTPS already satisfies that)

### 7. Monitoring & limits to watch
- Supabase free tier: 500MB database, limited monthly realtime connections — fine for campus scale, monitor as adoption grows
- GitHub Actions: 2,000 free minutes/month on public repos — a 5-min cron job uses minimal minutes
- Railway/Fly.io free tier: usually capped at a small number of always-on hours/month — check current limits before committing the bot here

### 8. Migration checklist
- [ ] Push Supabase migrations to cloud project
- [ ] Set RLS policies
- [ ] Update frontend env vars, deploy to Vercel
- [ ] Move sync script to GitHub Actions with secrets configured
- [ ] Deploy Discord bot to Railway/Fly.io
- [ ] Test full pipeline end-to-end on real UCI wifi/mobile data
- [ ] Soft-launch to a small group before wider rollout
