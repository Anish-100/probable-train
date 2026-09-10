import { formatNow } from "../../lib/time.js"

// The yellow bar: what "now" the whole app is answering for, plus the escape
// hatch to change it. The BAR's own label is always #16202c -- chosen against
// the yellow behind it, not against the theme. The button is the exception:
// its chip inverts at night (dark with white text), so both its fill and its
// text come from tokens.
export default function NowBar({day, time, timeOpen, onToggle}) {
  return (
    <div className="mx-4 my-[14px] flex items-center justify-between gap-3 rounded-2xl bg-[var(--signal)] py-[13px] pr-[14px] pl-4">
      <div className="flex items-center gap-[10px]">
        <span className="size-[10px] shrink-0 rounded-full bg-[#16202c]" />
        <span className="text-[17px] font-bold whitespace-nowrap text-[#16202c]">
          {formatNow(day, time)}
        </span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="rounded-full bg-[var(--pill-on-signal)] px-3 py-[6px] text-[13px] font-bold text-[var(--pill-on-signal-text)] hover:bg-[var(--pill-on-signal-hover)]"
      >
        {timeOpen ? "Done" : "Change time"}
      </button>
    </div>
  )
}
