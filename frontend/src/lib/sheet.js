// The three heights the mobile bottom sheet rests at, from the mockup. Kept out
// of BottomSheet.jsx so that file exports only a component (Fast Refresh).
export const SNAP = {list: "56%", detail: "78%", room: "88%"}

// The sheet's height in px, for the map padding that keeps the pin above it.
export function sheetHeightPx(level, viewportHeight) {
  return Math.round(viewportHeight * (parseInt(SNAP[level], 10) / 100))
}
