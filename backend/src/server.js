
import express from 'express'
import cors from 'cors'
import { supabase } from './db.js'
import { getCached } from './cache.js'
import {toMeeting, toBuilding, toDayNumber, toBusyKey} from './transform.js'
const app = express()
const port = 3001

const BUILDINGS_TTL_MS = 10 * 60 * 1000   // 10 minutes
const AVAILABILITY_TTL_MS = 60 * 1000     // 1 minute

app.use(cors())

// The uncached query. Throws instead of returning { data, error } so that
// getCached() can tell success from failure and skip storing failures.
async function loadBuildings() {
  console.log('CACHE MISS: querying buildings from Supabase')
  const { data, error } = await supabase
    .from('buildings')                            // FROM buildings
    // rooms(room_number) follows the rooms.building_id foreign key and nests
    // each building's rooms inside its row -- still 67 top-level rows.
    .select('id, code, name, lat:latitude, lng:longitude, rooms(room_number)')
    .order('code')                                 // ORDER BY code

  if (error) throw new Error(`buildings query failed: ${error.message}`)
  return data.map(toBuilding)
}

app.get('/api/buildings', async (req, res) => {
  try {
    const buildings = await getCached('buildings', BUILDINGS_TTL_MS, loadBuildings)
    return res.json(buildings)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({ error: 'Failed to load buildings' })
  }
})

app.get('/api/schedule', async(req, res)=>{
  const {building, year, quarter} = req.query
  if(!building || !year || !quarter){
    return res.status(400).json({error: 'building, year and quarter are required'})
  }
  const {data,error} = await supabase
  .from('class_meetings')
  .select(`
    course_title, 
    day_of_week, 
    start_time,
    end_time,
    rooms!inner(room_number, buildings!inner(code))
    `)
  .eq('term',`${quarter} ${year}`)
  .eq('rooms.buildings.code', building.toUpperCase())
  if (error){
      console.error(`Error when fetching meetings data`)
      return res.status(500).json({ error: 'Failed to load buildings' })
  }
  return res.json(data.map(toMeeting))
});


// HH:MM or HH:MM:SS, 00-23 hours. Postgres will cast the string to `time` when
// it compares, so a malformed value would error inside the query instead of here.
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

app.get('/api/availability', async (req, res) => {
  const {year, quarter, day, time} = req.query
  if (!year || !quarter || !day || !time) {
    return res.status(400).json({error: 'year, quarter, day and time are required'})
  }
  const dayNumber = toDayNumber(day)
  if (dayNumber === undefined || dayNumber < 1 || dayNumber > 5) {
    return res.status(400).json({error: 'day must be one of M, Tu, W, Th, F'})
  }
  if (!TIME_PATTERN.test(time)) {
    return res.status(400).json({error: 'time must be HH:MM'})
  }

  try {
    // Every input is in the key. Leaving `time` out would serve the previous
    // time's counts while the user drags the slider -- a wrong number, not an error.
    const key = `availability:${quarter}-${year}-${day}-${time}`
    const counts = await getCached(key, AVAILABILITY_TTL_MS, async () => {
      // 1. The room universe: the same cached value /api/buildings serves. No query.
      const buildings = await getCached('buildings', BUILDINGS_TTL_MS, loadBuildings)

      // 2. The busy set: only meetings actually in class at this instant. A class
      //    running 13:00-13:50 is busy at 13:00 but free again at 13:50, hence
      //    lte on start and strict gt on end.
      const {data, error} = await supabase
        .from('class_meetings')
        .select('rooms!inner(room_number, buildings!inner(code))')
        .eq('term', `${quarter} ${year}`)
        .eq('day_of_week', dayNumber)
        .lte('start_time', time)
        .gt('end_time', time)

      if (error) throw new Error(`availability query failed: ${error.message}`)
      if (data.length >= 1000) {
        console.warn('availability: hit the PostgREST 1000-row cap; counts are too high')
      }

      const busy = new Set(data.map(toBusyKey))

      // Every building, including the ones with zero open rooms -- the sidebar
      // lists all 67 and shows "None" at zero. Dropping them makes buildings vanish.
      return buildings.map(building => ({
        code: building.code,
        open: building.rooms.filter(room => !busy.has(`${building.code}:${room}`)).length,
      }))
    })

    return res.json(counts)
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({error: 'Failed to load availability'})
  }
})


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
});
