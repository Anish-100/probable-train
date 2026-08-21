import { useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css' // MapLibre's own CSS, for its controls

const UCI_CENTER = [-117.84280752284927,33.645908646827344]


const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'vector',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      bounds:[33.63303608292883, -117.84689300959077,33.65970377973178, -117.83259754399282],
      attribution: '© OpenStreetMap contributors'
    },
  },
  layers: [{ id: 'osm-tiles', type: 'vector', source: 'osm' }],
}

function MapView({ buildings }) {
  const containerRef = useRef(null) 
  const mapRef = useRef(null) 

  useEffect(() => {
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: UCI_CENTER,
      zoom: 10,
    })

    return () => {
      mapRef.current.remove()
      mapRef.current = null
    }
  }, []) 

  useEffect(() => {
    if (!mapRef.current) return

    const markers = buildings.map((building) =>
      new maplibregl.Marker()
        .setLngLat([building.longitude, building.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setText(
            `${building.code} — ${building.name}`,
          ),
        )
        .addTo(mapRef.current),
    )

    return () => markers.forEach((marker) => marker.remove())
  }, [buildings])

  return <div ref={containerRef} className="map" />
}

export default MapView
