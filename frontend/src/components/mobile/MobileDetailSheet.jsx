import RoomGrid from "../shared/RoomGrid.jsx"
import { splitRooms } from "../../lib/rooms.js"
import { label12, toMinutes } from "../../lib/time.js"

// Screen 2. Same data path as the desktop panel -- splitRooms against the
// building's own room list is what keeps "Open now" equal to the sidebar pill.
export default function MobileDetailSheet({
  building, meetings, loading, error, day, time, selectedRoom, onSelectRoom, onClose,
}) {
  const minute = toMinutes(time)
  const {open, busy} = splitRooms(building.rooms || [], meetings, day, minute)

  return (
    <>
      {/* White on the blue band in both themes -- chosen against the band. */}
      <header className="flex shrink-0 items-start justify-between gap-[14px] bg-[var(--accent)] px-5 py-[18px]">
        <div className="min-w-0">
          <h2 className="text-[30px] leading-tight font-extrabold text-white">{building.code}</h2>
          <p className="mt-[2px] truncate text-[14px] text-[var(--accent-tint)]">{building.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 rounded-full bg-white/16 px-[17px] text-[14px] font-bold text-white"
        >
          Close
        </button>
      </header>

      <div className="mx-5 my-4 grid shrink-0 grid-cols-2 gap-3">
        <div className="rounded-[15px] bg-[var(--signal)] px-[15px] py-[13px]">
          <div className="text-[13px] font-bold text-[#16202c]">Open now</div>
          <div className="text-[26px] leading-[1.2] font-extrabold text-[#16202c]">{open.length}</div>
        </div>
        <div className="rounded-[15px] bg-[var(--sidebar)] px-[15px] py-[13px]">
          <div className="text-[13px] font-semibold text-[var(--text-muted)]">In class</div>
          <div className="text-[26px] leading-[1.2] font-extrabold text-[var(--text-strong-muted)]">{busy.length}</div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        {error ? (
          <p className="text-[13px] text-[var(--text-muted)]">Could not load this building&rsquo;s schedule.</p>
        ) : loading ? (
          <p className="text-[13px] text-[var(--text-muted)]">Loading rooms&hellip;</p>
        ) : (
          <>
            <SectionLabel>Open at {label12(minute)}</SectionLabel>
            <RoomGrid
              rooms={open}
              variant="open"
              columns={2}
              selectedRoom={selectedRoom}
              onSelectRoom={onSelectRoom}
              empty="Every room this building has in the schedule is in class right now."
            />
            <hr className="mt-5 mb-4 border-0 border-t border-[var(--divider)]" />
            <SectionLabel>In class</SectionLabel>
            <RoomGrid
              rooms={busy}
              variant="busy"
              columns={2}
              selectedRoom={selectedRoom}
              onSelectRoom={onSelectRoom}
              empty="Nothing is in class here right now."
            />
          </>
        )}
      </div>
    </>
  )
}

function SectionLabel({children}) {
  return <h3 className="mb-[10px] text-[13px] font-semibold text-[var(--text-muted)]">{children}</h3>
}
