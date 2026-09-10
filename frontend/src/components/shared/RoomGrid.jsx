// Room cards, shared: desktop detail panel is three-up, mobile sheet two-up.
// Open vs busy differ by fill AND text colour, so it survives grayscale.

// Tailwind scans for literal class strings -- `grid-cols-${columns}` would name
// a class that was never generated, and the grid would collapse to one column.
const COLUMN_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
}

export default function RoomGrid({
  rooms, variant, selectedRoom, onSelectRoom, empty, columns = 3,
}) {
  if (rooms.length === 0) {
    return <p className="text-[13px] text-[var(--text-muted)]">{empty}</p>
  }
  const isOpen = variant === "open"
  return (
    <div className={`grid gap-[10px] ${COLUMN_CLASS[columns] ?? COLUMN_CLASS[3]}`}>
      {rooms.map(({room, note}) => (
        <button
          key={room}
          type="button"
          onClick={() => onSelectRoom(room)}
          className={`rounded-[14px] px-[14px] py-[13px] text-left ${
            isOpen
              ? "bg-[var(--accent)] hover:bg-[var(--accent-dark)]"
              : "border border-[var(--neutral-fill)] bg-[var(--slot-bg)] hover:bg-[var(--neutral-fill)]"
          } ${selectedRoom === room ? "ring-2 ring-[var(--accent-dark)]" : ""}`}
        >
          <div className={`text-[19px] font-bold ${isOpen ? "text-white" : "text-[var(--text-faint)]"}`}>
            {room}
          </div>
          <div className={`mt-[3px] text-[11.5px] font-semibold ${isOpen ? "text-[var(--signal)]" : "text-[var(--text-faint)]"}`}>
            {note}
          </div>
        </button>
      ))}
    </div>
  )
}
