import RoomGrid from "../shared/RoomGrid.jsx"
import { splitRooms } from "../../lib/rooms.js"
import { label12, toMinutes } from "../../lib/time.js"

// Floats over the map at a fixed 452px -- the same 452 the map reserves as
// left padding when it flies to the pin.
export default function BuildingDetailPanel({
  building, meetings, loading, error, day, time, selectedRoom, onSelectRoom, onClose,
}) {
  const minute = toMinutes(time)
  const {open, busy} = splitRooms(building.rooms || [], meetings, day, minute)

  return (
    <div className="absolute top-5 bottom-5 left-5 flex w-[452px] flex-col overflow-hidden rounded-[20px] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
      {/* White on the blue band in both themes -- chosen against the band, not the theme. */}
      <header className="flex items-start justify-between gap-4 bg-[var(--accent)] px-6 pt-[22px] pb-5">
        <div className="min-w-0">
          <h2 className="text-[32px] leading-tight font-extrabold text-white">{building.code}</h2>
          <p className="mt-[2px] text-[13.5px] text-[var(--accent-tint)]">{building.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full bg-white/16 px-[14px] py-[7px] text-[13px] font-bold text-white hover:bg-white/30"
        >
          Close
        </button>
      </header>

      <div className="mx-6 my-[18px] grid grid-cols-2 gap-3">
        <div className="rounded-[14px] bg-[var(--signal)] px-4 py-[14px]">
          <div className="text-xs font-bold text-[#16202c]">Open now</div>
          <div className="text-[26px] font-extrabold text-[#16202c]">{open.length}</div>
        </div>
        <div className="rounded-[14px] bg-[var(--sidebar)] px-4 py-[14px]">
          <div className="text-xs font-semibold text-[var(--text-muted)]">In class</div>
          <div className="text-[26px] font-extrabold text-[var(--text-strong-muted)]">{busy.length}</div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-1 pb-[26px]">
        {error ? (
          <p className="text-[13px] text-[var(--text-muted)]">
            Could not load this building&rsquo;s schedule.
          </p>
        ) : loading ? (
          <p className="text-[13px] text-[var(--text-muted)]">Loading rooms&hellip;</p>
        ) : (
          <>
            <SectionLabel>Open at {label12(minute)}</SectionLabel>
            <RoomGrid
              rooms={open}
              variant="open"
              selectedRoom={selectedRoom}
              onSelectRoom={onSelectRoom}
              empty="Every room this building has in the schedule is in class right now."
            />

            <hr className="mt-[22px] mb-[18px] border-0 border-t border-[var(--divider)]" />

            <SectionLabel>In class</SectionLabel>
            <RoomGrid
              rooms={busy}
              variant="busy"
              selectedRoom={selectedRoom}
              onSelectRoom={onSelectRoom}
              empty="Nothing is in class here right now."
            />

            <p className="mt-5 text-xs text-[var(--text-muted)]">
              Choose any room to see its whole week.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function SectionLabel({children}) {
  return (
    <h3 className="mb-[10px] text-xs font-semibold text-[var(--text-muted)]">{children}</h3>
  )
}
