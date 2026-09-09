import EaterAreas from './components/EaterAreas.jsx'

// App is now just the mount point. The duplicate /api/buildings fetch that used
// to live here (against a hardcoded localhost URL) is gone -- EaterAreas already
// fetches buildings through src/api.js, which reads VITE_API_BASE.
function App() {
  return <EaterAreas />
}

export default App
