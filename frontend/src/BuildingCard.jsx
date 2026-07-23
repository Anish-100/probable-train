// A component that renders ONE building.
//
// `props` are the inputs a parent passes down — think of them as function
// arguments for components. The parent writes:
//
//     <BuildingCard code="DBH" name="Donald Bren Hall" />
//
// ...and React calls this function with an object:
//
//     { code: 'DBH', name: 'Donald Bren Hall' }
//
// The `{ code, name }` in the parameter list is plain JavaScript destructuring:
// it pulls those two keys out of that object so we can use them by name.
// Writing `function BuildingCard(props)` and then `props.code` would be
// identical — destructuring is just less typing.

function BuildingCard({ code, name }) {
  return (
    <li className="building-card">
      <span className="building-code">{code}</span>
      <span className="building-name">{name}</span>
    </li>
  )
}

export default BuildingCard
