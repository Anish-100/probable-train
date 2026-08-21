// The backend API.
//
// This runs in Node — NOT in the browser. There is no `document` or `window`
// here. Its whole job is: receive an HTTP request, send back a response.

import express from 'express'
import cors from 'cors'
import { supabase } from './db.js'

const app = express()
const PORT = 3001

app.use(cors())

app.get('/api/buildings', async (req, res) => {
  const { data, error } = await supabase
    .from('buildings')                            // FROM buildings
    .select('id, code, name, latitude, longitude') // SELECT these columns
    .order('code')                                 // ORDER BY code

  if (error) {
    // Log the real error server-side; send a clean 500 to the client.
    console.error('buildings query failed:', error.message)
    return res.status(500).json({ error: 'Failed to load buildings' })
  }

  res.json(data)
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
