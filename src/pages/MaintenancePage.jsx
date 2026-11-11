import CrudPage from "../components/CrudPage.jsx";

export default function MaintenancePage() {
  return (
    <CrudPage
      endpoint="/maintenance"
      idKey="maintenanceId"
      title="Maintenance"
      subtitle="Report room maintenance issues and mark them resolved."
      fields={[
        { key: "roomId", label: "Room ID", type: "number", required: true, placeholder: "1" },
        { key: "reportedBy", label: "Reported By (Staff ID)", type: "number", required: true, placeholder: "1" },
        { key: "issueDescription", label: "Issue Description", type: "textarea", required: true, placeholder: "What is the problem?" },
        { key: "reportedDate", label: "Reported Date", type: "date", required: true },
        { key: "status", label: "Status", type: "select", required: true, options: [
          { value: "Open", label: "Open" },
          { value: "In Progress", label: "In Progress" },
          { value: "Resolved", label: "Resolved" },
        ] },
        { key: "resolvedDate", label: "Resolved Date", type: "date" },
      ]}
    />
  );
}
