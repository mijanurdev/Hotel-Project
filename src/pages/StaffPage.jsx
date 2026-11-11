import { useEffect, useState } from "react";
import { apiGet } from "../api/client.js";
import CrudPage from "../components/CrudPage.jsx";

const SALARY_OPTIONS = [15000, 20000, 25000, 30000, 40000, 50000, 60000].map((s) => ({
  value: s,
  label: "৳" + s.toLocaleString(),
}));

export default function StaffPage() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    apiGet("/roles").then((d) => setRoles(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  function roleName(id) {
    return (roles.find((r) => r.roleId === id) || {}).roleName || id;
  }

  return (
    <CrudPage
      endpoint="/staff"
      idKey="staffId"
      title="Staff"
      subtitle="Admin only: create staff accounts and assign roles."
      fields={[
        { key: "name", label: "Full Name", type: "text", required: true, placeholder: "Staff full name" },
        { key: "phone", label: "Phone", type: "text", required: true, placeholder: "01XXXXXXXXX" },
        { key: "email", label: "Email", type: "text", placeholder: "staff@email.com" },
        { key: "username", label: "Username", type: "text", required: true, placeholder: "Unique username" },
        { key: "password", label: "Password", type: "password", required: true, placeholder: "Password (hashed in the backend)" },
        { key: "roleId", label: "Role", type: "select", required: true, options: roles.map((r) => ({ value: r.roleId, label: r.roleName })) },
        { key: "salary", label: "Salary", type: "select", required: true, options: SALARY_OPTIONS },
        { key: "shift", label: "Shift", type: "select", required: true, options: [
          { value: "Day", label: "Day" },
          { value: "Night", label: "Night" },
          { value: "Morning", label: "Morning" },
        ] },
        { key: "joinDate", label: "Join Date", type: "date" },
        { key: "isActive", label: "Active", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "username", label: "Username" },
        { key: "roleId", label: "Role", render: (s) => roleName(s.roleId) },
        { key: "phone", label: "Phone" },
        { key: "shift", label: "Shift" },
        { key: "salary", label: "Salary", render: (s) => "৳" + s.salary },
        { key: "isActive", label: "Active", render: (s) => (s.isActive ? "Yes" : "No") },
      ]}
    />
  );
}
