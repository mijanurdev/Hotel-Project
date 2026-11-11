import { useEffect, useState } from "react";
import { apiGet } from "../api/client.js";

function nightsBetween(a, b) {
  const days = (new Date(b) - new Date(a)) / 86400000;
  return Number.isFinite(days) && days > 0 ? days : 0;
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/bookings").then((d) => setBookings(Array.isArray(d) ? d : [])).catch((e) => setError(e.message));
    apiGet("/payments").then((d) => setPayments(Array.isArray(d) ? d : [])).catch(() => {});
    apiGet("/rooms").then((d) => setRooms(Array.isArray(d) ? d : [])).catch(() => {});
    apiGet("/maintenance").then((d) => setMaintenance(Array.isArray(d) ? d : [])).catch(() => {});
    apiGet("/room-statuses").then((d) => setStatuses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const statusName = (id) => (statuses.find((s) => s.statusId === id) || {}).statusName || "";
  const occupied = rooms.filter((r) => statusName(r.statusId) === "Occupied").length;
  const occupancy = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;
  const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const byMethod = {};
  payments.forEach((p) => {
    byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount || 0);
  });

  const outstanding = bookings
    .filter((b) => b.status !== "CANCELLED")
    .map((b) => {
      const total = nightsBetween(b.checkIn, b.checkOut) * Number(b.nightlyRate || 0);
      const paid = payments.filter((p) => p.bookingId === b.bookingId).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      return { bookingId: b.bookingId, guestId: b.guestId, total, paid, due: total - paid };
    })
    .filter((o) => o.due > 0);

  const openMaintenance = maintenance.filter((m) => m.status !== "Resolved");

  return (
    <div className="fade-up">
      <div className="page-header">
        <h2 className="page-title">Reports</h2>
        <p>Occupancy, payments, outstanding balances and maintenance.</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="kpi-grid">
        <div className="card kpi-card"><p>Occupancy</p><p className="kpi-value">{occupancy}%</p><p>{occupied} of {rooms.length} rooms occupied</p></div>
        <div className="card kpi-card"><p>Total Received</p><p className="kpi-value">৳{totalReceived}</p><p>{payments.length} payment(s)</p></div>
        <div className="card kpi-card"><p>Outstanding</p><p className="kpi-value">৳{outstanding.reduce((s, o) => s + o.due, 0)}</p><p>{outstanding.length} booking(s)</p></div>
        <div className="card kpi-card"><p>Open Maintenance</p><p className="kpi-value">{openMaintenance.length}</p><p>issue(s) not resolved</p></div>
      </div>

      <div className="form-card card">
        <h3>Payments by Method</h3>
        {Object.keys(byMethod).length === 0 && <p>No payments yet.</p>}
        <ul>
          {Object.keys(byMethod).map((m) => (
            <li key={m}>{m}: ৳{byMethod[m]}</li>
          ))}
        </ul>
      </div>

      <div className="form-card card">
        <h3>Outstanding Balances</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Booking ID</th><th>Guest ID</th><th>Total</th><th>Paid</th><th>Outstanding</th></tr></thead>
            <tbody>
              {outstanding.length === 0 && <tr><td colSpan="5">No outstanding balance.</td></tr>}
              {outstanding.map((o) => (
                <tr key={o.bookingId}>
                  <td>{o.bookingId}</td><td>{o.guestId}</td><td>৳{o.total}</td><td>৳{o.paid}</td><td>৳{o.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-card card">
        <h3>Open Maintenance Issues</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Room ID</th><th>Issue</th><th>Reported Date</th><th>Status</th></tr></thead>
            <tbody>
              {openMaintenance.length === 0 && <tr><td colSpan="4">No open maintenance issues.</td></tr>}
              {openMaintenance.map((m) => (
                <tr key={m.maintenanceId}>
                  <td>{m.roomId}</td><td>{m.issueDescription}</td><td>{m.reportedDate}</td><td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
