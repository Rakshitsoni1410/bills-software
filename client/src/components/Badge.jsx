import {
  CheckCircle,
  AlertCircle,
  Clock3,
  Wallet,
} from "lucide-react";

const badgeConfig = {
  paid: {
    label: "Paid",
    icon: CheckCircle,
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  udhaar: {
    label: "Udhaar",
    icon: Wallet,
    className:
      "bg-rose-50 text-rose-700 border border-rose-200",
  },
  partial: {
    label: "Partial",
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-700 border border-amber-200",
  },
  received: {
    label: "Received",
    icon: AlertCircle,
    className:
      "bg-sky-50 text-sky-700 border border-sky-200",
  },
};

export default function Badge({ status }) {
  const badge = badgeConfig[status] || badgeConfig.partial;
  const Icon = badge.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full
        px-3.5 py-1.5
        text-xs font-semibold
        shadow-sm
        transition-all duration-200
        hover:scale-105
        ${badge.className}
      `}
    >
      <Icon size={14} strokeWidth={2.2} />
      {badge.label}
    </span>
  );
}