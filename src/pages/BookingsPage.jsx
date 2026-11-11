import { useState } from "react";
import { apiGet } from "../api/client.js";
import CrudPage from "../components/CrudPage.jsx";

export default function BookingsPage() {
  const [bid, setBid] = useState("");
  const [total, setTotal] = useState(null);
  const [totalErr, setTotalErr] = useState("");

  async function loadTotal() {
    setTotal(null);
    setTotalErr("");
    try {
      const data = await apiGet("/bookings/" + bid + "/total");
      setTotal(data);
    } catch (e) {
      setTotalErr("Could not load the total. " + e.message);
    }
  }

  return (
    <div>
      <CrudPage
        endpoint="/bookings"
        idKey="bookingId"
        title="Bookings"
        subtitle="Create and manage bookings. A room cannot be booked twice for overlapping dates."
        fields={[
          { key: "guestId", label: "Guest ID", type: "number", required: true, placeholder: "1" },
          { key: "roomId", label: "Room ID", type: "number", required: true, placeholder: "1" },
          { key: "staffId", label: "Staff ID", type: "number", required: true, placeholder: "1" },
          { key: "checkIn", label: "Check In", type: "date", required: true },
          { key: "checkOut", label: "Check Out", type: "date", required: true },
          { key: "nightlyRate", label: "Nightly Rate", type: "number", required: true, placeholder: "2000" },
          { key: "status", label: "Status", type: "select", required: true, options: [
            { value: "BOOKED", label: "BOOKED" },
            { value: "CHECKED_IN", label: "CHECKED_IN" },
            { value: "CHECKED_OUT", label: "CHECKED_OUT" },
            { value: "CANCELLED", label: "CANCELLED" },
          ] },
          { key: "notes", label: "Notes", type: "textarea", placeholder: "Any notes" },
        ]}
      />

      <div className="form-card card" style={{ marginTop: 20 }}>
        <h3>Booking Total (Bill)</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="totalBid">Booking ID</label>
            <input id="totalBid" className="input" type="number" value={bid} onChange={(e) => setBid(e.target.value)} placeholder="1" />
          </div>
        </div>
        <button className="btn btn-primary" type="button" onClick={loadTotal}>View Total</button>
        {totalErr && <div className="error-box" style={{ marginTop: 12 }}>{totalErr}</div>}
        {total && (
          <div style={{ marginTop: 12 }}>
            <p>Booking ID: {total.bookingId}</p>
            <p>Nights: {total.nights}</p>
            <p>Room Charge: ৳{total.roomCharge}</p>
            {total.serviceCharge !== undefined && <p>Service Charge: ৳{total.serviceCharge}</p>}
            <p><strong>Total: ৳{total.total}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
