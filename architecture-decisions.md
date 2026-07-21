# Architecture & Design Decisions

Living record of decisions made while sharpening `personal_plan.md`. Pairs with `dev-and-deployment-plan.md` (the "how to build/ship it" doc) — this one is the "what and why."

---

## Base implementation (MVP)

Scope: a map + dashboard showing classroom availability from the official schedule only. No claims, no auth, no realtime layer — those are Phase 2 (see Future Roadmap below).

- **Data**: registrar schedule pulled from the Anteater API into `schedule_cache`, refreshed periodically via cron (e.g. every 5–10 min). This is the only source of truth for availability in the base build.
- **Auth**: none needed — the whole app is open/read-only.
- **Location**: opt-in, per-session, via browser Geolocation. Users can use the general map without ever granting it — "nearest available classroom" is a bonus layered on top, not a gate to the core feature.
- **Mobile**: PWA, not a native app. Single Next.js codebase serves both desktop and mobile; installable via "Add to Home Screen."
- **Deployment**: frontend + API routes on Vercel, database on Supabase, schedule sync via cron (GitHub Actions or Supabase `pg_cron`) — not on Vercel, since serverless functions aren't a good fit for long-lived/scheduled jobs.
- **Timeline**: ~2 months, solo.

---

## Data model: the "busy-source" pattern

The schema is built around one idea: **`rooms` is the complete universe of rooms, and everything else only ever marks a room as *busy*.** Availability is never stored — it is computed as a subtraction:

```
available rooms  =  all rooms  −  rooms with an active busy-row right now
```

A room is available *now* only if **no** busy-row from **any** source covers the current day/time for it. This mirrors the claims-layer decision below (claims always make a room *more* occupied, never contradict a class) — so there is never a conflict to resolve, just a union of busy-sources.

### Tables (base build)
- **`buildings`** — static reference data; `code` (e.g. `DBH`) is the registrar's natural key. Map coordinates (lat/lng) live here because the map plots **one pin per building**, not per room.
- **`rooms`** — every room; `(building_id, room_number)` is the natural key. This is the set the availability query subtracts from.
- **`class_meetings`** — busy-source #1. Scheduled classes, synced from the Anteater API. **One row per (class, day)**: `MWF 10–10:50` becomes 3 rows keyed on `day_of_week` + `start_time`/`end_time`. This is the single most important modeling choice — it makes the core "is room X free now?" query a plain `WHERE` clause with no array unpacking, and availability is the query the whole app runs constantly.
- **`club_events`** — busy-source #2. Same "room occupied for a time range" shape, but tied to a specific calendar **`date`** (one-off) rather than a recurring weekday. Populated later by the Discord bot (dev plan Part 5).

### Why separate tables instead of one `occupancies` table
Classes recur weekly (`day_of_week`); club events are one-off (`event_date`); claims (Phase 2) are authored live by users. Folding them together leaves half the columns null per row. Keeping them separate — each answering the same "does any row cover *now*?" question — is cleaner. The availability query `NOT EXISTS (class_meetings) AND NOT EXISTS (club_events)` simply gains a third `AND NOT EXISTS (claims)` when Phase 2 lands.

### Keys
Primary keys are `bigint generated always as identity` (simple, readable; availability data isn't sensitive). The load-bearing key on each table is the **natural/business key** (`buildings.code`, `rooms(building_id, room_number)`) — that's what the sync script upserts against so a 5-minute cron never creates duplicates.

### RLS
Every table ships with RLS enabled and a public `SELECT`-only policy from the start. The app is read-only to the public; all writes go through the service-role key in the sync script. This bakes in dev-plan Part 2 Step 4's "public read" intent up front rather than leaving a freshly-pushed cloud table world-writable via the anon key.

---

## Future roadmap: claims feature (Phase 2)

Deferred out of the base implementation — the map/schedule MVP should ship and work end-to-end first.

### What it adds
A live "I am here" layer on top of the schedule: students claim a room for a time slot, and that claim overlays the schedule layer (claims always make a room *more* occupied, never contradict a scheduled class — no conflict-resolution UI needed).

### Decisions made so far
- **Slot boundaries**: fixed clock hours (e.g. 2:00–3:00); revisit alignment to real UCI period boundaries as a later polish pass.
- **Claim horizon**: up to **one week in advance** — this makes a claim a *reservation*, not just a live presence signal (see caveat below).
- **Expiry**: claim auto-expires when its slot ends — no manual "leaving" action, no risk of a room stuck busy forever.
- **Auth**: Supabase magic-link email, restricted to `@uci.edu` addresses — scoped only to the claim action; browsing stays open to everyone.
- **Realtime**: Supabase Realtime subscription on the `claims` table so a claim/expiry propagates to every open client in ~100–300ms, no polling. (The schedule layer stays on periodic fetch — no reason to spend realtime connection budget there.)

### Caveat: week-ahead claims change the product surface
A same-day/current-slot claim is self-correcting and low-abuse. A week-ahead claim is a reservation and introduces:
- **No-shows** — a room can show "busy" for a slot nobody actually occupies.
- **Squatting** — one account can tie up many future slots across many rooms; makes the per-user claim cap (below) more important.
- **Cancellation** — needs a way to release a future claim early, or it sits until the slot passes.

### Still open (decide when Phase 2 starts)
1. **Abuse cap** — limit on total active/future claims per user (e.g. 3 at a time)?
2. **Cancellation UX** — how does a user release a future claim before its slot arrives?
3. **Anteater API specifics** — rate limits, auth key requirements, data freshness. Relevant to the base build too (schedule sync), not just claims.
