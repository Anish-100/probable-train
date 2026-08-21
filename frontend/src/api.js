const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export async function fetchBuildingSchedule(building, year, quarter) {
  const params = new URLSearchParams({ building, year, quarter });
  const res = await fetch(`${API_BASE}/api/schedule?${params.toString()}`);
  if (!res.ok) throw new Error(`Backend responded with ${res.status}`);
  const json = await res.json();
  return json;
} 

export async function fetchBuildings(){
  const res = await fetch(`${API_BASE}/api/buildings`);
  if(!res.ok) throw new Error(`Backend responded with ${res.status}`);
  const json = await res.json();
  return json;
}