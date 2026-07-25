// The map — our first component that hands a piece of the DOM to a NON-React
// library.
//
// React normally owns every node it creates: you describe what you want in JSX,
// React makes the real DOM match. MapLibre refuses to play that game. It wants
// a real <div>, and it will fill that div with a <canvas> and repaint it itself
// forever. So we strike a deal: React renders ONE empty div and then keeps its
// hands off. MapLibre owns everything inside it.

import { useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css' // MapLibre's own CSS, for its controls

// [longitude, latitude] — note the order!  MapLibre (and GeoJSON) put longitude
// FIRST. That's backwards from how you say it out loud ("33 north, 117 west")
// and backwards from our database columns (latitude, longitude). Swapping these
// silently drops you in the Indian Ocean; it is the classic first map bug.
const UCI_CENTER = [-117.8443, 33.6459]

// A "style" tells MapLibre what to draw. Usually this is a URL to a hosted style
// JSON, and usually that needs an API token. We inline a minimal one instead: a
// single raster source pointing straight at OpenStreetMap's tile server. No
// token, no account, no billing.
//
// Later, swapping this object for a MapTiler vector style URL is what unlocks
// 3D extruded buildings — and nothing else in this file has to change. That
// swap-ability is the entire reason we picked MapLibre over Leaflet.
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm' }],
}

function MapView({ buildings }) {
  // TWO refs doing two different jobs.
  //
  // A ref is a box whose `.current` you can read and write WITHOUT triggering a
  // re-render. That last part is the whole point: `useState` is for values the
  // UI renders, `useRef` is for values we need to remember between renders but
  // that React shouldn't react to.
  const containerRef = useRef(null) // job 1: a handle on the real <div> below
  const mapRef = useRef(null) // job 2: keep the map object alive across renders

  useEffect(() => {
    // This runs AFTER render, so the <div> below already exists in the DOM and
    // containerRef.current points at it. Before the first render it was null —
    // which is exactly why we can't build the map at the top of the component.
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: UCI_CENTER,
      zoom: 15,
    })

    // THE CLEANUP FUNCTION — this is the new idea.
    //
    // Returning a function from useEffect tells React: "call this when the
    // component unmounts, or before you re-run this effect." `.remove()` frees
    // the WebGL context and detaches the listeners MapLibre attached to window.
    //
    // This is not optional politeness. In dev, StrictMode deliberately runs the
    // whole cycle twice — build map, tear it down, build it again — precisely to
    // expose effects that don't clean up after themselves. Without this return,
    // you'd be left with two live maps fighting over one div, plus a leaked
    // WebGL context on every hot reload.
    return () => {
      mapRef.current.remove()
      mapRef.current = null
    }
  }, []) // [] = build the map once, on mount

  // SECOND effect: the markers.
  //
  // Why not just add them inside the effect above? Because the two answer
  // different questions about WHEN. The map is built once and never again — [].
  // The markers depend on `buildings`, which arrives later (the fetch in App.jsx
  // hasn't resolved on first render) and could change again. So this effect is
  // keyed to [buildings] and re-runs whenever that array is replaced.
  //
  // Effects run top-to-bottom, so by the time this one fires on mount, the
  // effect above has already put a map in mapRef.
  useEffect(() => {
    if (!mapRef.current) return

    // A Marker is a plain DOM element MapLibre positions over the canvas — not
    // part of the map "style". That's why we can add them immediately without
    // waiting for tiles to load.
    const markers = buildings.map((building) =>
      new maplibregl.Marker()
        // LONGITUDE FIRST — and our DB columns are the other way round, so this
        // line reads "backwards" on purpose. Get it wrong and every pin lands
        // off the coast of Africa.
        .setLngLat([building.longitude, building.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setText(
            `${building.code} — ${building.name}`,
          ),
        )
        .addTo(mapRef.current),
    )

    // Cleanup again — and here the need is obvious. Without it, every re-run
    // would ADD a fresh set of pins on top of the old ones, stacking duplicates
    // invisibly. We remove exactly the markers this run created.
    return () => markers.forEach((marker) => marker.remove())
  }, [buildings])

  // React renders exactly this and nothing more: one empty div. Every pixel you
  // actually see inside it was put there by MapLibre.
  return <div ref={containerRef} className="map" />
}

export default MapView
