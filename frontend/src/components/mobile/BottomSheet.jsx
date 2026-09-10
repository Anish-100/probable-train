import { SNAP } from "../../lib/sheet.js"

// The sheet chrome all three mobile screens share. Height is driven by app
// state, not by a drag gesture -- picking a building raises it, the handle
// drops it to `peek`.
//
// `level` stays DERIVED from the selection; `collapsed` is separate state,
// because "the user pushed the sheet down" cannot be read off selected/room.
// Keeping them orthogonal is what lets the level rule stay true.

export default function BottomSheet({
  level,
  collapsed = false,
  surface = "var(--surface)",
  onToggleCollapsed,
  children,
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-[24px] shadow-[var(--shadow-lg)] transition-[height] duration-300 ease-out"
      style={{height: SNAP[collapsed ? "peek" : level], background: surface}}
    >
      <button
        type="button"
        onClick={onToggleCollapsed}
        // The label names what a tap DOES, not the current state -- a screen
        // reader reading "Collapsed" gives no clue the control is a toggle.
        aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        aria-expanded={!collapsed}
        // 44px tall so the grab area is tappable even though the pill is 5px.
        className="flex h-11 shrink-0 items-center justify-center pt-1"
      >
        <span className="h-[5px] w-10 rounded-full bg-[var(--scroll-thumb)]" />
      </button>
      {/* Rendered at every height, just clipped by overflow-hidden when peeking.
          Unmounting it would throw away the list's scroll position. */}
      {children}
    </div>
  )
}
