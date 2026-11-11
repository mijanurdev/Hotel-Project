import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client.js";

const DEMO_STAFF = [
  { label: "Admin", username: "admin", password: "admin123" },
  { label: "Manager", username: "manager", password: "manager123" },
  { label: "Receptionist", username: "reception", password: "reception123" },
  { label: "Housekeeping", username: "housekeeping", password: "house123" },
];

const FALLBACK_ROLES = [
  { roleId: 1, roleName: "Admin" },
  { roleId: 2, roleName: "Manager" },
  { roleId: 3, roleName: "Receptionist" },
  { roleId: 4, roleName: "Housekeeping" },
];

function loadGuestAccounts() {
  try {
    return JSON.parse(localStorage.getItem("nivas_guest_accounts") || "[]");
  } catch {
    return [];
  }
}

function saveGuestAccounts(list) {
  localStorage.setItem("nivas_guest_accounts", JSON.stringify(list));
}

function loadStaffAccounts() {
  try {
    return JSON.parse(localStorage.getItem("nivas_staff_accounts") || "[]");
  } catch {
    return [];
  }
}

function saveStaffAccounts(list) {
  localStorage.setItem("nivas_staff_accounts", JSON.stringify(list));
}

export default function LoginPage({ onStaffLogin, onGuestLogin, onBack }) {
  const [tab, setTab] = useState("staff");
  const [staffMode, setStaffMode] = useState("signin");
  const [guestMode, setGuestMode] = useState("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("3");
  const [roles, setRoles] = useState(FALLBACK_ROLES);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loadGuestAccounts().length === 0) {
      saveGuestAccounts([
        { name: "Demo Guest", email: "demo@guest.com", phone: "01700000000", password: "guest123", guestId: null },
      ]);
    }
    apiGet("/roles")
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setRoles(d);
      })
      .catch(() => {});
  }, []);

  async function staffLogin(u, p) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      if (res.ok) {
        const data = await res.json();
        const roleId = data.roleId || data.role || 1;
        const role = { 1: "Admin", 2: "Manager", 3: "Receptionist", 4: "Housekeeping" }[roleId] || "Admin";
        onStaffLogin({ staffId: data.staffId, username: data.username || u, name: data.name || u, role });
        return;
      }
      throw new Error("Invalid username or password");
    } catch (e) {
      const demo = DEMO_STAFF.find((d) => d.username === u && d.password === p);
      if (demo) {
        onStaffLogin({ staffId: 0, username: u, name: demo.label, role: demo.label });
        return;
      }
      const local = loadStaffAccounts().find((a) => a.username === u && a.password === p);
      if (local) {
        onStaffLogin({ staffId: 0, username: u, name: local.name, role: local.role });
        return;
      }
      setError("Invalid username or password. If you have no account yet, create one below. If the backend is not running, use a demo account.");
    } finally {
      setLoading(false);
    }
  }

  async function staffSignUp() {
    setError("");
    if (!staffName.trim() || !username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const accounts = loadStaffAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === username.trim().toLowerCase())) {
      setError("This username already exists. Please sign in.");
      return;
    }
    const roleName = (roles.find((r) => String(r.roleId) === String(staffRole)) || {}).roleName || "Receptionist";
    setLoading(true);
    let staffId = 0;
    try {
      const s = await apiPost("/staff", {
        name: staffName.trim(),
        username: username.trim(),
        password,
        roleId: Number(staffRole),
        salary: 25000,
        shift: "Day",
        joinDate: new Date().toISOString().slice(0, 10),
      });
      staffId = s.staffId || s.id || 0;
    } catch {
      staffId = 0;
    }
    saveStaffAccounts([...accounts, { name: staffName.trim(), username: username.trim(), password, role: roleName }]);
    setLoading(false);
    onStaffLogin({ staffId, username: username.trim(), name: staffName.trim(), role: roleName });
  }

  async function guestSignIn() {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      const res = await fetch("/api/auth/guest/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        const data = await res.json();
        onGuestLogin({ name: data.name, email: data.email, phone: data.phone || "", guestId: data.guestId || data.id || null });
        return;
      }
    } catch {}
    const acc = loadGuestAccounts().find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    );
    if (!acc) {
      setError("No guest account found with this email and password. Please sign up first.");
      return;
    }
    onGuestLogin({ name: acc.name, email: acc.email, phone: acc.phone, guestId: acc.guestId });
  }

  async function guestSignUp() {
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const accounts = loadGuestAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) {
      setError("An account with this email already exists. Please sign in.");
      return;
    }
    setLoading(true);
    let guestId = null;
    try {
      const res = await fetch("/api/auth/guest/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), password }),
      });
      if (res.ok) {
        const data = await res.json();
        guestId = data.guestId || data.id || null;
      } else if (res.status === 400) {
        setError("An account with this email already exists. Please sign in.");
        setLoading(false);
        return;
      } else {
        throw new Error("signup failed");
      }
    } catch {
      try {
        const g = await apiPost("/guests", { name: name.trim(), phone: phone.trim(), email: email.trim() });
        guestId = g.guestId || g.id || null;
      } catch {
        guestId = null;
      }
    }
    const acc = { name: name.trim(), email: email.trim(), phone: phone.trim(), password, guestId };
    saveGuestAccounts([...accounts, acc]);
    setLoading(false);
    onGuestLogin({ name: acc.name, email: acc.email, phone: acc.phone, guestId: acc.guestId });
  }

  function fillDemoGuest() {
    setEmail("demo@guest.com");
    setPassword("guest123");
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <img className="login-hero-img" src="/images/hero.jpg" alt="Hotel NIVAS" />
        <div className="login-overlay">
          <h1 className="login-brand">Hotel NIVAS</h1>
          <p>Your stay, your bookings — everything in one place.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card card">
          <img className="login-logo" src="/logo.png" alt="Hotel NIVAS" />
          <h2 className="login-title">
            {tab === "staff"
              ? staffMode === "signin" ? "Staff Sign In" : "Create Staff Account"
              : guestMode === "signin" ? "Guest Sign In" : "Create Guest Account"}
          </h2>
          <p className="login-subtitle">
            {tab === "staff"
              ? staffMode === "signin"
                ? "Sign in with your staff account to open the dashboard."
                : "No staff account yet? Create one with your own username and password — then sign in."
              : guestMode === "signin"
                ? "Sign in with your email to see your profile and bookings."
                : "No account yet? Create one in a minute — then sign in with your email."}
          </p>

          <div className="login-tabs">
            <button type="button" className={"login-tab" + (tab === "staff" ? " active" : "")} onClick={() => { setTab("staff"); setError(""); }}>
              Staff
            </button>
            <button type="button" className={"login-tab" + (tab === "guest" ? " active" : "")} onClick={() => { setTab("guest"); setError(""); }}>
              Guest
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}

          {tab === "staff" && staffMode === "signin" && (
            <form onSubmit={(e) => { e.preventDefault(); staffLogin(username.trim(), password); }}>
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username / Staff ID</label>
                <input id="username" className="input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username or staff ID" autoComplete="username" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="input-with-eye">
                  <input id="password" className="input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <p className="guest-note">
                No staff account yet?{" "}
                <button type="button" className="link-btn" onClick={() => { setStaffMode("signup"); setError(""); }}>
                  Create a staff account
                </button>
              </p>
              <div className="demo-box">
                <p className="demo-title">Demo Staff Accounts — click to fill:</p>
                <div className="demo-grid">
                  {DEMO_STAFF.map((d) => (
                    <button
                      key={d.username}
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() => { setUsername(d.username); setPassword(d.password); }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="demo-note">Sample accounts for the demo: admin / manager / reception / housekeeping. Real passwords are stored hashed in the database.</p>
              </div>
            </form>
          )}

          {tab === "staff" && staffMode === "signup" && (
            <form onSubmit={(e) => { e.preventDefault(); staffSignUp(); }}>
              <div className="form-group">
                <label className="form-label" htmlFor="staffName">Full Name *</label>
                <input id="staffName" className="input" type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staffUsername">Username *</label>
                <input id="staffUsername" className="input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" autoComplete="username" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staffPassword">Password *</label>
                <div className="input-with-eye">
                  <input id="staffPassword" className="input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staffRole">Role *</label>
                <select id="staffRole" className="input" value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
              <p className="guest-note">
                Already have an account?{" "}
                <button type="button" className="link-btn" onClick={() => { setStaffMode("signin"); setError(""); }}>
                  Sign in
                </button>
              </p>
            </form>
          )}

          {tab === "guest" && guestMode === "signin" && (
            <form onSubmit={(e) => { e.preventDefault(); guestSignIn(); }}>
              <div className="form-group">
                <label className="form-label" htmlFor="guestEmail">Email</label>
                <input id="guestEmail" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="guestPassword">Password</label>
                <div className="input-with-eye">
                  <input id="guestPassword" className="input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <p className="guest-note">
                No account yet?{" "}
                <button type="button" className="link-btn" onClick={() => { setGuestMode("signup"); setError(""); }}>
                  Create a guest account
                </button>
              </p>
              <div className="demo-box">
                <p className="demo-title">Demo Guest Account</p>
                <p className="demo-note">Email: demo@guest.com · Password: guest123</p>
                <button type="button" className="btn btn-outline btn-small" onClick={fillDemoGuest} style={{ marginTop: 10 }}>
                  Fill Demo Guest
                </button>
              </div>
            </form>
          )}

          {tab === "guest" && guestMode === "signup" && (
            <form onSubmit={(e) => { e.preventDefault(); guestSignUp(); }}>
              <div className="form-group">
                <label className="form-label" htmlFor="guestName">Full Name *</label>
                <input id="guestName" className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="guestEmail2">Email *</label>
                <input id="guestEmail2" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="guestPhone">Phone *</label>
                <input id="guestPhone" className="input" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="guestPassword2">Password *</label>
                <div className="input-with-eye">
                  <input id="guestPassword2" className="input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
              <p className="guest-note">
                Already have an account?{" "}
                <button type="button" className="link-btn" onClick={() => { setGuestMode("signin"); setError(""); }}>
                  Sign in
                </button>
              </p>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: 20 }}>
            <button type="button" className="link-btn" onClick={onBack}>← Back to Website</button>
          </p>
        </div>
      </div>
    </div>
  );
}
