
import express from 'express'
import cors from 'cors'
import { supabase } from './db.js'
import {toMeeting} from './transform.js'
const app = express()
const port = 3001

app.use(cors())

app.get('/api/buildings', async (req, res) => {
  const { data, error } = await supabase
    .from('buildings')                            // FROM buildings
    .select('id, code, name, lat:latitude, lng:longitude') // SELECT these columns
    .order('code')                                 // ORDER BY code

  if (error) {
    console.error('buildings query failed:', error.message)
    return res.status(500).json({ error: 'Failed to load buildings' })
  }
  return res.json(data)
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
  }
  return res.json(data.map(toMeeting))
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
});
