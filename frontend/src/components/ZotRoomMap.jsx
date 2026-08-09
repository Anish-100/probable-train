import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
 

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};
 
// Shows one pin where its the currently selected building. Green if it has empty
// rooms at the selected day/time, red if not, gray if we haven't searched

export default function ZotRoomMap({ lat, lng, buildingCode, status, emptyCount }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
 
  // Set up the map once when the component first mounts.
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_STYLE,
      center: [lng, lat],
      zoom: 16,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
    
  }, []);
 
  // Whenever the building or its availability changes, move the map and
  // redraw the marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
 
    map.flyTo({ center: [lng, lat], zoom: 16 });
 
    if (markerRef.current) markerRef.current.remove();
 
    const colors = {
      empty: "#10b981", // green
      busy: "#ef4444", // red
      unknown: "#94a3b8", // gray -- haven't searched yet
    };
 
    const el = document.createElement("div");
    el.style.width = "18px";
    el.style.height = "18px";
    el.style.borderRadius = "50%";
    el.style.border = "2px solid white";
    el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.4)";
    el.style.background = colors[status] || colors.unknown;
 
    const popupText =
      status === "empty"
        ? `${emptyCount} room${emptyCount === 1 ? "" : "s"} open in ${buildingCode} right now`
        : status === "busy"
        ? `No known-empty rooms in ${buildingCode} at that time`
        : `Hit "Find empty rooms" to check ${buildingCode}`;
 
    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ offset: 12 }).setText(popupText))
      .addTo(map);
  }, [lat, lng, buildingCode, status, emptyCount]);
 
  return (
    <div
      ref={mapContainer}
      className="w-full h-56 rounded-xl overflow-hidden border border-slate-200"
    />
  );
}

