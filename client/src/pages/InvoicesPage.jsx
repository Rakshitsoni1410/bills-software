import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Badge from "../components/Badge";
import { api } from "../api/client";
import { toast } from "react-hot-toast";

import {
  FileText,
  Search,
  ReceiptText,
  CalendarDays,
  Package,
  IndianRupee,
  Loader2,
  Inbox,
  Eye,
  ChevronRight,
} from "lucide-react";

const TABS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "udhaar", label: "Udhaar" },
  { value: "partial", label: "Partial" },
];

export default function InvoicesPage() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

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
      .finally(() => {
        setLoading(false);
      });
  }

  function viewInvoice(id) {
    navigate(`/invoices/${id}`);
  }

  const filteredInvoices = invoices.filter((inv) => {
    const term = search.trim().toLowerCase();

    return (
      inv.invoiceNo?.toLowerCase().includes(term) ||
      inv.customerName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <ReceiptText size={27} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Billing Records
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Invoices
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                View and manage all generated invoices.
              </p>
            </div>
          </div>

          {!loading && (
            <div className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur">
              <FileText size={17} />

              <span className="text-sm font-semibold">
                {invoices.length} invoice
                {invoices.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Controls */}
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(tab.value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    filter === tab.value
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or customer..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <Loader2 size={34} className="animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading invoices...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching your billing records
            </p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          /* Empty */
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={30} />
            </div>

            <h3 className="mt-5 text-base font-semibold text-slate-800">
              No invoices found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "No invoices match your search."
                : "There are no invoices available for this status."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Invoice
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Items
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv._id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      {/* Invoice */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {inv.invoiceNo}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {inv.docType || "Invoice"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {inv.customerName}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays size={15} className="text-slate-400" />

                          {inv.date}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <Package size={13} />

                          {inv.items?.length || 0}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex items-center justify-end font-bold text-slate-900">
                          <IndianRupee size={15} />

                          {Number(inv.total || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 text-right">
                        <Badge status={inv.status} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => viewInvoice(inv._id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredInvoices.map((inv) => (
                <div key={inv._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FileText size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {inv.invoiceNo}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-600">
                          {inv.customerName}
                        </p>
                      </div>
                    </div>

                    <Badge status={inv.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Date
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <CalendarDays size={13} />

                        {inv.date}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Items
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Package size={13} />
                        {inv.items?.length || 0} item
                        {(inv.items?.length || 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium text-slate-400">
                        Total amount
                      </span>

                      <div className="mt-1 flex items-center text-lg font-bold text-slate-900">
                        <IndianRupee size={16} />

                        {Number(inv.total || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => viewInvoice(inv._id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700"
                    >
                      View Invoice
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredInvoices.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {invoices.length}
                </span>{" "}
                invoices
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
