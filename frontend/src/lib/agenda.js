import { START_HOUR, END_HOUR, label12 } from "./time.js"

const DAY_START = START_HOUR * 60
const DAY_END = END_HOUR * 60

// One room's day as an ordered list of rows, with the gaps spelled out as their
// own "free" rows rather than left as empty space (the week grid's approach).
export function buildAgenda(meetings, room, day) {
  const classes = meetings
    .filter((m) => m.room === room && m.day === day)
    .sort((a, b) => a.start_min - b.start_min)

  const rows = []
  let cursor = DAY_START

  for (const m of classes) {
    // Registrar data can double-book a room; skipping anything already covered
    // keeps a negative-length gap from appearing.
    if (m.end_min <= cursor) continue
    if (m.start_min > cursor) {
      rows.push({
        kind: "free", start_min: cursor, end_min: m.start_min,
        label: `Free until ${label12(m.start_min)}`,
      })
    }
    rows.push({kind: "class", start_min: m.start_min, end_min: m.end_min, course: m.course})
    cursor = Math.max(cursor, m.end_min)
  }

  if (cursor < DAY_END) {
    rows.push({
      kind: "free", start_min: cursor, end_min: DAY_END,
      label: rows.length ? "Free for the rest of the day" : "Free all day",
    })
  }

  return rows
}
