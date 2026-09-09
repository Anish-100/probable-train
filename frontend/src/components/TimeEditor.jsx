import { DAYS } from "../lib/time.js"

// Shown only while the now bar is toggled open. Two controls, no submit --
// changing either one re-derives the whole sidebar on the next render.
export default function TimeEditor({day, time, onDayChange, onTimeChange}) {
  return (
    <div className="mx-4 mb-[14px] grid grid-cols-2 gap-3">
      <Field label="Day">
        <select
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
          className="w-full rounded-[10px] border border-[var(--input-border)] bg-[var(--surface)] px-[10px] py-[9px] text-sm focus:border-[var(--accent)] focus:outline-none"
        >
          {DAYS.map((d) => (
            <option key={d.token} value={d.token}>{d.full}</option>
          ))}
        </select>
      </Field>
      <Field label="Time">
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full rounded-[10px] border border-[var(--input-border)] bg-[var(--surface)] px-[10px] py-[9px] text-sm focus:border-[var(--accent)] focus:outline-none"
        />
      </Field>
    </div>
  )
}

function Field({label, children}) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-xs font-semibold text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  )
}
