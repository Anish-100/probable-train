import fs from 'node:fs/promises'
// This will be converted to a script that runs xx days

const quarter = 'Fall'
const year = 2026

const folder = './fixtures'
async function fetch_request(quarter,year){
    const res = await fetch(`https://anteaterapi.com/v2/rest/websoc?year=${year}&quarter=${quarter}`);
    return await res.json()
}
const data = await fetch_request(quarter, year)
await fs.writeFile(`${folder}/${quarter}_${year}`, JSON.stringify(data,null,2))
