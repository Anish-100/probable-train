// The scrolling list of buildings. Presentational: it receives an ALREADY
// filtered list and a code -> open-count Map, and renders. No fetching here.
export default function BuildingList({
  buildings, counts, loading, error, hasQuery, selected, onSelect,
}) {
  if (error) {
    return (
      <p className="mx-3 my-2 text-[13px] text-[var(--text-muted)]">
        Could not load buildings. Is the API running?
      </p>
    )
  }

  if (loading) return <SkeletonRows />

  if (buildings.length === 0) {
    return (
      <p className="mx-3 my-2 text-[13px] text-[var(--text-muted)]">
        {hasQuery
          ? "No building or room matches that. Try a code like DBH, or a room number like 1300."
          : "No buildings in the schedule yet."}
      </p>
    )
  }

  return buildings.map((b) => (
    <BuildingRow
      key={b.code}
      building={b}
      open={counts?.get(b.code)}
      isSelected={selected === b.code}
      onSelect={() => onSelect(b.code)}
    />
  ))
}

function BuildingRow({building, open, isSelected, onSelect}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border px-[14px] py-3 text-left ${
        isSelected
          ? "border-[var(--accent)] bg-[var(--row-hover)]"
          : "border-[var(--card-border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--row-hover)]"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-bold">{building.code}</span>
        <span className="block truncate text-[12.5px] text-[var(--text-muted)]">
          {building.name}
        </span>
      </span>
      <CountPill open={open} />
    </button>
  )
}

// Availability is never signalled by color alone: the count is a numeral, and
// zero is the word "None" rather than a differently-colored number.
function CountPill({open}) {
  if (open === undefined) {
    return <span className="rounded-full bg-[var(--neutral-fill-alt)] px-[11px] py-[5px] text-[13px] font-bold text-[var(--text-faint)]">—</span>
  }
  if (open === 0) {
    return <span className="rounded-full bg-[var(--neutral-fill-alt)] px-[11px] py-[5px] text-[13px] font-bold whitespace-nowrap text-[var(--text-faint)]">None</span>
  }
  return <span className="rounded-full bg-[var(--accent)] px-[11px] py-[5px] text-[13px] font-bold whitespace-nowrap text-white">{open}</span>
}

function SkeletonRows() {
  return Array.from({length: 8}, (_, i) => (
    <div
      key={i}
      className="h-[62px] shrink-0 animate-pulse rounded-[14px] border border-[var(--card-border)] bg-[var(--surface)]"
    />
  ))
}
