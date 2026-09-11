import {
  IndianRupee,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";

const icons = {
  sales: IndianRupee,      // ← was DollarSign, now IndianRupee
  revenue: TrendingUp,
  customers: Users,
  invoices: FileText,
};

const bgColors = {
  sales: "bg-green-100 text-green-600",
  revenue: "bg-indigo-100 text-indigo-600",
  customers: "bg-blue-100 text-blue-600",
  invoices: "bg-orange-100 text-orange-600",
};

export default function MetricCard({
  label,
  value,
  sub,
  color = "text-slate-900",
  type = "sales",
}) {
  const Icon = icons[type] || IndianRupee;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <h2 className={`mt-3 text-3xl font-bold ${color}`}>
            {value}
          </h2>

          {sub && (
            <p className="mt-2 text-xs text-slate-400">
              {sub}
            </p>
          )}
        </div>

        <div
          className={`h-14 w-14 rounded-xl flex items-center justify-center ${bgColors[type]}`}
        >
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}