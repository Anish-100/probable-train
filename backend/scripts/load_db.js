import { supabase } from "../src/db.js";
import { getBuildingsData, getAnteaterData } from "./read_json.js";


const buildings_list = await  getBuildingsData()
const classes_info = await getAnteaterData() 

const pad = (n) => String(n).padStart(2, '0')

const toTime = ({ hour, minute, second = 0 }) => {
    return `${pad(hour)}:${pad(minute)}:${pad(second)}`
}


async function buildBuildingsObject(){
    let buildingsValues = []
    for (const [code, info] of Object.entries(buildings_list)){
        console.log(code)
        buildingsValues.push({
            code:code,
            name:info.name,
            latitude: info.lat,
            longitude: info.lng
        })
    }
    return buildingsValues
}

async function buildRoomsObject(idByCode){
    const seen = new Map()
    for (const {bldg} of classes_info){
        const [building, room_no] = bldg.trim().split(" ")
        if(seen.has(bldg)) continue
        if (!idByCode.get(building)){
             console.error(` ${building} is not in the buildings database`)
             continue
            }
        seen.set(bldg, {building_id: idByCode.get(building), room_number:room_no})
    }
    return [...seen.values()]
}

async function buildClassMeetings(roomIdByCode, buildingIdByCode){
    let values = []
    for (const { bldg, day, courseId, startTime, endTime } of classes_info) {
        const[building, room_no] = bldg.trim().split(" ")
        const building_id = buildingIdByCode.get(building)
        const room_id = roomIdByCode.get((`${building_id}:${room_no}`))
        if (room_id == undefined) { console.log(` ${courseId} skipped`); continue;}

        values.push({
            room_id: room_id,
            term:"Fall 2026",
            course_title:courseId,
            day_of_week:day,
            start_time: toTime(startTime),
            end_time: toTime(endTime) 
        })
    } 
    await batchExport(values)
}
async function loadIntoSupabase(info, table_name) {
    const {data, error} =  await supabase
    .from(table_name)
    .insert(info)
    .select('id')
    if (error){
        console.error(`insert into ${table_name} failed`)
        return
    }
    console.log(`inserted into ${table_name} the relevant data`)
}

async function batchExport(values){
    const {data, error} =  await supabase
    .from('class_meetings')
    .delete().eq('term', 'Fall 2026')
    for(let i =0; i < values.length; i+=500){
        let end = i+500
        if (values.length < i+500){
            end = values.length
        }
        const {data, error} =  await supabase
        .from('class_meetings')
        .insert(values.slice(i,end))
        .select('id, room_id')
        if (error){
        console.error(`batch-inserting into class_meetings failed`)
        
        return
        }
    }
}


// Call when you want to insert all buildings from buildings.json into table buildings.


// await loadIntoSupabase(await buildBuildingsObject(), 'buildings')

// Call when you want to insert room_numbers in relation to buildings from buildings table


// const {data, error} = await supabase.from('buildings').select('id,code')
// if(error){
//     throw new Error(`Could not get data from buildings.`)
// }
// const idByCode = new Map(data.map(r => [r.code, r.id]))
// await loadIntoSupabase(await buildRoomsObject(idByCode), 'rooms')

const roomIdByCode = async ()=>{
    const {data,error} = await supabase.from('rooms').select('id,building_id, room_number')
    if(error){
        throw new Error(`Could not get data from rooms table.`)
    }
    console.log(data)
    return new Map(data.map((x)=>[(`${x.building_id}:${x.room_number}`), x.id]))

}

const buildingIdByCode = async ()=>{
    const {data, error} =  await supabase.from('buildings').select('id,code')
    if (error){
        throw new Error(`Could not get building info from buildings table`)
    }
    console.log(data)
    return new Map(data.map((x)=>[x.code, x.id]))
}

// Call when you want to insert class_meetings in relation to room_numbers
// await buildClassMeetings(await roomIdByCode(), await buildingIdByCode())
