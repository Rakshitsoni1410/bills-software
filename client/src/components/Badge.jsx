const styles = {
  paid: "bg-emerald-100 text-emerald-700",
  udhaar: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
  received: "bg-teal-100 text-teal-700",
};

const labels = {
  paid: "Paid",
  udhaar: "Udhaar",
  partial: "Partial",
  received: "Received",
};

export default function Badge({ status }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        ${styles[status] || styles.partial}
      `}
    >
      {labels[status] || status}
    </span>
  );
}
