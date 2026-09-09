import { useEffect, useState } from "react"
import { fetchBuildingSchedule } from "../api.js"
import { QUARTER, YEAR } from "../lib/term.js"

// The whole term's meetings for one building, fetched on SELECT rather than on
// mount. Both the detail panel and the week panel read from this one result --
// opening a room's schedule is not a second request.
export function useSchedule(code) {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!code) {
      setMeetings([])
      return
    }
    let ignore = false
    setLoading(true)
    setError(null)
    fetchBuildingSchedule(code, YEAR, QUARTER)
      .then((rows) => { if (!ignore) setMeetings(rows) })
      .catch((err) => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [code])

  return {meetings, loading, error}
}
