import { label12 } from "./time.js"

// Split a building's rooms into open and busy at one instant, with the note
// each card shows. The notes are COMPUTED from the same meeting rows, not
// decoration: "free till 2:00 PM" is the next class's start.
//
// `roomNumbers` is the building's room list from /api/buildings -- deliberately
// NOT the set of rooms that happen to appear in `meetings`. The backend counts
// open rooms against that same list, so using it here keeps the sidebar's pill
// and this panel's "Open now" stat as the same number. Deriving the universe
// from the meetings instead would quietly drop any room with no class this
// quarter, and the two numbers on screen would disagree.
export function splitRooms(roomNumbers, meetings, day, minute) {
  const byRoom = new Map()
  for (const m of meetings) {
    if (!byRoom.has(m.room)) byRoom.set(m.room, [])
    byRoom.get(m.room).push(m)
  }

  const open = []
  const busy = []

  for (const room of roomNumbers) {
    const today = (byRoom.get(room) || []).filter((m) => m.day === day)
    const current = today.find((m) => minute >= m.start_min && minute < m.end_min)

    if (current) {
      busy.push({room, note: `until ${label12(current.end_min)}`})
    } else {
      const next = today
        .filter((m) => m.start_min > minute)
        .sort((a, b) => a.start_min - b.start_min)[0]
      open.push({room, note: next ? `free till ${label12(next.start_min)}` : "free all day"})
    }
  }

  return {open, busy}
}
