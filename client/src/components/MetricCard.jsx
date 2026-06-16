export default function MetricCard({
  label,
  value,
  sub,
  color = "text-indigo-900",
}) {
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-5 shadow-xl border border-white/20">
      <div className="text-sm text-slate-500 mb-2">
        {label}
      </div>

      <div className={`text-3xl font-bold ${color}`}>
        {value}
      </div>

      {sub && (
        <div className="text-xs text-slate-400 mt-2">
          {sub}
        </div>
      )}
    </div>
  );
}