// A component that renders ONE building.

function BuildingCard({ code, name }) {
  return (
    <li className="building-card">
      <span className="building-code">{code}</span>
      <span className="building-name">{name}</span>
    </li>
  )
}

export default BuildingCard
