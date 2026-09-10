import Sidebar from "./Sidebar.jsx"
import BuildingList from "../shared/BuildingList.jsx"
import AntRoomsMap from "../shared/AntRoomsMap.jsx"
import ThemeToggle from "../shared/ThemeToggle.jsx"
import CampusOverviewCard from "./CampusOverviewCard.jsx"
import BuildingDetailPanel from "./BuildingDetailPanel.jsx"
import RoomSchedulePanel from "./RoomSchedulePanel.jsx"

// The 372px sidebar beside a full-height map. State lives in AntRooms.jsx; this
// file only arranges it.
export default function DesktopShell({
  query, setQuery, day, setDay, time, setTime, timeOpen, setTimeOpen,
  selected, selectBuilding, room, setRoom, closeBuilding,
  hintDismissed, setHintDismissed, theme, toggleTheme,
  visible, selectedBuilding, counts, loading, listError,
  meetings, scheduleLoading, scheduleError,
}) {
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
      >
        <BuildingList
          buildings={visible}
          counts={counts}
          loading={loading}
          error={listError}
          hasQuery={query.trim().length > 0}
          selected={selected}
          onSelect={selectBuilding}
        />
      </Sidebar>

      <main className="relative bg-[var(--map-ground)]">
        <AntRoomsMap building={selectedBuilding} theme={theme} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} className="absolute top-5 right-5 z-10" />

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
            onClose={closeBuilding}
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
