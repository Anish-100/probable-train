import { DAYS, END_HOUR, HOUR_PX, START_HOUR, label12 } from "../lib/time.js"
import { TERM_LABEL } from "../lib/term.js"

const COLUMN_HEIGHT = (END_HOUR - START_HOUR) * HOUR_PX   // 528px
const DAY_START_MIN = START_HOUR * 60                     // 480

// The week grid. Positions are computed from minutes, not from a table layout:
// every block is absolutely placed inside its day column, which is what lets a
// 9:00-9:50 class and a 9:30-10:45 class overlap visually instead of pushing
// each other around.
//
// No new fetch -- these are the same rows the detail panel already has.
export default function RoomSchedulePanel({buildingCode, room, meetings, onClose}) {
  const forRoom = meetings.filter((m) => m.room === room)

  return (
    <div className="absolute top-5 bottom-5 left-[488px] w-[560px] max-w-[calc(100%-508px)]">
      <div className="flex h-full flex-col overflow-hidden rounded-[20px] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
        <header className="flex items-start justify-between gap-4 bg-[var(--accent-darkest)] px-[26px] pt-[22px] pb-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--accent-on-dark)]">
              {buildingCode} &middot; {TERM_LABEL}
            </p>
            <h3 className="mt-[5px] text-[26px] font-extrabold text-white">Room {room}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-white/16 px-[14px] py-[7px] text-[13px] font-bold text-white hover:bg-white/30"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-auto px-[26px] pt-5 pb-6">
          <div className="grid gap-[6px]" style={{gridTemplateColumns: `58px repeat(5, minmax(0, 1fr))`}}>
            <div />
            {DAYS.map((d) => (
              <div key={d.token} className="pb-2 text-xs font-semibold text-[var(--text-muted)]">
                {d.label}
              </div>
            ))}

            <HourGutter />
            {DAYS.map((d) => (
              <DayColumn
                key={d.token}
                meetings={forRoom.filter((m) => m.day === d.token)}
              />
            ))}
          </div>

          <p className="mt-4 text-xs text-[var(--text-faint)]">
            Blocks are registrar class meetings. Club events and drop-in use are not shown.
          </p>
        </div>
      </div>
    </div>
  )
}

function HourGutter() {
  const hours = Array.from({length: END_HOUR - START_HOUR}, (_, i) => START_HOUR + i)
  return (
    <div className="relative" style={{height: COLUMN_HEIGHT}}>
      {hours.map((hour) => (
        <span
          key={hour}
          className="absolute right-[10px] -translate-y-[6px] text-[11px] text-[var(--text-faint)]"
          style={{top: (hour - START_HOUR) * HOUR_PX}}
        >
          {label12(hour * 60).replace(":00", "")}
        </span>
      ))}
    </div>
  )
}

function DayColumn({meetings}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-[var(--slot-bg)]"
      style={{
        height: COLUMN_HEIGHT,
        backgroundImage: `repeating-linear-gradient(to bottom, var(--divider) 0, var(--divider) 1px, transparent 1px, transparent ${HOUR_PX}px)`,
      }}
    >
      {meetings.map((m, i) => (
        <div
          key={`${m.course}-${m.start_min}-${i}`}
          className="absolute right-1 left-1 overflow-hidden rounded-[10px] bg-[var(--accent)] px-2 py-[6px]"
          style={{
            top: ((m.start_min - DAY_START_MIN) / 60) * HOUR_PX,
            // A 50-minute class is only 36px tall, too short for two lines of
            // text, so clamp the height rather than let the label overflow.
            height: Math.max(26, ((m.end_min - m.start_min) / 60) * HOUR_PX - 2),
          }}
        >
          <div className="text-xs leading-[1.2] font-bold text-white">{m.course}</div>
          <div className="text-[10.5px] leading-[1.3] text-[var(--accent-tint)]">
            {label12(m.start_min)} &ndash; {label12(m.end_min)}
          </div>
        </div>
      ))}
    </div>
  )
}
