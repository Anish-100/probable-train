import AntRoomsMap from "../shared/AntRoomsMap.jsx"
import ThemeToggle from "../shared/ThemeToggle.jsx"
import BottomSheet from "./BottomSheet.jsx"
import MobileTopBar from "./MobileTopBar.jsx"
import MobileBuildingSheet from "./MobileBuildingSheet.jsx"
import MobileDetailSheet from "./MobileDetailSheet.jsx"
import MobileRoomSheet from "./MobileRoomSheet.jsx"
import { sheetHeightPx } from "../../lib/sheet.js"

// The map is the ground and the sidebar is a bottom sheet. WHICH screen it
// shows is derived from existing state and never stored; whether the user has
// pushed it down to `peek` is the one thing that has to be stored, because no
// combination of selected/room implies it.
export default function MobileShell({
  query, onQueryChange, day, setDay, time, setTime, timeOpen, setTimeOpen,
  selected, selectBuilding, room, setRoom, closeBuilding, theme, toggleTheme,
  visible, selectedBuilding, counts, loading, listError,
  meetings, scheduleLoading, scheduleError, collapsed, toggleCollapsed,
}) {
  const level = !selectedBuilding ? "list" : room ? "room" : "detail"

  // Keeps the pin in the strip of map above the sheet. Read at render rather
  // than stored, so a rotation re-frames on the next paint. Collapsing has to
  // feed in here too, or dropping the sheet leaves the pin framed for the old
  // height and the extra map goes unused.
  const restingAt = collapsed ? "peek" : level
  const padding = {top: 0, right: 0, left: 0, bottom: sheetHeightPx(restingAt, window.innerHeight)}

  return (
    <div className="relative h-full overflow-hidden bg-[var(--map-ground)]">
      <AntRoomsMap building={selectedBuilding} theme={theme} padding={padding} />
      <ThemeToggle theme={theme} onToggle={toggleTheme} className="absolute top-[calc(env(safe-area-inset-top)+12px)] right-4 z-30" />

      {!selectedBuilding && (
        <MobileTopBar
          query={query}
          onQueryChange={onQueryChange}
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
        collapsed={collapsed}
        surface={level === "list" ? "var(--sidebar)" : "var(--surface)"}
        // The handle moves the sheet at every level; the X inside each sheet
        // is what closes the content. Previously the handle did the closing
        // and was inert on screen 1, which left the pill looking draggable
        // with nowhere to drag it.
        onToggleCollapsed={toggleCollapsed}
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
