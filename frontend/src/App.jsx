import ZotRoom from './components/ZotRoom.jsx'

// App is now just the mount point. The duplicate /api/buildings fetch that used
// to live here (against a hardcoded localhost URL) is gone -- ZotRoom already
// fetches buildings through src/api.js, which reads VITE_API_BASE.
function App() {
  return <ZotRoom />
}

export default App
