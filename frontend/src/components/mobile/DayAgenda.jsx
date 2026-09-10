import { useLayoutEffect, useRef } from "react"
import { buildAgenda } from "../../lib/agenda.js"
import { label12 } from "../../lib/time.js"

export default function DayAgenda({meetings, room, agendaDay, showNow, minute}) {
  const rows = buildAgenda(meetings, room, agendaDay)
  const scrollRef = useRef(null)
  const nowRef = useRef(null)

  // Opens on the current hour rather than the top of the day. NOT
  // scrollIntoView -- that scrolls every scrollable ancestor, dragging the sheet.
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (scrollRef.current && nowRef.current) {
        scrollRef.current.scrollTop = Math.max(0, nowRef.current.offsetTop - 12)
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [agendaDay, room])

  // Sits above the row you are currently in.
  const nowIndex = showNow ? rows.findIndex((r) => r.end_min > minute) : -1

  return (
    <div
      ref={scrollRef}
      className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto overscroll-contain px-5 pt-1 pb-[calc(20px+env(safe-area-inset-bottom))]"
    >
      {rows.map((row, i) => (
        <div key={`${row.kind}-${row.start_min}`} className="contents">
          {i === nowIndex && <NowMarker ref={nowRef} minute={minute} />}
          {row.kind === "class" ? <ClassRow row={row} /> : <FreeRow row={row} />}
        </div>
      ))}
      {nowIndex === -1 && showNow && <NowMarker ref={nowRef} minute={minute} />}

      <p className="mt-[6px] text-[12.5px] leading-[1.5] text-[var(--text-faint)]">
        Blocks are registrar class meetings. Club events and drop-in use are not shown.
      </p>
    </div>
  )
}

function NowMarker({ref, minute}) {
  return (
    <div ref={ref} className="flex items-center gap-[10px] py-[2px]">
      {/* Dark ink on yellow in both themes, like the now bar. */}
      <span className="rounded-full bg-[var(--signal)] px-[11px] py-[5px] text-[12px] font-bold whitespace-nowrap text-[#16202c]">
        Now &middot; {label12(minute)}
      </span>
      <span className="h-[2px] flex-1 bg-[var(--signal)]" />
    </div>
  )
}

const ROW = "grid min-h-16 grid-cols-[82px_minmax(0,1fr)] items-center gap-[14px] rounded-[15px] px-[14px] py-3"

function ClassRow({row}) {
  return (
    <div className={`${ROW} bg-[var(--accent)]`}>
      <span className="text-[13px] font-bold text-[var(--accent-tint)]">{label12(row.start_min)}</span>
      <span>
        <span className="block text-[15px] font-bold text-white">{row.course}</span>
        <span className="mt-[2px] block text-[12.5px] text-[var(--accent-tint)]">
          {label12(row.start_min)} &ndash; {label12(row.end_min)}
        </span>
      </span>
    </div>
  )
}

function FreeRow({row}) {
  return (
    <div className={`${ROW} bg-[var(--slot-bg)]`}>
      <span className="text-[13px] font-semibold text-[var(--text-muted)]">{label12(row.start_min)}</span>
      <span className="text-[14px] font-semibold text-[var(--text-strong-muted)]">{row.label}</span>
    </div>
  )
}
