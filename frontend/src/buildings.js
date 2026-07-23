// Hardcoded building data — a stand-in for the real thing.
//
// These rows deliberately mirror `supabase/seed.sql`, so when we replace this
// file with a real fetch() from the backend (Step 4/5), the shape of the data
// won't change and the components won't need rewriting.

export const buildings = [
  { id: 1, code: 'DBH', name: 'Donald Bren Hall',        latitude: 33.6438, longitude: -117.8412 },
  { id: 2, code: 'EH',  name: 'Engineering Hall',         latitude: 33.6432, longitude: -117.8425 },
  { id: 3, code: 'ELH', name: 'Engineering Lecture Hall', latitude: 33.6427, longitude: -117.8419 },
  { id: 4, code: 'STH', name: 'Steinhaus Hall',           latitude: 33.6460, longitude: -117.8433 },
  { id: 5, code: 'RH',  name: 'Rowland Hall',             latitude: 33.6467, longitude: -117.8446 },
  { id: 6, code: 'SSL', name: 'Social Science Lab',       latitude: 33.6449, longitude: -117.8460 },
]
