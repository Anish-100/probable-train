import NowBar from "./NowBar.jsx"
import TimeEditor from "../shared/TimeEditor.jsx"

// Layout for the 372px left pane. It owns the chrome (brand, now bar, time
// editor, search, section header, footer) and leaves the scrolling list itself
// to `children`, so the list can grow without this file growing with it.
//
// min-h-0 on both this column and the scroll area is what makes the LIST
// scroll instead of the page: a flex child's default min-height is auto, which
// refuses to shrink below its content, so the overflow escapes upward.
export default function Sidebar({
  query, onQueryChange,
  day, time, timeOpen, onToggleTime, onDayChange, onTimeChange,
  theme, onToggleTheme,
  children,
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col bg-[var(--sidebar)]">
      <div className="brand-band flex items-start justify-between gap-3 rounded-br-[22px] bg-[var(--accent-darkest)] px-6 pt-6 pb-[22px]">
        <div>
          {/* White on the navy band in BOTH themes -- chosen against the band,
              not against the theme, so it is not tokenized. */}
          <h1 className="text-[30px] font-extrabold text-white">
            Ant<span className="text-[var(--signal)]">Rooms</span>
          </h1>
          <p className="mt-1 text-[13px] text-[var(--accent-on-dark)]">
            Open classrooms at UCI, right now
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-pressed={theme === "night"}
          className="shrink-0 rounded-full bg-white/16 px-3 py-[6px] text-xs font-bold text-white hover:bg-white/30"
        >
          {theme === "night" ? "Day" : "Night"}
        </button>
      </div>

      <NowBar day={day} time={time} timeOpen={timeOpen} onToggle={onToggleTime} />
      {timeOpen && (
        <TimeEditor
          day={day}
          time={time}
          onDayChange={onDayChange}
          onTimeChange={onTimeChange}
        />
      )}

      <div className="px-4 pb-[14px]">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search a building or room number"
          className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--surface)] px-[14px] py-[11px] text-sm focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      <div className="flex items-baseline justify-between px-6 pb-[10px] text-xs font-semibold text-[var(--text-muted)]">
        <span>{query.trim() ? "Matches" : "All buildings"}</span>
        <span>Open</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[6px] overflow-y-auto px-3 pb-3">
        {children}
      </div>

      <p className="border-t border-[var(--divider)] px-6 pt-[14px] pb-[18px] text-xs leading-[1.5] text-[var(--text-faint)]">
        Availability comes from the registrar schedule. A room with no classes
        all quarter never shows up in that data, so it is not listed here.
      </p>
    </aside>
  )
}
