import TimeEditor from "../shared/TimeEditor.jsx"
import { formatNow } from "../../lib/time.js"

// Search and the now bar float over the map. Only on screen 1 -- the taller
// sheets cover this area entirely.
export default function MobileTopBar({
  query, onQueryChange, day, time, timeOpen, onToggleTime, onDayChange, onTimeChange,
}) {
  return (
    <div className="absolute inset-x-4 top-[60px] z-10 flex flex-col gap-[10px]">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search a building or room number"
        className="min-h-12 w-full rounded-[15px] bg-[var(--surface)] px-4 text-[15px] shadow-[var(--shadow-md)] focus:outline-none"
      />

      <div className="flex min-h-12 items-center justify-between gap-[10px] rounded-[15px] bg-[var(--signal)] py-0 pr-2 pl-4 shadow-[var(--shadow-md)]">
        <div className="flex min-w-0 items-center gap-[9px]">
          {/* Dark ink on yellow in BOTH themes -- chosen against the bar. */}
          <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#16202c]" />
          <span className="truncate text-[15px] font-bold text-[#16202c]">{formatNow(day, time)}</span>
        </div>
        <button
          type="button"
          onClick={onToggleTime}
          className="min-h-11 shrink-0 rounded-full bg-[var(--pill-on-signal)] px-[14px] text-[13px] font-bold text-[var(--pill-on-signal-text)] hover:bg-[var(--pill-on-signal-hover)]"
        >
          {timeOpen ? "Done" : "Change"}
        </button>
      </div>

      {timeOpen && (
        <div className="rounded-[15px] bg-[var(--surface)] py-3 shadow-[var(--shadow-md)]">
          <TimeEditor day={day} time={time} onDayChange={onDayChange} onTimeChange={onTimeChange} />
        </div>
      )}
    </div>
  )
}
