import { SNAP } from "../../lib/sheet.js"

// The sheet chrome all three mobile screens share. Height is driven by app
// state, not by a drag gesture -- picking a building raises it, Close lowers it.

export default function BottomSheet({level, surface = "var(--surface)", onToggleLevel, children}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-[24px] shadow-[var(--shadow-lg)] transition-[height] duration-300 ease-out"
      style={{height: SNAP[level], background: surface}}
    >
      <button
        type="button"
        onClick={onToggleLevel}
        aria-label="Resize panel"
        // 44px tall so the grab area is tappable even though the pill is 5px.
        className="flex h-11 shrink-0 items-center justify-center pt-1"
      >
        <span className="h-[5px] w-10 rounded-full bg-[var(--scroll-thumb)]" />
      </button>
      {children}
    </div>
  )
}
