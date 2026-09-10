import AntRoomsMap from "../shared/AntRoomsMap.jsx"
import ThemeToggle from "../shared/ThemeToggle.jsx"
import BottomSheet from "./BottomSheet.jsx"
import MobileTopBar from "./MobileTopBar.jsx"
import MobileBuildingSheet from "./MobileBuildingSheet.jsx"
import MobileDetailSheet from "./MobileDetailSheet.jsx"
import MobileRoomSheet from "./MobileRoomSheet.jsx"
import { sheetHeightPx } from "../../lib/sheet.js"

// The map is the ground and the sidebar is a bottom sheet. Which of the three
// heights it rests at is derived from existing state, never stored separately.
export default function MobileShell({
  query, setQuery, day, setDay, time, setTime, timeOpen, setTimeOpen,
  selected, selectBuilding, room, setRoom, closeBuilding, theme, toggleTheme,
  visible, selectedBuilding, counts, loading, listError,
  meetings, scheduleLoading, scheduleError,
}) {
  const level = !selectedBuilding ? "list" : room ? "room" : "detail"

  // Keeps the pin in the strip of map above the sheet. Read at render rather
  // than stored, so a rotation re-frames on the next paint.
  const padding = {top: 0, right: 0, left: 0, bottom: sheetHeightPx(level, window.innerHeight)}

  return (
    <div className="relative h-full overflow-hidden bg-[var(--map-ground)]">
      <AntRoomsMap building={selectedBuilding} theme={theme} padding={padding} />
      <ThemeToggle theme={theme} onToggle={toggleTheme} className="absolute top-[60px] right-4 z-30" />

      {!selectedBuilding && (
        <MobileTopBar
          query={query}
          onQueryChange={setQuery}
          day={day}
          time={time}
          timeOpen={timeOpen}
          onToggleTime={() => setTimeOpen((open) => !open)}
          onDayChange={setDay}
          onTimeChange={setTime}
        />
      )}

      <BottomSheet
        level={level}
        surface={level === "list" ? "var(--sidebar)" : "var(--surface)"}
        // The handle only toggles where there is somewhere to go: on screen 1
        // it swaps between more map and more list.
        onToggleLevel={level === "list" ? undefined : closeBuilding}
      >
        {level === "list" && (
          <MobileBuildingSheet
            buildings={visible}
            counts={counts}
            loading={loading}
            error={listError}
            hasQuery={query.trim().length > 0}
            selected={selected}
            onSelect={selectBuilding}
          />
        )}

        {level === "detail" && (
          <MobileDetailSheet
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

        {level === "room" && (
          <MobileRoomSheet
            buildingCode={selectedBuilding.code}
            room={room}
            meetings={meetings}
            day={day}
            time={time}
            onClose={() => setRoom(null)}
          />
        )}
      </BottomSheet>
    </div>
  )
}
