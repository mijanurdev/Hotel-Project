import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GuestProfilePage from "./pages/GuestProfilePage.jsx";
import GuestsPage from "./pages/GuestsPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import HousekeepingPage from "./pages/HousekeepingPage.jsx";
import MaintenancePage from "./pages/MaintenancePage.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";

const ALL_PAGES = [
  { key: "guests", label: "Guests", component: GuestsPage },
  { key: "rooms", label: "Rooms", component: RoomsPage },
  { key: "bookings", label: "Bookings", component: BookingsPage },
  { key: "payments", label: "Payments", component: PaymentsPage },
  { key: "services", label: "Services", component: ServicesPage },
  { key: "housekeeping", label: "Housekeeping", component: HousekeepingPage },
  { key: "maintenance", label: "Maintenance", component: MaintenancePage },
  { key: "staff", label: "Staff", component: StaffPage },
  { key: "reports", label: "Reports", component: ReportsPage },
];

function pagesForRole(role) {
  if (role === "Housekeeping") {
    return ALL_PAGES.filter((p) => p.key === "housekeeping" || p.key === "maintenance");
  }
  if (role === "Receptionist" || role === "Manager") {
    return ALL_PAGES.filter((p) => p.key !== "staff");
  }
  return ALL_PAGES;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [staffUser, setStaffUser] = useState(null);
  const [guestUser, setGuestUser] = useState(null);
  const [page, setPage] = useState("guests");
  const [dark, setDark] = useState(() => localStorage.getItem("nivas_theme") === "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("nivas_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    try {
      const savedStaff = localStorage.getItem("nivas_user");
      if (savedStaff) setStaffUser(JSON.parse(savedStaff));
    } catch {
      localStorage.removeItem("nivas_user");
    }
    try {
      const savedGuest = localStorage.getItem("nivas_guest");
      if (savedGuest) setGuestUser(JSON.parse(savedGuest));
    } catch {
      localStorage.removeItem("nivas_guest");
    }
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="splash">
        <img className="splash-logo" src="/logo.png" alt="Hotel NIVAS" />
        <p className="splash-text">Please Wait...</p>
        <div className="spinner" />
      </div>
    );
  }

  function handleStaffLogin(u) {
    setStaffUser(u);
    localStorage.setItem("nivas_user", JSON.stringify(u));
    setView("dashboard");
    setPage(pagesForRole(u.role)[0].key);
  }

  function handleGuestLogin(g) {
    setGuestUser(g);
    localStorage.setItem("nivas_guest", JSON.stringify(g));
    setView("guest");
  }

  function updateGuest(g) {
    setGuestUser(g);
    localStorage.setItem("nivas_guest", JSON.stringify(g));
    try {
      const accounts = JSON.parse(localStorage.getItem("nivas_guest_accounts") || "[]");
      const updated = accounts.map((a) =>
        a.email && g.email && a.email.toLowerCase() === g.email.toLowerCase() ? { ...a, guestId: g.guestId } : a
      );
      localStorage.setItem("nivas_guest_accounts", JSON.stringify(updated));
    } catch {}
  }

  function handleStaffLogout() {
    localStorage.removeItem("nivas_user");
    setStaffUser(null);
    setView("home");
  }

  function handleGuestLogout() {
    localStorage.removeItem("nivas_guest");
    setGuestUser(null);
    setView("home");
  }

  if (view === "login" && !staffUser && !guestUser) {
    return <LoginPage onStaffLogin={handleStaffLogin} onGuestLogin={handleGuestLogin} onBack={() => setView("home")} />;
  }

  if (view === "guest" && guestUser) {
    return <GuestProfilePage guest={guestUser} onBack={() => setView("home")} onLogout={handleGuestLogout} onGuestUpdated={updateGuest} />;
  }

  if (view === "dashboard" && staffUser) {
    const pages = pagesForRole(staffUser.role);
    const Current = (pages.find((p) => p.key === page) || pages[0]).component;
    return (
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-logo" type="button" onClick={() => setView("home")}>Hotel NIVAS</button>
          <div className="sidebar-user">{staffUser.name} ({staffUser.role})</div>
          {pages.map((p) => (
            <button
              key={p.key}
              type="button"
              className={"sidebar-link" + (page === p.key ? " active" : "")}
              onClick={() => setPage(p.key)}
            >
              {p.label}
            </button>
          ))}
          <button className="sidebar-link" type="button" onClick={handleStaffLogout}>Logout</button>
        </aside>
        <main className="main-content">
          <div className="topbar">
            <span><strong>Hotel NIVAS</strong> — Staff Dashboard</span>
            <span>
              <button className="theme-btn" type="button" onClick={() => setDark(!dark)} style={{ marginRight: 10 }}>
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button className="btn btn-outline btn-small" type="button" onClick={() => setView("home")}>View Website</button>
            </span>
          </div>
          <Current />
        </main>
      </div>
    );
  }

  const user = staffUser
    ? { ...staffUser, kind: "staff" }
    : guestUser
      ? { ...guestUser, kind: "guest" }
      : null;

  return (
    <HomePage
      onStaffLogin={() => setView("login")}
      dark={dark}
      onToggleTheme={() => setDark(!dark)}
      user={user}
      onGoProfile={() => setView(staffUser ? "dashboard" : "guest")}
      onGuestUpdated={updateGuest}
    />
  );
}
