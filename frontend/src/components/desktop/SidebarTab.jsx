// The chevron clinging to the map's left edge -- the only control that opens
// and closes the sidebar, so it must stay visible in both states. Lives in
// desktop/ because nothing in mobile/ or shared/ mounts it; mobile collapses
// with the sheet handle instead.
export default function SidebarTab({open, onToggle}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      // Names the action, not the state: "Sidebar collapsed" would not tell a
      // screen reader that pressing this changes anything.
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={open}
      // Half a pill: square against the map edge, rounded on the side that
      // faces the map. 44px tall to stay a comfortable pointer target.
      className="absolute top-1/2 left-0 z-10 flex h-11 w-[22px] -translate-y-1/2 items-center justify-center rounded-r-lg bg-[var(--surface)] text-[var(--text-muted)] shadow-[var(--shadow-md)] hover:text-[var(--accent)]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points={open ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
      </svg>
    </button>
  )
}
