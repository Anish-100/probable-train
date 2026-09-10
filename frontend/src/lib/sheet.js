// The heights the mobile bottom sheet rests at -- "detents", in the Material /
// Maps sense. Kept out of BottomSheet.jsx so that file exports only a component
// (Fast Refresh).
//
// `peek` is the collapsed state and is deliberately NOT zero: on a map app the
// sheet is the navigation, so one that vanishes completely leaves the user no
// way back to the list. The handle stays on screen at every height.
export const SNAP = {peek: "14%", list: "56%", detail: "78%", room: "88%"}

// The sheet's height in px, for the map padding that keeps the pin above it.
export function sheetHeightPx(level, viewportHeight) {
  return Math.round(viewportHeight * (parseInt(SNAP[level], 10) / 100))
}
