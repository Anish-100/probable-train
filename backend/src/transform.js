
const DAY_TOKENS = new Map(
   [ [0,'Su'],
    [1,'M'],
    [2,'Tu'],
    [3,'W'],
    [4,'Th'],
    [5,'F'],
    [6,'Sa']]
)

export function toMeeting(row){
    let {course_title:course, day_of_week:day, start_time, end_time, rooms} = row
    const {buildings, room_number} = rooms
    day = DAY_TOKENS.get(day)
    return{room:room_number, day, start_time, end_time, course}
}
// Buildings arrive from PostgREST with rooms nested as objects, because the
// embed selects a column: rooms: [{ room_number: "1300" }, ...]. The API
// contract says bare strings, so flatten here rather than in the route --
// transform.js is the one place DB shapes become API shapes.
export function toBuilding(row) {
    const {rooms = [], ...building} = row
    return {
        ...building,
        rooms: rooms
            .map(r => r.room_number)
            .sort((a, b) => a.localeCompare(b, undefined, {numeric: true})),
    }
}

// The inverse of DAY_TOKENS, derived from it rather than typed out again, so
// the M->1 numbering has exactly one definition. read_json.js writes
// day_of_week with this same numbering when it loads the WebSoc feed.
const DAY_NUMBERS = new Map([...DAY_TOKENS].map(([number, token]) => [token, number]))

export function toDayNumber(token) {
    return DAY_NUMBERS.get(token)
}

// A busy row identifies one room. Building code + bare room number is the key,
// because that is exactly how /api/buildings reports rooms -- so the two sides
// can be compared without any id lookup.
export function toBusyKey(row) {
    const {room_number, buildings} = row.rooms
    return `${buildings.code}:${room_number}`
}
