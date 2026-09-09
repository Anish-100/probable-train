import { useEffect, useState } from "react"
import { fetchBuildings } from "../api.js"

// Loads the building list once, on mount. It is static per quarter -- the
// backend caches it for 10 minutes -- so there is no dependency to re-run on.
export function useBuildings() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    fetchBuildings()
      .then((rows) => { if (!ignore) setData(rows) })
      .catch((err) => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  return {buildings: data, loading, error}
}
