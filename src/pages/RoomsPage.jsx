import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client.js";
import CrudPage from "../components/CrudPage.jsx";

const ROOM_NUMBERS = [];
for (let f = 1; f <= 7; f++) {
  for (let n = 1; n <= 15; n++) {
    ROOM_NUMBERS.push(String(f * 100 + n));
  }
}

const FLOORS = ["1", "2", "3", "4", "5", "6", "7"];

export default function RoomsPage() {
  const [types, setTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [checkIn, setCheckIn] = useState("2026-11-03");
  const [checkOut, setCheckOut] = useState("2026-11-07");
  const [avail, setAvail] = useState([]);
  const [availMsg, setAvailMsg] = useState("");
  const [typeName, setTypeName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [typeMsg, setTypeMsg] = useState("");
  const [typeErr, setTypeErr] = useState("");

  function loadTypes() {
    apiGet("/room-types").then((d) => setTypes(Array.isArray(d) ? d : [])).catch(() => {});
  }

  useEffect(() => {
    loadTypes();
    apiGet("/room-statuses").then((d) => setStatuses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  function typeNameOf(id) {
    return (types.find((t) => String(t.roomTypeId) === String(id)) || {}).typeName || id;
  }

  function statusName(id) {
    return (statuses.find((s) => String(s.statusId) === String(id)) || {}).statusName || id;
  }

  async function searchAvailable() {
    setAvailMsg("");
    try {
      const data = await apiGet("/rooms/available?checkIn=" + checkIn + "&checkOut=" + checkOut);
      let rooms = Array.isArray(data) ? data : [];
      if (rooms.length === 0) {
        const all = await apiGet("/rooms");
        const list = Array.isArray(all) ? all : [];
        const availIds = new Set(statuses.filter((s) => s.statusName === "Available").map((s) => s.statusId));
        rooms = list.filter((r) => availIds.size === 0 || availIds.has(r.statusId));
        setAvail(rooms);
        setAvailMsg(rooms.length + " room(s) available for these dates (from the room list).");
        return;
      }
      setAvail(rooms);
      setAvailMsg(rooms.length + " room(s) available for these dates.");
    } catch (e) {
      setAvail([]);
      setAvailMsg("Could not check availability. " + e.message);
    }
  }

  async function addRoomType(e) {
    e.preventDefault();
    setTypeMsg("");
    setTypeErr("");
    if (!typeName.trim() || !basePrice || !capacity) {
      setTypeErr("Please fill in type name, base price and capacity.");
      return;
    }
    try {
      await apiPost("/room-types", {
        typeName: typeName.trim(),
        basePrice: Number(basePrice),
        capacity: Number(capacity),
      });
      setTypeMsg(typeName.trim() + " room type added. It will now appear in the Room Type dropdown below.");
      setTypeName("");
      setBasePrice("");
      setCapacity("");
      loadTypes();
    } catch (err) {
      setTypeErr("Could not add room type. " + err.message);
    }
  }

  return (
    <div>
      <div className="form-card card">
        <h3>Availability Search</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="avCheckIn">Check In</label>
            <input id="avCheckIn" className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="avCheckOut">Check Out</label>
            <input id="avCheckOut" className="input" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" type="button" onClick={searchAvailable}>Search Available Rooms</button>
        {availMsg && <p style={{ marginTop: 12 }}>{availMsg}</p>}
        {avail.length > 0 && (
          <ul>
            {avail.map((r) => (
              <li key={r.roomId}>Room {r.roomNumber} — {typeNameOf(r.roomTypeId)}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-card card">
        <h3>Add Room Type</h3>
        <p className="guest-note">Only Single exists right now. Add Double and Deluxe here — they will appear in the Room Type dropdown below right away. Standard prices: Single 2500, Double 4500, Deluxe 8500.</p>
        <form onSubmit={addRoomType}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="newTypeName">Type Name *</label>
              <input id="newTypeName" className="input" type="text" value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder="Double" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="newBasePrice">Base Price (per night) *</label>
              <input id="newBasePrice" className="input" type="number" min="0" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="4500" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="newCapacity">Capacity (guests) *</label>
              <input id="newCapacity" className="input" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="2" />
            </div>
          </div>
          {typeErr && <div className="error-box">{typeErr}</div>}
          {typeMsg && <div className="success-box">{typeMsg}</div>}
          <button className="btn btn-primary" type="submit">Add Room Type</button>
        </form>
      </div>

      <CrudPage
        endpoint="/rooms"
        idKey="roomId"
        title="Rooms"
        subtitle="Manage room inventory, type and status. Room numbers run 101–115 on floor 1, 201–215 on floor 2, up to 701–715 on floor 7."
        fields={[
          { key: "roomNumber", label: "Room Number", type: "select", required: true, options: ROOM_NUMBERS },
          { key: "floorNo", label: "Floor No", type: "select", required: true, options: FLOORS },
          { key: "roomTypeId", label: "Room Type", type: "select", required: true, options: types.map((t) => ({ value: t.roomTypeId, label: t.typeName })) },
          { key: "statusId", label: "Room Status", type: "select", required: true, options: statuses.map((s) => ({ value: s.statusId, label: s.statusName })) },
        ]}
        columns={[
          { key: "roomNumber", label: "Room Number" },
          { key: "floorNo", label: "Floor" },
          { key: "roomTypeId", label: "Room Type", render: (r) => typeNameOf(r.roomTypeId) },
          { key: "statusId", label: "Status", render: (r) => statusName(r.statusId) },
        ]}
      />
    </div>
  );
}
