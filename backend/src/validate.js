// Skip a bad ROW (below), refuse a bad READ (validBuildings). Filter runs
// first, so "every row got skipped" still trips the fatal check.

// Unusable = presentable on neither surface: no code, no rooms, no coordinates.
// Today that is one row, HHCR. Dropping it here drops it from the counts too.
export function usableBuildings(list) {
  const kept = []
  const skipped = []

  for (const building of list) {
    if (!building?.code) {
      skipped.push({code: '(no code)', reason: 'row has no building code'})
    } else if (!Array.isArray(building.rooms)) {
      skipped.push({code: building.code, reason: 'no rooms array'})
    } else if (!Number.isFinite(building.lat) || !Number.isFinite(building.lng)) {
      skipped.push({
        code: building.code,
        reason: `no coordinates (lat=${building.lat}, lng=${building.lng})`,
      })
    } else {
      kept.push(building)
    }
  }

  return {kept, skipped}
}

export function validBuildings(list) {
  if (!Array.isArray(list)) return `expected an array, got ${typeof list}`
  // Empty table, revoked RLS and a wrong key all return [] with no error, and
  // a cached [] empties the sidebar for the whole TTL.
  if (list.length === 0) return 'zero buildings -- empty table, read was blocked, or every row was skipped'

  // Zero rooms anywhere makes every count 0 -- "nothing is open" as a fact.
  const roomCount = list.reduce((total, building) => total + building.rooms.length, 0)
  if (roomCount === 0) return 'no rooms on any building'

  return null
}

export function validCounts(list) {
  if (!Array.isArray(list)) return `expected an array, got ${typeof list}`
  if (list.length === 0) return 'zero availability rows -- every building would vanish from the list'

  for (const row of list) {
    if (typeof row?.code !== 'string' || !row.code) return 'an availability row has no code'
    // NaN, negative and fractional all render happily as a number in the pill.
    if (!Number.isInteger(row.open) || row.open < 0) {
      return `building ${row.code} has a non-count open value: ${row.open}`
    }
  }

  return null
}
