// A tiny in-memory cache: a Map from key -> { value, expiresAt }.
//
// Why this is enough here: buildings and their room lists only change when the
// weekly AnteaterAPI sync runs, so serving a value up to a few minutes stale is
// free correctness. The cache lives in the Node process, which means it is empty
// again after a restart and a second server instance would keep its own copy.
// Both are fine for data that is already a week old by design.

const store = new Map()

// Returns the stored value if it is still fresh, otherwise awaits fn(), stores
// the result, and returns it. If fn() throws, nothing is stored, so the next
// request retries instead of caching a failure.
export async function getCached(key, ttlMs, fn) {
  const hit = store.get(key)
  if (hit && Date.now() < hit.expiresAt) return hit.value

  const value = await fn()
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}
