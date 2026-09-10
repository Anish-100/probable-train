// Shown only when nothing is selected, and only until dismissed. Once dismissed
// it stays gone for the session -- it does not come back when a building closes.
export default function CampusOverviewCard({onDismiss}) {
  return (
    <div className="absolute bottom-7 left-7 w-[330px] rounded-[18px] bg-[var(--surface)] px-[22px] py-5 shadow-[var(--shadow-lg)]">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-[var(--accent-dark)]">Campus overview</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mt-1 -mr-1 size-[26px] rounded-full border border-[var(--divider)] bg-[var(--ground)] text-[var(--text-faint)] hover:bg-[var(--neutral-fill)] hover:text-[var(--text-strong-muted)]"
        >
          ×
        </button>
      </div>
      <h4 className="mt-2 mb-[6px] text-xl font-bold">Pick a building to see open rooms</h4>
      <p className="text-[13.5px] leading-[1.5] text-[var(--text-muted)]">
        Search, or choose one from the list. We will mark it on the map and list
        every room the schedule knows about.
      </p>
    </div>
  )
}
