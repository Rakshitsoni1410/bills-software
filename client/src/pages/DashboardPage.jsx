import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import Badge from "../components/Badge";
import { api } from "../api/client";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="text-sm text-gray-400">Loading dashboard...</div>;
  if (!stats)
    return (
      <div className="text-sm text-gray-400">Could not load dashboard.</div>
    );

  const gstRates = Object.entries(stats.gstByRate || {}).sort(
    (a, b) => b[1] - a[1],
  );
  const maxGst = gstRates.length ? Math.max(...gstRates.map(([, v]) => v)) : 1;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-indigo-900">
            ₹
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Billling system for small businesses
            </h1>

            <p className="text-slate-500">
              Manage your business from one place
            </p>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Sales"
          value={`₹${stats.totalSales.toLocaleString("en-IN")}`}
          sub={`${stats.invoiceCount} invoices`}
          color="text-indigo-900"
        />

        <MetricCard
          label="GST Collected"
          value={`₹${stats.totalGst.toLocaleString("en-IN")}`}
          sub="CGST + SGST"
          color="text-teal-600"
        />

        <MetricCard
          label="Pending Udhaar"
          value={`₹${Math.max(0, stats.udhaarPending).toLocaleString("en-IN")}`}
          sub={`${stats.udhaarCustomerCount} customers`}
          color="text-red-600"
        />

        <MetricCard
          label="Customers"
          value={stats.customerCount}
          sub="registered"
          color="text-amber-600"
        />
      </div>

      <div
        className=" bg-white/95
backdrop-blur
rounded-3xl
shadow-xl
border
border-slate-100 p-4 sm:p-5 mb-6"
      >
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">
          GST breakdown by rate
        </h2>
        {gstRates.length === 0 ? (
          <p className="text-sm text-gray-400">
            No invoices yet. Create a bill to see analytics.
          </p>
        ) : (
          <div className="space-y-2">
            {gstRates.map(([rate, value]) => (
              <div key={rate} className="flex items-center gap-3 text-sm">
                <div className="w-16 text-right text-gray-500 text-xs">
                  {rate}% GST
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full"
                    style={{ width: `${Math.round((value / maxGst) * 100)}%` }}
                  ></div>
                </div>
                <div className="w-20 text-xs text-gray-700">
                  ₹{Math.round(value).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="bg-white/95
backdrop-blur
rounded-3xl
shadow-xl
border
border-slate-100 p-4 sm:p-5 mb-6"
      >
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">
          Recent invoices
        </h2>
        {stats.recentInvoices.length === 0 ? (
          <p className="text-sm text-gray-400">No invoices yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentInvoices.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <div className="text-sm font-medium">
                    {inv.invoiceNo} · {inv.customerName}
                  </div>
                  <div className="text-xs text-gray-500">{inv.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ₹{inv.total.toLocaleString("en-IN")}
                  </div>
                  <Badge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link
          to="/billing"
          className="bg-teal-500
hover:bg-teal-600
shadow-lg
shadow-teal-500/20
font-semibold text-white text-sm px-4 py-2 rounded-md"
        >
          + Create new bill
        </Link>
        <Link
          to="/khata"
          className="bg-white
border border-slate-200
hover:bg-slate-50
font-medium text-sm px-4 py-2 rounded-md"
        >
          View khata
        </Link>
      </div>
    </div>
  );
}
