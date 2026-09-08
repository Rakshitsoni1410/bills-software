import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import Badge from "../components/Badge";
import { api } from "../api/client";
import {
  ArrowRight,
  FilePlus2,
  ReceiptText,
  Wallet,
  BarChart3,
  FileText,
  CalendarDays,
  Sparkles,
  Loader2,
  TriangleAlert,
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
          <Loader2 size={30} className="animate-spin text-indigo-600" />
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700">
          Loading dashboard...
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Preparing your business overview
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <TriangleAlert size={30} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-800">
          Could not load dashboard
        </h2>

        <p className="mt-1 max-w-sm text-sm text-slate-500">
          We couldn't fetch your business information. Please refresh the page
          and try again.
        </p>
      </div>
    );
  }

  const gstRates = Object.entries(stats.gstByRate || {}).sort(
    (a, b) => b[1] - a[1],
  );

  const maxGst = gstRates.length
    ? Math.max(...gstRates.map(([, value]) => value))
    : 1;

  return (
    <div className="space-y-7">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8 sm:py-8">
        {/* Decoration */}
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 left-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <ReceiptText size={28} />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={15} className="text-cyan-200" />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
                  Business Overview
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Billing system for small businesses
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                Track sales, GST, customers, invoices and pending udhaar from
                one place.
              </p>
            </div>
          </div>

          <Link
            to="/billing"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            <FilePlus2 size={18} />
            Create New Bill
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Sales"
          value={`₹${Number(stats.totalSales || 0).toLocaleString("en-IN")}`}
          sub={`${stats.invoiceCount || 0} invoices`}
          color="text-indigo-700"
          type="sales"
        />

        <MetricCard
          label="GST Collected"
          value={`₹${Number(stats.totalGst || 0).toLocaleString("en-IN")}`}
          sub="CGST + SGST"
          color="text-emerald-600"
          type="revenue"
        />

        <MetricCard
          label="Pending Udhaar"
          value={`₹${Math.max(
            0,
            Number(stats.udhaarPending || 0),
          ).toLocaleString("en-IN")}`}
          sub={`${stats.udhaarCustomerCount || 0} customers`}
          color="text-red-600"
          type="invoices"
        />

        <MetricCard
          label="Customers"
          value={stats.customerCount || 0}
          sub="Registered customers"
          color="text-amber-600"
          type="customers"
        />
      </div>

      {/* Analytics + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* GST Breakdown */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BarChart3 size={20} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  GST Breakdown
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  GST collection grouped by tax rate
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {gstRates.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <BarChart3 size={26} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-700">
                  No GST data yet
                </h3>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  Create your first invoice and GST analytics will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {gstRates.map(([rate, value]) => {
                  const percentage = Math.round((Number(value) / maxGst) * 100);

                  return (
                    <div key={rate}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 min-w-[56px] items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600">
                            {rate}% GST
                          </div>
                        </div>

                        <div className="text-sm font-bold text-slate-800">
                          ₹{Math.round(Number(value)).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-indigo-600 transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1.5 text-right text-[11px] font-medium text-slate-400">
                        {percentage}% relative contribution
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-slate-500">Common business tasks</p>
          </div>

          <div className="space-y-3">
            <Link
              to="/billing"
              className="group flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 p-4 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                  <FilePlus2 size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Create Bill
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Generate a new invoice
                  </p>
                </div>
              </div>

              <ArrowRight
                size={18}
                className="text-indigo-500 transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/khata"
              className="group flex items-center justify-between rounded-2xl border border-red-100 bg-red-50/70 p-4 transition-all duration-200 hover:border-red-200 hover:bg-red-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white shadow-md shadow-red-500/20">
                  <Wallet size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">View Khata</p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Check pending balances
                  </p>
                </div>
              </div>

              <ArrowRight
                size={18}
                className="text-red-400 transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/invoices"
              className="group flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                  <FileText size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    All Invoices
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Browse billing history
                  </p>
                </div>
              </div>

              <ArrowRight
                size={18}
                className="text-emerald-500 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Invoices
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Your latest billing activity
              </p>
            </div>
          </div>

          <Link
            to="/invoices"
            className="hidden items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 sm:flex"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {stats.recentInvoices?.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText size={28} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No invoices yet
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Create your first bill to start tracking sales.
            </p>

            <Link
              to="/billing"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <FilePlus2 size={16} />
              Create First Bill
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Invoice
                    </th>

                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Customer
                    </th>

                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>

                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {stats.recentInvoices?.map((inv) => (
                    <tr
                      key={inv._id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <ReceiptText size={16} />
                          </div>

                          <span className="text-sm font-bold text-slate-800">
                            {inv.invoiceNo}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {inv.customerName}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays size={15} className="text-slate-400" />
                          {inv.date}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                        ₹{Number(inv.total || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {stats.recentInvoices?.map((inv) => (
                <div key={inv._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {inv.invoiceNo}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-600">
                        {inv.customerName}
                      </p>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarDays size={13} />
                        {inv.date}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="mb-2 text-sm font-bold text-slate-900">
                        ₹{Number(inv.total || 0).toLocaleString("en-IN")}
                      </p>

                      <Badge status={inv.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-slate-100 p-4 sm:hidden">
          <Link
            to="/invoices"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700"
          >
            View All Invoices
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
