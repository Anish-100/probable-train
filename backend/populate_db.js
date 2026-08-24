import fs from 'node:fs/promises';

const quarter='Fall'
const year=2026
const raw = await fs.readFile(`./fixtures/${quarter}_${year}`, {encoding:'utf8'});
const year_data = JSON.parse(raw)
for (let school of year_data.data.schools){
    console.log(school.schoolName);
}