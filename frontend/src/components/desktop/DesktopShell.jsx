import Sidebar from "./Sidebar.jsx"
import BuildingList from "../shared/BuildingList.jsx"
import AntRoomsMap from "../shared/AntRoomsMap.jsx"
import ThemeToggle from "../shared/ThemeToggle.jsx"
import CampusOverviewCard from "./CampusOverviewCard.jsx"
import BuildingDetailPanel from "./BuildingDetailPanel.jsx"
import RoomSchedulePanel from "./RoomSchedulePanel.jsx"
import SidebarTab from "./SidebarTab.jsx"

// The 372px sidebar beside a full-height map, or 0px and all map when
// collapsed. State lives in AntRooms.jsx; this file only arranges it.
export default function DesktopShell({
  query, onQueryChange, day, setDay, time, setTime, timeOpen, setTimeOpen,
  selected, selectBuilding, room, setRoom, closeBuilding,
  hintDismissed, setHintDismissed, theme, toggleTheme,
  visible, selectedBuilding, counts, loading, listError,
  meetings, scheduleLoading, scheduleError, collapsed, toggleCollapsed,
}) {
  return (
    // Animating the COLUMN rather than sliding the sidebar means the map
    // genuinely gets the width back and MapLibre's ResizeObserver picks it up.
    // overflow-hidden is what stops 372px of sidebar spilling over the map
    // while the column itself is 0px wide.
    <div
      className={`grid h-full overflow-hidden transition-[grid-template-columns] duration-300 ease-out ${
        collapsed ? "grid-cols-[0px_minmax(0,1fr)]" : "grid-cols-[372px_minmax(0,1fr)]"
      }`}
    >
      <Sidebar
        collapsed={collapsed}
        query={query}
        onQueryChange={onQueryChange}
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
        {/* No map padding to adjust: MapLibre measures padding inside the
            canvas, and the canvas is this <main>, so the 452px reserved for
            BuildingDetailPanel is right at either sidebar width. */}
        <SidebarTab open={!collapsed} onToggle={toggleCollapsed} />
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
