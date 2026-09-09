// Day/time vocabulary shared by the sidebar, the detail panel and the week grid.
// Kept out of the components so the M -> "Monday" mapping has one definition.

export const DAYS = [
  {token: "M",  label: "Mon", full: "Monday"},
  {token: "Tu", label: "Tue", full: "Tuesday"},
  {token: "W",  label: "Wed", full: "Wednesday"},
  {token: "Th", label: "Thu", full: "Thursday"},
  {token: "F",  label: "Fri", full: "Friday"},
]

// Week-grid geometry. Column height is (END_HOUR - START_HOUR) * HOUR_PX = 528px.
export const START_HOUR = 8
export const END_HOUR = 20
export const HOUR_PX = 44

// "13:00" or "13:00:00" -> 780. Seconds are ignored; classes start on the minute.
export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

// 780 -> "1:00 PM"
export function label12(mins) {
  const h24 = Math.floor(mins / 60)
  const m = mins % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`
}

// THE boundary conversion. The API sends times as "HH:MM:SS" strings; every
// comparison downstream is numeric. Convert once, on arrival -- a raw string
// reaching `min >= m.start_min` coerces to NaN, which makes every comparison
// false and every room silently report as empty. This repo has been bitten.
export function withMinutes(rows) {
  return rows.map((m) => ({
    ...m,
    start_min: toMinutes(m.start_time),
    end_min: toMinutes(m.end_time),
  }))
}

export function fullDayName(token) {
  return (DAYS.find((d) => d.token === token) || DAYS[0]).full
}

// "Tuesday, 1:00 PM"
export function formatNow(day, time) {
  return `${fullDayName(day)}, ${label12(toMinutes(time))}`
}

// Today, or Monday on a weekend. Date.getDay() is 0=Sunday.
export function initialDay() {
  const index = new Date().getDay()
  return index >= 1 && index <= 5 ? DAYS[index - 1].token : "M"
}

// Now, or 1:00 PM if now is outside the 8am-7pm window. Note this is a
// FALLBACK, not a clamp: 6am does not become 8am, it becomes 1pm.
export function initialTime() {
  const now = new Date()
  let mins = now.getHours() * 60 + now.getMinutes()
  if (mins < START_HOUR * 60 || mins > (END_HOUR - 1) * 60) mins = 13 * 60
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`
}
