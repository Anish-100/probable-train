import { useState } from "react";
import { fetchBuildingSchedule } from "../api";
import ZotRoomMap from "./ZotRoomMap";

// ---------------------------------------------------------------------------
// ZotRoom - find empty classrooms at UCI
//
// Talks to Anish's backend (GET /api/schedule), not the Anteater API directly.
// Each meeting row is expected to look like:
//   { room, days: ["M","W"], start_min, end_min, course, section_type, instructor }
// where start_min/end_min are minutes since midnight (e.g. 9:00am = 540).
//

// ---------------------------------------------------------------------------

const BUILDINGS = [
  { code: "DBH", name: "Donald Bren Hall", lat: 33.6428, lng: -117.8443 },
  { code: "ICS", name: "ICS Building", lat: 33.6432, lng: -117.8421 },
  { code: "ALP", name: "Anteater Learning Pavilion", lat: 33.6461, lng: -117.8427 },
  { code: "HH", name: "Humanities Hall", lat: 33.6417, lng: -117.8441 },
  { code: "HIB", name: "Humanities Instructional Building", lat: 33.6415, lng: -117.8436 },
  { code: "SSL", name: "Social Sciences Lab", lat: 33.6409, lng: -117.8425 },
  { code: "SST", name: "Social Science Tower", lat: 33.6407, lng: -117.8422 },
  { code: "RH", name: "Rowland Hall", lat: 33.6412, lng: -117.8410 },
  { code: "PCB", name: "Physical Sciences Classroom Building", lat: 33.6440, lng: -117.8410 },
  { code: "PSLH", name: "Physical Sciences Lecture Hall", lat: 33.6438, lng: -117.8407 },
  { code: "MPAA", name: "Multipurpose Science & Tech Bldg", lat: 33.6454, lng: -117.8443 },
  { code: "ET", name: "Engineering Tower", lat: 33.6440, lng: -117.8378 },
  { code: "EH", name: "Engineering Hall", lat: 33.6437, lng: -117.8382 },
];

// Fallback center (roughly the middle of campus) used when someone types a
// custom building code we don't have coordinates for.
const CAMPUS_CENTER = { lat: 33.6405, lng: -117.8443 };

const DAYS = [
  { token: "M", label: "Monday" },
  { token: "Tu", label: "Tuesday" },
  { token: "W", label: "Wednesday" },
  { token: "Th", label: "Thursday" },
  { token: "F", label: "Friday" },
];

const QUARTERS = ["Fall", "Winter", "Spring", "Summer1", "Summer10wk", "Summer2"];

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(mins) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}


const DEMO_MEETINGS = [
  {
    room: "1400",
    days: ["M", "W", "F"],
    start_min: 540,
    end_min: 590,
    course: "COMPSCI 161",
    section_type: "Lec",
    instructor: "Thornton, A.",
  },
  {
    room: "1400",
    days: ["Tu", "Th"],
    start_min: 660,
    end_min: 740,
    course: "IN4MATX 43",
    section_type: "Lec",
    instructor: "Redmiles, D.",
  },
  {
    room: "1300",
    days: ["Tu", "Th"],
    start_min: 780,
    end_min: 850,
    course: "STATS 67",
    section_type: "Lec",
    instructor: "Sanchez, J.",
  },
];

export default function ZotRoom() {
  const [building, setBuilding] = useState(BUILDINGS[0].code);
  const [customBuilding, setCustomBuilding] = useState("");
  const [useCustomBuilding, setUseCustomBuilding] = useState(false);
  const [year, setYear] = useState("2026");
  const [quarter, setQuarter] = useState("Fall");
  const [day, setDay] = useState("M");
  const [time, setTime] = useState("13:00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usedDemoData, setUsedDemoData] = useState(false);
  const [meetings, setMeetings] = useState(null);
  const [openRoom, setOpenRoom] = useState(null);

  const buildingCode = useCustomBuilding ? customBuilding.trim().toUpperCase() : building;
  const buildingInfo = BUILDINGS.find((b) => b.code === buildingCode);

  async function handleSearch() {
    if (!buildingCode) {
      setError("Enter a building code first.");
      return;
    }
    setLoading(true);
    setError("");
    setUsedDemoData(false);
    setOpenRoom(null);

    try {
      const data = await fetchBuildingSchedule(buildingCode, year, quarter);
      setMeetings(data.meetings || []);
    } catch (err) {
      console.warn("ZotRoom: backend fetch failed, using demo data:", err);
      setMeetings(DEMO_MEETINGS);
      setUsedDemoData(true);
      setError("Couldn't reach the backend, so this is showing demo data instead.");
    } finally {
      setLoading(false);
    }
  }

  const roomsByName = {};
  if (meetings) {
    for (const m of meetings) {
      if (!roomsByName[m.room]) roomsByName[m.room] = [];
      roomsByName[m.room].push(m);
    }
  }
  const allRooms = Object.keys(roomsByName).sort();

  const targetMin = timeToMinutes(time);
  const emptyRooms = allRooms.filter((room) => {
    const busy = roomsByName[room].some(
      (m) => m.days.includes(day) && targetMin >= m.start_min && targetMin < m.end_min
    );
    return !busy;
  });
  const busyRooms = allRooms.filter((r) => !emptyRooms.includes(r));

  // Map marker status: "unknown" before a search has run, otherwise
  // "empty" or "busy" depending on whether we found any open rooms.
  const mapStatus = !meetings ? "unknown" : emptyRooms.length > 0 ? "empty" : "busy";

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#0a2647]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Zot<span className="text-[#ffd200] drop-shadow-[0_1px_0_#0a2647]">Room</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Find empty classrooms at UCI, based on the public schedule of classes.
          </p>
        </header>

        {/* --- search controls --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Building
              </label>
              {!useCustomBuilding ? (
                <select
                  className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                >
                  {BUILDINGS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                  placeholder="e.g. MPAA"
                  value={customBuilding}
                  onChange={(e) => setCustomBuilding(e.target.value)}
                />
              )}
              <button
                type="button"
                className="text-xs text-[#0064a4] mt-1 underline"
                onClick={() => setUseCustomBuilding((v) => !v)}
              >
                {useCustomBuilding ? "Choose from list instead" : "Building not listed? Type a code"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Term</label>
              <div className="flex gap-2">
                <select
                  className="w-1/2 border border-slate-300 rounded-lg px-2 py-2 text-sm"
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                >
                  {QUARTERS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                <input
                  className="w-1/2 border border-slate-300 rounded-lg px-2 py-2 text-sm"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Day</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              >
                {DAYS.map((d) => (
                  <option key={d.token} value={d.token}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
              <input
                type="time"
                className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-[#0064a4] hover:bg-[#00527f] disabled:opacity-50 text-white font-medium rounded-lg py-2.5 transition-colors"
          >
            {loading ? "Searching…" : "Find empty rooms"}
          </button>

          {error && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* --- map --- */}
        <div className="mt-4">
          <ZotRoomMap
            lat={buildingInfo?.lat ?? CAMPUS_CENTER.lat}
            lng={buildingInfo?.lng ?? CAMPUS_CENTER.lng}
            buildingCode={buildingCode}
            status={mapStatus}
            emptyCount={emptyRooms.length}
          />
          {!buildingInfo && (
            <p className="text-xs text-slate-400 mt-1">
              No saved coordinates for "{buildingCode}" -- showing campus center instead.
            </p>
          )}
        </div>

        {/* --- results --- */}
        {meetings && (
          <div className="mt-6 space-y-6">
            {usedDemoData && (
              <p className="text-xs text-slate-400 italic">Showing demo data.</p>
            )}

            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">
                Empty in {buildingCode} at {minutesToLabel(targetMin)} on{" "}
                {DAYS.find((d) => d.token === day)?.label}
              </h2>
              {emptyRooms.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No known-empty rooms found for that time. Every room this
                  building knows about has a class then.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {emptyRooms.map((room) => (
                    <RoomCard
                      key={room}
                      room={room}
                      empty
                      onClick={() => setOpenRoom(room)}
                    />
                  ))}
                </div>
              )}
            </section>

            {busyRooms.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-700 mb-2">
                  In use at that time
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {busyRooms.map((room) => (
                    <RoomCard
                      key={room}
                      room={room}
                      empty={false}
                      onClick={() => setOpenRoom(room)}
                    />
                  ))}
                </div>
              </section>
            )}

            <p className="text-xs text-slate-400">
              Tap any room to see its full weekly schedule. Rooms with zero
              classes all quarter won't appear here since they never show up
              in the schedule data.
            </p>
          </div>
        )}
      </div>

      {openRoom && (
        <RoomScheduleModal
          room={openRoom}
          meetings={roomsByName[openRoom] || []}
          onClose={() => setOpenRoom(null)}
        />
      )}
    </div>
  );
}

function RoomCard({ room, empty, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-3 text-sm font-medium text-left transition-colors ${
        empty
          ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
      }`}
    >
      {room}
    </button>
  );
}

function RoomScheduleModal({ room, meetings, onClose }) {
  const sorted = [...meetings].sort((a, b) => a.start_min - b.start_min);
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold">Room {room}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm">
            close
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">No classes found for this room.</p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {sorted.map((m, i) => (
              <li key={i} className="text-sm border-b border-slate-100 pb-2">
                <div className="font-medium">
                  {m.course} · {m.section_type}
                </div>
                <div className="text-slate-500 text-xs">
                  {m.days.join(", ")} · {minutesToLabel(m.start_min)}–{minutesToLabel(m.end_min)} ·{" "}
                  {m.instructor}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 







