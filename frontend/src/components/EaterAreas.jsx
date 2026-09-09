import { useState } from "react"
import Sidebar from "./Sidebar.jsx"
import BuildingList from "./BuildingList.jsx"
import EaterAreasMap from "./EaterAreasMap.jsx"
import CampusOverviewCard from "./CampusOverviewCard.jsx"
import BuildingDetailPanel from "./BuildingDetailPanel.jsx"
import RoomSchedulePanel from "./RoomSchedulePanel.jsx"
import { useBuildings } from "../hooks/useBuildings.js"
import { useAvailability } from "../hooks/useAvailability.js"
import { useSchedule } from "../hooks/useSchedule.js"
import { useTheme } from "../hooks/useTheme.js"
import { filterBuildings } from "../lib/buildings.js"
import { initialDay, initialTime } from "../lib/time.js"

// The shell. It owns all the state the design lists and hands slices of it to
// the panes; everything else -- the filtered list, the open/busy split, the
// week grid -- is DERIVED on render rather than stored. Availability is never
// state, matching the repo's busy-source pattern.
export default function EaterAreas() {
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

  return (
    <div className="grid h-full grid-cols-[372px_minmax(0,1fr)]">
      <Sidebar
        query={query}
        onQueryChange={setQuery}
        day={day}
        time={time}
        timeOpen={timeOpen}
        onToggleTime={() => setTimeOpen((open) => !open)}
        onDayChange={setDay}
        onTimeChange={setTime}
        theme={theme}
        onToggleTheme={toggleTheme}
      >
        <BuildingList
          buildings={visible}
          counts={counts}
          loading={loading}
          error={error || countsError}
          hasQuery={query.trim().length > 0}
          selected={selected}
          onSelect={(code) => { setSelected(code); setRoom(null) }}
        />
      </Sidebar>

      <main className="relative bg-[var(--map-ground)]">
        <EaterAreasMap building={selectedBuilding} theme={theme} />

        {!selectedBuilding && !hintDismissed && (
          <CampusOverviewCard onDismiss={() => setHintDismissed(true)} />
        )}

        {selectedBuilding && (
          <BuildingDetailPanel
            building={selectedBuilding}
            meetings={meetings}
            loading={scheduleLoading}
            error={scheduleError}
            day={day}
            time={time}
            selectedRoom={room}
            onSelectRoom={setRoom}
            onClose={() => { setSelected(null); setRoom(null) }}
          />
        )}

        {selectedBuilding && room && (
          <RoomSchedulePanel
            buildingCode={selectedBuilding.code}
            room={room}
            meetings={meetings}
            onClose={() => setRoom(null)}
          />
        )}
      </main>
    </div>
  )
}
