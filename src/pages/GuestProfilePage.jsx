import { useEffect, useState } from "react";
import { apiGet } from "../api/client.js";

function nightsBetween(a, b) {
  const days = (new Date(b) - new Date(a)) / 86400000;
  return Number.isFinite(days) && days > 0 ? days : 0;
}

export default function GuestProfilePage({ guest, onBack, onLogout, onGuestUpdated }) {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      let gid = guest.guestId;
      if (!gid) {
        try {
          const all = await apiGet("/guests");
          const found = (Array.isArray(all) ? all : []).find(
            (g) => (g.email || "").toLowerCase() === (guest.email || "").toLowerCase()
          );
          if (found) {
            gid = found.guestId || found.id;
            if (onGuestUpdated) onGuestUpdated({ ...guest, guestId: gid });
          }
        } catch {}
      }
      if (!gid) {
        setLoading(false);
        setMsg("Your account is not linked to a guest record yet. Book a room from the homepage while signed in and it will appear here.");
        return;
      }
      try {
        const [allBookings, allRooms] = await Promise.all([apiGet("/bookings"), apiGet("/rooms")]);
        const roomMap = {};
        (Array.isArray(allRooms) ? allRooms : []).forEach((r) => {
          roomMap[r.roomId] = r.roomNumber;
        });
        setRooms(roomMap);
        const mine = (Array.isArray(allBookings) ? allBookings : []).filter(
          (b) => String(b.guestId) === String(gid) || String(b.guest?.guestId) === String(gid)
        );
        const withTotals = await Promise.all(
          mine.map(async (b) => {
            let total = nightsBetween(b.checkIn, b.checkOut) * Number(b.nightlyRate || 0);
            let paid = 0;
            try {
              const t = await apiGet("/bookings/" + b.bookingId + "/total");
              if (t && (t.total !== undefined || t.roomCharge !== undefined)) {
                total = Number(t.total ?? t.roomCharge ?? total);
              }
            } catch {}
            try {
              const pays = await apiGet("/payments");
              paid = (Array.isArray(pays) ? pays : [])
                .filter((p) => String(p.bookingId) === String(b.bookingId))
                .reduce((s, p) => s + Number(p.amount || 0), 0);
            } catch {}
            return { ...b, total, paid };
          })
        );
        setBookings(withTotals);
      } catch (e) {
        setMsg("Could not load your bookings. Is the backend running? " + e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [guest.guestId]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="section-subtitle">Your account and your bookings at Hotel NIVAS.</p>
      </div>

      <div className="card profile-card">
        <h3>{guest.name}</h3>
        <p><strong>Email:</strong> {guest.email}</p>
        <p><strong>Phone:</strong> {guest.phone || "—"}</p>
        {guest.guestId && <p><strong>Guest ID:</strong> {guest.guestId}</p>}
      </div>

      <div className="form-card card">
        <h3>My Bookings</h3>
        <p className="guest-note">New bookings you make from the homepage while signed in will appear here.</p>
        {loading && <p>Loading your bookings...</p>}
        {!loading && msg && <p>{msg}</p>}
        {!loading && !msg && bookings.length === 0 && <p>You have no bookings yet. Book a room from the homepage.</p>}
        {!loading && bookings.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Room</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Nights</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.bookingId}>
                    <td>#{b.bookingId}</td>
                    <td>{rooms[b.roomId] ? "Room " + rooms[b.roomId] : b.roomId}</td>
                    <td>{b.checkIn}</td>
                    <td>{b.checkOut}</td>
                    <td>{nightsBetween(b.checkIn, b.checkOut)}</td>
                    <td>৳{b.total}</td>
                    <td>৳{b.paid}</td>
                    <td>৳{b.total - b.paid}</td>
                    <td>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <button className="btn btn-primary" type="button" onClick={onBack}>Back to Website</button>
        <button className="btn btn-outline" type="button" onClick={onLogout} style={{ marginLeft: 10 }}>Logout</button>
      </div>
    </div>
  );
}
