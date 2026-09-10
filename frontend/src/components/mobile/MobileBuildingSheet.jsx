import BuildingList from "../shared/BuildingList.jsx"

// Screen 1's sheet body. BuildingList is reused verbatim -- it returns bare
// rows with no width of its own, so it drops into any scroll column.
export default function MobileBuildingSheet({
  buildings, counts, loading, error, hasQuery, selected, onSelect,
}) {
  return (
    <>
      <div className="flex items-baseline justify-between px-5 pt-2 pb-[10px]">
        <span className="text-[13px] font-bold text-[var(--text)]">
          {hasQuery ? "Matches" : "All buildings"}
        </span>
        <span className="text-[13px] font-semibold text-[var(--text-muted)]">Open</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-[7px] overflow-y-auto overscroll-contain px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <BuildingList
          buildings={buildings}
          counts={counts}
          loading={loading}
          error={error}
          hasQuery={hasQuery}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </>
  )
}
