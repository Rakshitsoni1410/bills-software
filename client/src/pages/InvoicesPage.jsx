import { useEffect, useState } from "react";
import Badge from "../components/Badge";
import { api } from "../api/client";
import { toast } from "react-hot-toast";

const TABS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "udhaar", label: "Udhaar" },
  { value: "partial", label: "Partial" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadInvoices(filter);
  }, [filter]);

  function loadInvoices(status) {
    setLoading(true);

    const query = status === "all" ? "" : `?status=${status}`;

    api
      .get(`/invoices${query}`)
      .then((data) => {
        setInvoices(data.invoices || []);
      })
      .catch(() => {
        toast.error("Failed to load invoices");
      })
      .finally(() => setLoading(false));
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-indigo-900">
            📄
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>

            <p className="text-slate-500">
              View and manage all generated invoices
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div
        className="
        bg-white/95
        backdrop-blur
        rounded-3xl
        shadow-xl
        border
        border-slate-100
        p-4 sm:p-5"
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`text-sm px-4 py-2 rounded-xl border transition font-medium
                ${
                  filter === tab.value
                    ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Invoice Count */}
        {!loading && (
          <div className="mb-4 text-sm text-slate-500">
            {invoices.length} invoice
            {invoices.length !== 1 ? "s" : ""} found
          </div>
        )}

        {/* Content */}
        {loading ? (
          <p className="text-sm text-gray-400">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-gray-400">No invoices found.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {inv.invoiceNo} · {inv.customerName}
                  </div>

                  <div className="text-xs text-slate-500">
                    {inv.date} · {inv.items.length} item
                    {inv.items.length > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-indigo-900">
                    ₹{inv.total.toLocaleString("en-IN")}
                  </div>

                  <Badge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
