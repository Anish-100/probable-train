import { buildings } from './buildings.js'
import BuildingCard from './BuildingCard.jsx'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1>UCI Classroom Finder</h1>
      <p className="subtitle">{buildings.length} buildings (hardcoded for now)</p>

      <ul className="building-list">
        {/*
          `.map()` is ordinary JavaScript: it turns an array of 6 data objects
          into an array of 6 <BuildingCard /> elements. React knows how to render
          an array of elements — it just renders each one in order.

          `key` is React-specific and required for lists. It must be stable and
          unique per item (an id — NOT the array index). React uses it to track
          which item is which across re-renders, so when the list changes it can
          update just the row that moved instead of rebuilding all of them.
          Note that `key` is consumed by React itself — it does NOT show up
          inside BuildingCard's props.
        */}
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
