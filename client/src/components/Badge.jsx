const styles = {
  paid: "bg-green-50 text-green-700",
  udhaar: "bg-red-50 text-red-700",
  partial: "bg-gray-100 text-gray-600",
  received: "bg-green-50 text-green-700",
};

const labels = {
  paid: "Paid",
  udhaar: "Udhaar",
  partial: "Partial",
  received: "Received",
};

export default function Badge({ status }) {
  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full ${styles[status] || styles.partial}`}>
      {labels[status] || status}
    </span>
  );
}
