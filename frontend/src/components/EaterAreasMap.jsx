import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

// Inline OSM raster style -- no API key, and the dense baked-in labelling that
// makes campus buildings easy to identify.
//
// NOTE: tile.openstreetmap.org is donation-run and its usage policy discourages
// production apps, so this is still deploy blocker #7. Vector alternatives were
// evaluated (see CLAUDE.md); this one was chosen deliberately for its look.
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
  layers: [{id: "osm", type: "raster", source: "osm"}],
}

const CENTER = [-117.8432, 33.6446]
const OVERVIEW_ZOOM = 15.4

// MapLibre is imperative and owns its own DOM, so React creates it once and
// then issues commands. There are NO markers until a building is selected;
// that was an explicit design decision, not an oversight.
export default function EaterAreasMap({building, theme}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  // What the map currently shows. Tracked on the instance rather than by
  // diffing previous props, so a re-render for any other reason does not
  // restart the camera animation.
  const appliedCodeRef = useRef(undefined)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: CENTER,
      zoom: OVERVIEW_ZOOM,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({showCompass: false}), "top-right")
    // MapLibre measures its container once, at construction. If the layout has
    // not settled by then it sizes the canvas to 0 and renders nothing --
    // a "working" map you cannot see.
    map.once("load", () => mapRef.current?.resize())

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
      appliedCodeRef.current = undefined
    }
  }, [])

  // Night basemap. The filter goes on the CANVAS, not the container: the pin
  // and the NavigationControl are sibling DOM elements, so inverting the
  // container would flip them too and the blue pin would come out orange.
  //
  // This is a stopgap for a raster basemap. A dark vector style would not need
  // it -- see CLAUDE.md.
  useEffect(() => {
    const canvas = mapRef.current?.getCanvas()
    if (!canvas) return
    canvas.style.filter =
      theme === "night"
        ? "invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.05) saturate(0.65)"
        : ""
  }, [theme])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const code = building?.code ?? null
    if (code === appliedCodeRef.current) return
    appliedCodeRef.current = code

    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    if (!building) {
      map.easeTo({center: CENTER, zoom: OVERVIEW_ZOOM, padding: {left: 0}, duration: 700})
      return
    }

    const el = document.createElement("div")
    el.textContent = building.code
    Object.assign(el.style, {
      font: "700 12px Figtree, system-ui, sans-serif",
      color: "#fff",
      background: "#0064a4",
      padding: "7px 11px",
      borderRadius: "999px",
      border: "2px solid #fff",
      boxShadow: "0 6px 18px rgba(22,32,44,0.28)",
      whiteSpace: "nowrap",
    })

    markerRef.current = new maplibregl.Marker({element: el})
      .setLngLat([building.lng, building.lat])
      .addTo(map)

    // padding.left reserves the 452px the detail panel occupies, so the pin
    // lands beside the panel rather than underneath it.
    map.easeTo({
      center: [building.lng, building.lat],
      zoom: 17,
      padding: {left: 452},
      duration: 800,
    })
  }, [building])

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />
}
