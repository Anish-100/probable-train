import { withMinutes } from "./lib/time.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export async function fetchBuildingSchedule(building, year, quarter) {
  const params = new URLSearchParams({ building, year, quarter });
  const res = await fetch(`${API_BASE}/api/schedule?${params.toString()}`);
  if (!res.ok) throw new Error(`Backend responded with ${res.status}`);
  const json = await res.json();
  // Normalize HERE, at the network boundary, so no caller can forget. Every
  // downstream comparison is numeric against start_min / end_min.
  return withMinutes(json);
}

export async function fetchBuildings(){
  const res = await fetch(`${API_BASE}/api/buildings`);
  if(!res.ok) throw new Error(`Backend responded with ${res.status}`);
  const json = await res.json();
  return json;
}

// One row per building: { code, open }. Every building comes back, including
// open: 0 -- the sidebar lists all 67 and renders "None" at zero.
export async function fetchAvailability(year, quarter, day, time) {
  const params = new URLSearchParams({ year, quarter, day, time });
  const res = await fetch(`${API_BASE}/api/availability?${params.toString()}`);
  if (!res.ok) throw new Error(`Backend responded with ${res.status}`);
  return res.json();
}
