import { useEffect, useState } from "react";
import Badge from "../components/Badge";
import { api } from "../api/client";

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
      .then((data) => setInvoices(data.invoices || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Invoices</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        <div className="flex gap-1 mb-4 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`text-xs px-3 py-1.5 rounded-md border ${
                filter === tab.value
                  ? "bg-gray-100 text-gray-900 border-gray-300"
                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-gray-400">No invoices.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">
                    {inv.invoiceNo} · {inv.customerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {inv.date} · {inv.items.length} item{inv.items.length > 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">₹{inv.total.toLocaleString("en-IN")}</div>
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
