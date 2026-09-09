
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