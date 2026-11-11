import CrudPage from "../components/CrudPage.jsx";

export default function PaymentsPage() {
  return (
    <CrudPage
      endpoint="/payments"
      idKey="paymentId"
      title="Payments"
      subtitle="Record payments against bookings."
      fields={[
        { key: "bookingId", label: "Booking ID", type: "number", required: true, placeholder: "1" },
        { key: "receivedBy", label: "Received By (Staff ID)", type: "number", required: true, placeholder: "1" },
        { key: "amount", label: "Amount", type: "number", required: true, placeholder: "5000" },
        { key: "paymentDate", label: "Payment Date", type: "date", required: true },
        { key: "method", label: "Method", type: "select", required: true, options: [
          { value: "Cash", label: "Cash" },
          { value: "Card", label: "Card" },
          { value: "bKash", label: "bKash" },
          { value: "Mobile Banking", label: "Mobile Banking" },
        ] },
        { key: "status", label: "Status", type: "select", required: true, options: [
          { value: "Paid", label: "Paid" },
          { value: "Partial", label: "Partial" },
          { value: "Pending", label: "Pending" },
        ] },
      ]}
    />
  );
}
