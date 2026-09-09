import { useEffect, useState } from "react"
import { fetchAvailability } from "../api.js"
import { QUARTER, YEAR } from "../lib/term.js"

// Open-room counts for every building at one instant. Re-runs whenever the day
// or time changes -- that is the only thing that moves the numbers.
//
// The `ignore` flag is the important part. Dragging the time control fires a
// request per change, and responses can arrive OUT OF ORDER: the 13:00 request
// can resolve after the 14:00 one and overwrite it with stale counts. The
// cleanup runs before the next effect, so a superseded request lands with
// ignore === true and does nothing. Nothing here aborts the request itself;
// it just stops the answer from being believed.
export function useAvailability(day, time) {
  const [counts, setCounts] = useState(null)   // Map<code, open>, null until first load
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    setError(null)
    fetchAvailability(YEAR, QUARTER, day, time)
      .then((rows) => {
        if (ignore) return
        setCounts(new Map(rows.map((r) => [r.code, r.open])))
      })
      .catch((err) => { if (!ignore) setError(err.message) })
    return () => { ignore = true }
  }, [day, time])

  return {counts, error}
}
