import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client.js";
import CrudPage from "../components/CrudPage.jsx";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [bs, setBs] = useState({ bookingId: "", serviceId: "", quantity: 1, unitPrice: "", serviceDate: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    apiGet("/services").then((d) => setServices(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  function setBsField(key, value) {
    setBs((prev) => ({ ...prev, [key]: value }));
  }

  async function addServiceToBooking(event) {
    event.preventDefault();
    setMsg("");
    setErr("");
    try {
      await apiPost("/booking-services", {
        bookingId: Number(bs.bookingId),
        serviceId: Number(bs.serviceId),
        quantity: Number(bs.quantity),
        unitPrice: Number(bs.unitPrice),
        serviceDate: bs.serviceDate,
      });
      setMsg("Service added to the booking.");
      setBs({ bookingId: "", serviceId: "", quantity: 1, unitPrice: "", serviceDate: "" });
    } catch (e) {
      setErr("Could not add the service. " + e.message);
    }
  }

  return (
    <div>
      <CrudPage
        endpoint="/services"
        idKey="serviceId"
        title="Services"
        subtitle="Manage the service list and prices."
        fields={[
          { key: "serviceName", label: "Service Name", type: "text", required: true, placeholder: "Breakfast" },
          { key: "unitPrice", label: "Unit Price", type: "number", required: true, placeholder: "500" },
          { key: "description", label: "Description", type: "text", placeholder: "Service details" },
          { key: "isActive", label: "Active", type: "checkbox" },
        ]}
      />

      <div className="form-card card" style={{ marginTop: 20 }}>
        <h3>Add Service to a Booking</h3>
        {err && <div className="error-box">{err}</div>}
        {msg && <div className="success-box">{msg}</div>}
        <form onSubmit={addServiceToBooking}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="bsBooking">Booking ID *</label>
              <input id="bsBooking" className="input" type="number" value={bs.bookingId} onChange={(e) => setBsField("bookingId", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bsService">Service *</label>
              <select id="bsService" className="input" value={bs.serviceId} onChange={(e) => setBsField("serviceId", e.target.value)} required>
                <option value="">Select...</option>
                {services.map((s) => (
                  <option key={s.serviceId} value={s.serviceId}>{s.serviceName} — ৳{s.unitPrice}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bsQty">Quantity *</label>
              <input id="bsQty" className="input" type="number" min="1" value={bs.quantity} onChange={(e) => setBsField("quantity", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bsPrice">Unit Price *</label>
              <input id="bsPrice" className="input" type="number" value={bs.unitPrice} onChange={(e) => setBsField("unitPrice", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bsDate">Service Date</label>
              <input id="bsDate" className="input" type="date" value={bs.serviceDate} onChange={(e) => setBsField("serviceDate", e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">Add to Booking</button>
        </form>
      </div>
    </div>
  );
}
