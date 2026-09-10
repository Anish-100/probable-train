# AntRooms — mobile mockups (day + night)

Two files, three screens each:

- `AntRooms Mobile.dc.html` — day
- `AntRooms Mobile Night.dc.html` — night

Open either directly in a browser (keep the folder intact — the pages load
`support.js`, `ios-frame.jsx` and `_ds/` from beside them). An internet
connection is needed for Figtree, MapLibre and the OSM tiles.

## Screens

1. **Campus + building list** — search and the now bar float over the map;
   bottom sheet at 56%. No pins until a building is picked.
2. **Building detail** — sheet at 78%, map panned so the DBH pin stays visible
   in the strip above it. Room cards two-up.
3. **Room schedule** — sheet at 88%. The desktop five-day grid does not fit
   402px, so the week becomes a day picker over a single-day agenda.

## Room schedule opens at "now"

Screen 3 is scrolled to the current hour on open, not to the top of the day.
The agenda scroll container sets `scrollTop = nowMarker.offsetTop - 12` inside
a `requestAnimationFrame` (never `scrollIntoView`). A yellow `Now · 1:00 PM`
marker rule sits at the current time, the day picker preselects the day the now
bar shows (Tue), and free gaps are listed as their own rows rather than left as
empty space.

## Notes for implementation

- Every tap target is at least 44px.
- Maps are built from each element's ref callback, not on mount — the map divs
  live inside the device frame, which resolves asynchronously, so building them
  on mount silently does nothing.
- Night mode inverts the **tile canvas only**
  (`map.getCanvas().style.filter = "invert(1) hue-rotate(180deg) …"`), so the
  pin keeps its true `#0064a4`.
- Foregrounds are chosen against what is behind them, not against the theme:
  dark ink (`#16202c`) on the yellow now bar, Open-now stat and Now marker in
  both themes; white on the blue and navy bands in both themes.
- Tokens, type scale, radii and the API contract are all documented in the
  desktop handoff README.
