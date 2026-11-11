import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/client.js";

export default function CrudPage({ endpoint, idKey, title, subtitle, fields = [], columns = [] }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await apiGet(endpoint);
      setItems(Array.isArray(d) ? d : []);
    } catch (e) {
      setError("Failed to load data. Is the backend running? " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [endpoint]);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    for (const fd of fields || []) {
      const v = form[fd.key];
      if (fd.required && (v === "" || v === undefined || v === null)) {
        setError(fd.label + " is required.");
        return;
      }
    }
    const payload = { ...form };
    if (editingId !== null) {
      if ("password" in payload && !payload.password) delete payload.password;
      try {
        await apiPut(endpoint + "/" + editingId, payload);
        setSuccess("Updated.");
      } catch (err) {
        setError("Could not save. " + err.message);
        return;
      }
    } else {
      try {
        await apiPost(endpoint, payload);
        setSuccess("Saved.");
      } catch (err) {
        setError("Could not save. " + err.message);
        return;
      }
    }
    setForm({});
    setEditingId(null);
    load();
  }

  function startEdit(item) {
    const f = {};
    (fields || []).forEach((fd) => {
      f[fd.key] = item[fd.key] ?? "";
      if (fd.key === "password") f[fd.key] = "";
    });
    setForm(f);
    setEditingId(item[idKey]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setForm({});
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    try {
      await apiDelete(endpoint + "/" + id);
      load();
    } catch (e) {
      setError("Could not delete. " + e.message);
    }
  }

  function fieldOptions(fd) {
    return (fd.options || []).map((o) =>
      typeof o === "string" ? { value: o, label: o } : o
    );
  }

  function renderField(fd) {
    const value = form[fd.key] ?? "";
    if (fd.type === "select") {
      return (
        <select className="input" value={value} onChange={(e) => handleChange(fd.key, e.target.value)}>
          <option value="" disabled>Select...</option>
          {fieldOptions(fd).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    }
    if (fd.type === "textarea") {
      return (
        <textarea className="input" rows="3" value={value} onChange={(e) => handleChange(fd.key, e.target.value)} placeholder={fd.placeholder || ""} />
      );
    }
    if (fd.key === "password") {
      return (
        <div className="input-with-eye">
          <input
            className="input"
            type={showPwd ? "text" : "password"}
            value={value}
            onChange={(e) => handleChange(fd.key, e.target.value)}
            placeholder={editingId !== null ? "Leave empty to keep current password" : fd.placeholder || ""}
            autoComplete="new-password"
          />
          <button type="button" className="eye-btn" onClick={() => setShowPwd(!showPwd)} aria-label="Show or hide password">
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>
      );
    }
    return (
      <input
        className="input"
        type={fd.type || "text"}
        value={value}
        onChange={(e) => handleChange(fd.key, e.target.value)}
        placeholder={fd.placeholder || ""}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>

      <div className="form-card card">
        <h3>{editingId !== null ? "Update Record" : "Add New Record"}</h3>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {(fields || []).map((fd) => (
              <div className="form-group" key={fd.key}>
                <label className="form-label" htmlFor={fd.key}>
                  {fd.label}{fd.required ? " *" : ""}
                </label>
                {renderField(fd)}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" type="submit">
            {editingId !== null ? "Update" : "Save"}
          </button>
          {editingId !== null && (
            <button className="btn btn-outline" type="button" onClick={cancelEdit} style={{ marginLeft: 10 }}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && items.length === 0 && !error && <p>No records yet.</p>}
      {!loading && items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {(columns || []).map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item) => (
                <tr key={item[idKey]}>
                  {(columns || []).map((c) => (
                    <td key={c.key}>{c.render ? c.render(item) : String(item[c.key] ?? "")}</td>
                  ))}
                  <td>
                    <button className="btn btn-outline btn-small" type="button" onClick={() => startEdit(item)}>Edit</button>
                    <button className="btn btn-danger btn-small" type="button" onClick={() => handleDelete(item[idKey])} style={{ marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
