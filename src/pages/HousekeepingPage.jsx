import CrudPage from "../components/CrudPage.jsx";

export default function HousekeepingPage() {
  return (
    <CrudPage
      endpoint="/housekeeping-tasks"
      idKey="taskId"
      title="Housekeeping"
      subtitle="View and update assigned cleaning tasks."
      fields={[
        { key: "roomId", label: "Room ID", type: "number", required: true, placeholder: "101" },
        { key: "staffId", label: "Staff ID", type: "number", required: true, placeholder: "e.g. 1" },
        { key: "taskDate", label: "Task Date", type: "date", required: true },
        { key: "status", label: "Status", type: "select", required: true, options: ["Pending", "In Progress", "Completed"] },
        { key: "remarks", label: "Remarks", type: "text", placeholder: "Any notes" },
      ]}
      columns={[
        { key: "taskId", label: "Task ID" },
        { key: "roomId", label: "Room ID" },
        { key: "staffId", label: "Staff ID" },
        { key: "taskDate", label: "Task Date" },
        { key: "status", label: "Status" },
        { key: "remarks", label: "Remarks" },
      ]}
    />
  );
}
