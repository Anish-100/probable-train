import { useState, useEffect } from 'react'
import BuildingCard from './BuildingCard.jsx'
import './App.css'

// Where the backend lives. Hardcoded for now; when we deploy we'll move this
// into an environment variable so dev and production can differ.
const API_URL = 'http://localhost:3001'

function App() {
  // THREE pieces of state — every data fetch has these three outcomes, and
  // the UI needs to show something sensible for each:
  const [buildings, setBuildings] = useState([])   // the data (empty until it arrives)
  const [loading, setLoading] = useState(true)     // true while the request is in flight
  const [error, setError] = useState(null)         // set if the request fails

  // useEffect runs AFTER the component has rendered to the screen.
  //
  // The second argument — the `[]` at the very bottom — is the "dependency
  // array". It controls WHEN the effect re-runs:
  //   [] (empty)     → run ONCE, after the first render. (what we want)
  //   [x, y]         → run again whenever x or y changes.
  //   (omitted)      → run after EVERY render. (the infinite-loop trap)
  //
  // We want to fetch exactly once when the page loads, so: [].
  useEffect(() => {
    // fetch() returns a Promise — a value that isn't ready yet. `async/await`
    // lets us write "wait for this, then continue" without nested callbacks.
    async function loadBuildings() {
      try {
        const response = await fetch(`${API_URL}/api/buildings`)
        if (!response.ok) {
          // The server responded, but with an error status (404, 500, ...).
          throw new Error(`Server responded ${response.status}`)
        }
        const data = await response.json()   // parse the JSON text into a JS array
        setBuildings(data)                   // <-- triggers a re-render with the data
      } catch (err) {
        // Network failure (server down) OR the throw above.
        setError(err.message)
      } finally {
        // Runs whether we succeeded or failed — either way, we're done loading.
        setLoading(false)
      }
    }

    loadBuildings()
  }, [])

  // While the three states resolve, render different UI for each. Returning
  // early keeps each case simple.
  if (loading) return <main className="app"><p>Loading buildings…</p></main>
  if (error) return <main className="app"><p>Error loading buildings: {error}</p></main>

  return (
    <main className="app">
      <h1>UCI Classroom Finder</h1>
      <p className="subtitle">{buildings.length} buildings loaded from the API</p>

      <ul className="building-list">
        {buildings.map((building) => (
          <BuildingCard
            key={building.id}
            code={building.code}
            name={building.name}
          />
        ))}
      </ul>
    </main>
  )
}

export default App
