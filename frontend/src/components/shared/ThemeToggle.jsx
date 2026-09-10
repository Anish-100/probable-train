// Floats over the map at the top right, in both layouts. The handoff requires
// an explicit toggle but does not design one, so the placement is ours.
export default function ThemeToggle({theme, onToggle, className = ""}) {
  const night = theme === "night"
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={night}
      // The icon shows the state you GET by tapping, not the state you are in.
      aria-label={night ? "Switch to day mode" : "Switch to night mode"}
      title={night ? "Switch to day mode" : "Switch to night mode"}
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-md)] hover:bg-[var(--neutral-fill)] ${className}`}
    >
      {night ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function MoonIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 1.5v2M12 20.5v2M3.6 3.6l1.4 1.4M19 19l1.4 1.4M1.5 12h2M20.5 12h2M3.6 20.4 5 19M19 5l1.4-1.4" />
    </svg>
  )
}
