import { useState } from "react"
import DesktopShell from "./desktop/DesktopShell.jsx"
import MobileShell from "./mobile/MobileShell.jsx"
import { useBuildings } from "../hooks/useBuildings.js"
import { useAvailability } from "../hooks/useAvailability.js"
import { useSchedule } from "../hooks/useSchedule.js"
import { useTheme } from "../hooks/useTheme.js"
import { useIsMobile } from "../hooks/useIsMobile.js"
import { filterBuildings } from "../lib/buildings.js"
import { initialDay, initialTime } from "../lib/time.js"

// Owns all the state and picks a layout; the two shells only arrange it. State
// living here is what keeps your building and time across a breakpoint flip.
export default function AntRooms() {
  const [query, setQuery] = useState("")
  // Passing the FUNCTION (not initialDay()) makes React call it once on the
  // first render only. Calling it inline would re-run `new Date()` on every
  // render and throw the result away.
  const [day, setDay] = useState(initialDay)
  const [time, setTime] = useState(initialTime)
  const [timeOpen, setTimeOpen] = useState(false)
  const [selected, setSelected] = useState(null)      // building code, or null
  const [room, setRoom] = useState(null)              // room number, or null
  const [hintDismissed, setHintDismissed] = useState(false)

  const {theme, toggleTheme} = useTheme()
  const {buildings, loading, error} = useBuildings()
  const {counts, error: countsError} = useAvailability(day, time)

  // Derived, not stored: recomputed on every keystroke, which is why there is
  // no search button to press.
  const visible = filterBuildings(buildings, query)
  const selectedBuilding = buildings.find((b) => b.code === selected) ?? null

  // Fetched on select, not on mount. Both panels read these same rows.
  const {meetings, loading: scheduleLoading, error: scheduleError} = useSchedule(selected)

  const isMobile = useIsMobile()

  const shellProps = {
    query, setQuery, day, setDay, time, setTime, timeOpen, setTimeOpen,
    selected, room, setRoom, hintDismissed, setHintDismissed, theme, toggleTheme,
    visible, selectedBuilding, counts, loading, meetings, scheduleLoading, scheduleError,
    listError: error || countsError,
    // Picking a building drops the room, or the old room's schedule shows under
    // the new building's name.
    selectBuilding: (code) => { setSelected(code); setRoom(null) },
    closeBuilding: () => { setSelected(null); setRoom(null) },
  }

  return isMobile ? <MobileShell {...shellProps} /> : <DesktopShell {...shellProps} />
}
