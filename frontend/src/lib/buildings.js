// Case-insensitive substring match against the building code, the building
// name, and any room number in that building. The room-number half is why
// /api/buildings carries a `rooms` array -- without it, typing "1300" could
// not find DBH.
export function filterBuildings(buildings, query) {
  const q = query.trim().toLowerCase()
  if (!q) return buildings
  return buildings.filter(
    (b) =>
      b.code.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b.rooms || []).some((room) => room.toLowerCase().includes(q)),
  )
}
