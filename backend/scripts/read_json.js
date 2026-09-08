import fs from 'node:fs/promises';
import path from 'node:path'


const dataDir = path.join(import.meta.dirname,'..','data')
const courseDataDir = path.join(import.meta.dirname,'..','data/course_data')


const days_code = new Map([['M',1],['Tu',2],['W',3],['Th',4],['F',5]])

async function uci_meetings_json(quarter, year){
    const raw = await fs.readFile(path.join(courseDataDir,`${quarter}_${year}.json`), {encoding:'utf8'});
    const year_data = JSON.parse(raw)
    let values = []
    for (let school of year_data.data.schools){
    for (let dep of school.departments){
        for (let courses of dep.courses){
            for (let sections of courses.sections){
                for (let meeting of sections.meetings){
                    if (meeting.timeIsTBA) continue
                    const split_days = splitDays(meeting.days)
                    for (let day of split_days){
                        for (let bldg of meeting.bldg){
                            if (bldg.trim()== "TBA" || bldg == 'ON LINE') continue
                            values.push({
                                courseId: courses.courseId,
                                startTime: meeting.startTime,
                                endTime: meeting.endTime,
                                bldg,
                                day,
                            })
                        }
                        
                    }
                }
            }
        }
    }
}
 return values;

}

function splitDays(days){
    let res = []
    let len_s = days.length
    let i = 0
    while (i < len_s){
        if (days_code.has(days[i])){
            res.push(days_code.get(days[i]))
        }
        if (days[i] == 'T'){
            res.push(days_code.get(days[i] +days[i+1]))
            i++;
        }
        i++;
    }
    return res

}

async function uci_buildings_json(){
    const raw = await (fs.readFile(path.join(dataDir, 'buildings.json'), {encoding:'utf8'}))
    const buildings_data = JSON.parse(raw)
    return buildings_data;

}
export function getAnteaterData(){
    return uci_meetings_json('Fall', 2026);
}

export async function getBuildingsData(){
    return await uci_buildings_json()
}