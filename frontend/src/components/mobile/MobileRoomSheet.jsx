import { useState } from "react"
import DayAgenda from "./DayAgenda.jsx"
import { DAYS, toMinutes } from "../../lib/time.js"
import { TERM_LABEL } from "../../lib/term.js"

// Screen 3. The desktop week grid does not fit 402px, so the week becomes a day
// picker over a single day.
export default function MobileRoomSheet({buildingCode, room, meetings, day, time, onClose}) {
  // Local, NOT the app's `day`: changing it must not re-run availability and
  // rewrite every count in the list behind the sheet.
  const [agendaDay, setAgendaDay] = useState(day)

  return (
    <>
      <header className="flex shrink-0 items-start justify-between gap-[14px] bg-[var(--accent-darkest)] px-5 py-[18px]">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-[var(--accent-on-dark)]">
            {buildingCode} &middot; {TERM_LABEL}
          </div>
          <h3 className="mt-1 text-[26px] leading-tight font-extrabold text-white">Room {room}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 rounded-full bg-white/16 px-[17px] text-[14px] font-bold text-white"
        >
          Close
        </button>
      </header>

      <div className="flex shrink-0 gap-2 px-5 pt-4 pb-[14px]">
        {DAYS.map(({token, label}) => {
          const on = token === agendaDay
          return (
            <button
              key={token}
              type="button"
              onClick={() => setAgendaDay(token)}
              aria-pressed={on}
              className={`min-h-[46px] flex-1 rounded-[13px] text-[14px] ${
                on
                  ? "bg-[var(--accent)] font-bold text-white"
                  : "bg-[var(--sidebar)] font-semibold text-[var(--text-strong-muted)]"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <DayAgenda
        meetings={meetings}
        room={room}
        agendaDay={agendaDay}
        showNow={agendaDay === day}
        minute={toMinutes(time)}
      />
    </>
  )
}
