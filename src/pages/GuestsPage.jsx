import CrudPage from "../components/CrudPage.jsx";

export default function GuestsPage() {
  return (
    <CrudPage
      endpoint="/guests"
      idKey="guestId"
      title="Guests"
      subtitle="Register and manage hotel guests."
      fields={[
        { key: "name", label: "Full Name", type: "text", required: true, placeholder: "Guest full name" },
        { key: "phone", label: "Phone", type: "text", required: true, placeholder: "01XXXXXXXXX" },
        { key: "email", label: "Email", type: "text", placeholder: "guest@email.com" },
        { key: "address", label: "Address", type: "text", placeholder: "Guest address" },
        { key: "nationality", label: "Nationality", type: "text", placeholder: "Bangladeshi" },
        { key: "idNumber", label: "ID Number", type: "text", required: true, placeholder: "NID / Passport number" },
      ]}
    />
  );
}
