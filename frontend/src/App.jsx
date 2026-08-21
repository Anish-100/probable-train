import { useState, useEffect } from 'react'
import BuildingCard from './BuildingCard.jsx'
import MapView from './MapView.jsx' 
import ZotRoom from './components/ZotRoom.jsx'
import './App.css'

// Where the backend lives. Hardcoded for now; when we deploy we'll move this
// into an environment variable so dev and production can differ.
const API_URL = 'http://localhost:3001'

function App() {

  const [buildings, setBuildings] = useState([])   // the data (empty until it arrives)
  const [loading, setLoading] = useState(true)     // true while the request is in flight
  const [error, setError] = useState(null)         // set if the request fails
  
  useEffect(() => {
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
  if (error) return (
  <main className="app">
    <p>Error loading buildings: {error}</p>
    <ZotRoom />
  </main>
)

  return (
    <main className="app">
      <h1>UCI Classroom Finder</h1>
      <p className="subtitle">{buildings.length} buildings loaded from the API</p>
      <div className="layout">
        <ul className="building-list">
          {buildings.map((building) => (
            <BuildingCard
              key={building.id}
              code={building.code}
              name={building.name}
            />
          ))}
        </ul>

        <MapView buildings={buildings} />
      </div>

     <ZotRoom /> 
    </main>
  )
}

export default App
