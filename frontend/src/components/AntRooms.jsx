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
  // "Get the panel out of my way" -- the sidebar on desktop, the sheet on
  // mobile. NOT derivable from selected/room, so it is the one piece of panel
  // state that is stored rather than computed. One flag serves both layouts:
  // on desktop the list is the only way to pick a building, so being collapsed
  // and selecting cannot happen there.
  const [collapsed, setCollapsed] = useState(false)

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
    query, day, setDay, time, setTime, timeOpen, setTimeOpen,
    selected, room, setRoom, hintDismissed, setHintDismissed, theme, toggleTheme,
    visible, selectedBuilding, counts, loading, meetings, scheduleLoading, scheduleError,
    listError: error || countsError,
    collapsed,
    toggleCollapsed: () => setCollapsed((down) => !down),
    // On mobile the search box floats ABOVE the sheet while the list is inside
    // it, so typing while collapsed would filter rows you cannot see.
    onQueryChange: (value) => { setQuery(value); setCollapsed(false) },
    // Picking a building drops the room, or the old room's schedule shows under
    // the new building's name. It also raises the panel: you asked to see it.
    selectBuilding: (code) => { setSelected(code); setRoom(null); setCollapsed(false) },
    closeBuilding: () => { setSelected(null); setRoom(null) },
  }

  return isMobile ? <MobileShell {...shellProps} /> : <DesktopShell {...shellProps} />
}
