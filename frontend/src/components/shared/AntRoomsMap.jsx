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

// All four sides, always: MapLibre merges a partial padding object into the
// current one, so an omitted side keeps its old value instead of clearing.
const NO_PADDING = {top: 0, right: 0, bottom: 0, left: 0}
// Desktop reserves the 452px detail panel; mobile passes a `bottom` instead.
const DESKTOP_PADDING = {...NO_PADDING, left: 452}

// MapLibre is imperative and owns its own DOM, so React creates it once and
// then issues commands. There are NO markers until a building is selected;
// that was an explicit design decision, not an oversight.
export default function AntRoomsMap({building, theme, padding = DESKTOP_PADDING}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  // What the map currently shows. Tracked on the instance rather than by
  // diffing previous props, so a re-render for any other reason does not
  // restart the camera animation.
  const appliedCodeRef = useRef(undefined)
  const appliedPaddingRef = useRef(undefined)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: CENTER,
      zoom: OVERVIEW_ZOOM,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({showCompass: false}), "bottom-left")
    // MapLibre measures its container once, at construction. If the layout has
    // not settled by then it sizes the canvas to 0 and renders nothing --
    // a "working" map you cannot see.
    map.once("load", () => mapRef.current?.resize())

    // The breakpoint flip changes the container without a window resize event,
    // and MapLibre only listens for the latter.
    const observer = new ResizeObserver(() => mapRef.current?.resize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
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
    // Padding is in the guard too: raising the sheet re-frames the same pin.
    const paddingKey = JSON.stringify(padding)
    if (code === appliedCodeRef.current && paddingKey === appliedPaddingRef.current) return
    appliedCodeRef.current = code
    appliedPaddingRef.current = paddingKey

    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    if (!building) {
      map.easeTo({center: CENTER, zoom: OVERVIEW_ZOOM, padding: NO_PADDING, duration: 700})
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

    // Padding keeps the pin clear of whatever covers the map -- a panel on the
    // left for desktop, a sheet along the bottom for mobile.
    map.easeTo({
      center: [building.lng, building.lat],
      zoom: 17,
      padding,
      duration: 800,
    })
  }, [building, padding])

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />
}
