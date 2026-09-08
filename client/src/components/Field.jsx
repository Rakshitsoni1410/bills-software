export default function Field({ label, children, required = false }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1 text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="text-red-500 text-base leading-none">*</span>
        )}
      </label>

      <div className="relative">
        {children}
      </div>
    </div>
  );
}