// The backend API.
//
// This runs in Node — NOT in the browser. There is no `document` or `window`
// here. Its whole job is: receive an HTTP request, send back a response.

import express from 'express'
import cors from 'cors'

// `express()` creates the application object. Think of `app` as the switchboard
// that decides what to do with each incoming request.
const app = express()

const PORT = 3001

// Middleware: a function that every request passes THROUGH on its way to a
// route. `cors()` adds headers telling the browser "requests from other
// origins (like localhost:5173) are allowed." Without this, the fetch() we
// write in Step 4 would be blocked by the browser.
app.use(cors())

// Hardcoded for now — Step 5 replaces this with a real Supabase query.
// Same 6 buildings as supabase/seed.sql.
const buildings = [
  { id: 1, code: 'DBH', name: 'Donald Bren Hall',        latitude: 33.6438, longitude: -117.8412 },
  { id: 2, code: 'EH',  name: 'Engineering Hall',         latitude: 33.6432, longitude: -117.8425 },
  { id: 3, code: 'ELH', name: 'Engineering Lecture Hall', latitude: 33.6427, longitude: -117.8419 },
  { id: 4, code: 'STH', name: 'Steinhaus Hall',           latitude: 33.6460, longitude: -117.8433 },
  { id: 5, code: 'RH',  name: 'Rowland Hall',             latitude: 33.6467, longitude: -117.8446 },
  { id: 6, code: 'SSL', name: 'Social Science Lab',       latitude: 33.6449, longitude: -117.8460 },
]

// A ROUTE. Read it as: "when a GET request arrives for the path
// /api/buildings, run this function."
//
//   req = the incoming Request  (who asked, what for, any data they sent)
//   res = the outgoing Response (what we send back)
//
// `res.json(...)` converts the JavaScript array into JSON text and sends it
// with the header `Content-Type: application/json`.
app.get('/api/buildings', (req, res) => {
  res.json(buildings)
})

// A health-check route — handy for confirming the server is alive at a glance.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Nothing above actually opened a network connection. `listen` does: it binds
// to the port and starts waiting for requests. This keeps the process running
// (unlike a normal script, which would exit at the end of the file).
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
