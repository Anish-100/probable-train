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
