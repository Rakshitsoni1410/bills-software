import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description = "",
  confirmLabel = "Confirm",
  loadingLabel = "Working...",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
  warningTitle = "",
  warningText = "",
  children,
  variant = "danger",
}) {
  if (!open) return null;

  const theme =
    variant === "warning"
      ? {
          accent: "from-amber-500 via-orange-500 to-yellow-400",
          iconBg: "bg-amber-50",
          iconText: "text-amber-600",
          warningBorder: "border-amber-100",
          warningBg: "bg-amber-50",
          warningTitle: "text-amber-800",
          warningText: "text-amber-700/80",
          button: "bg-amber-600 shadow-amber-500/20 hover:bg-amber-700",
        }
      : {
          accent: "from-red-600 via-rose-500 to-orange-400",
          iconBg: "bg-red-50",
          iconText: "text-red-600",
          warningBorder: "border-red-100",
          warningBg: "bg-red-50",
          warningTitle: "text-red-700",
          warningText: "text-red-600/80",
          button: "bg-red-600 shadow-red-500/20 hover:bg-red-700",
        };

  function handleBackdropClick() {
    if (!loading) {
      onCancel?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={handleBackdropClick}
        className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl shadow-black/30">
        <div className={`h-1.5 w-full bg-gradient-to-r ${theme.accent}`} />

        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.iconText}`}
            >
              <AlertTriangle size={23} />
            </div>

            <div>
              <h2
                id="confirm-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                {title}
              </h2>

              {description && (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close confirmation"
          >
            <X size={18} />
          </button>
        </div>

        {children && (
          <div className="mx-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {children}
          </div>
        )}

        {(warningTitle || warningText) && (
          <div
            className={`mx-6 mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${theme.warningBorder} ${theme.warningBg}`}
          >
            <AlertTriangle
              size={17}
              className={`mt-0.5 shrink-0 ${theme.iconText}`}
            />

            <div>
              {warningTitle && (
                <p className={`text-xs font-semibold ${theme.warningTitle}`}>
                  {warningTitle}
                </p>
              )}

              {warningText && (
                <p className={`mt-1 text-xs leading-5 ${theme.warningText}`}>
                  {warningText}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${theme.button}`}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                {loadingLabel}
              </>
            ) : (
              <>
                <Trash2 size={17} />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
