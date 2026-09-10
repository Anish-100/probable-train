import { useSyncExternalStore } from "react"

// Below this the app renders the bottom-sheet layout instead of the 372px sidebar.
const QUERY = "(max-width: 767px)"

const query = window.matchMedia(QUERY)

function subscribe(onChange) {
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

// useSyncExternalStore, not useState + useEffect: an effect would render the
// desktop tree first and swap on the next frame, flashing a sidebar on a phone.
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => query.matches)
}
