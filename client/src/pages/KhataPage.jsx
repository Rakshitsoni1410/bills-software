import { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import Badge from "../components/Badge";
import Field from "../components/Field";
import { api } from "../api/client";
import { toast } from "react-hot-toast";
import {
  Wallet,
  Plus,
  User,
  IndianRupee,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Loader2,
  BookOpen,
  ReceiptIndianRupee,
  TriangleAlert,
  Search,
} from "lucide-react";

export default function KhataPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    customerName: "",
    amount: "",
    type: "udhaar",
    note: "",
  });

  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  function loadEntries() {
    setLoading(true);

    api
      .get("/khata")
      .then((data) => setEntries(data.entries || []))
      .catch(() => toast.error("Failed to load khata entries"))
      .finally(() => setLoading(false));
  }

  function update(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));
  }

  async function handleAdd() {
    if (!form.customerName.trim() || !form.amount) {
      toast.error("Customer name and amount are required");
      return;
    }

    setSaving(true);

    try {
      await api.post("/khata", {
        ...form,
        amount: Number(form.amount),
        date: new Date().toISOString().split("T")[0],
      });

      toast.success("Entry added");

      setForm({
        customerName: "",
        amount: "",
        type: "udhaar",
        note: "",
      });

      loadEntries();
    } catch (err) {
      toast.error(err.message || "Failed to add entry");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this entry?")) return;

    try {
      await api.delete(`/khata/${id}`);

      setEntries((e) => e.filter((entry) => entry._id !== id));

      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  const given = entries
    .filter((e) => e.type === "udhaar")
    .reduce((s, e) => s + e.amount, 0);

  const received = entries
    .filter((e) => e.type === "received")
    .reduce((s, e) => s + e.amount, 0);

  const pending = given - received;

  const filteredEntries = entries.filter((entry) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return (
      entry.customerName?.toLowerCase().includes(term) ||
      entry.note?.toLowerCase().includes(term) ||
      entry.date?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-28 left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
            <Wallet size={27} />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
              Customer Ledger
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Khata / Udhaar
            </h1>

            <p className="mt-2 text-sm text-indigo-100">
              Track credit given and payments received from customers.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Total Udhaar Given"
          value={`₹${Number(given || 0).toLocaleString("en-IN")}`}
          sub="Total credit given"
          color="text-red-600"
        />

        <MetricCard
          label="Received Back"
          value={`₹${Number(received || 0).toLocaleString("en-IN")}`}
          sub="Payments received"
          color="text-emerald-600"
        />

        <MetricCard
          label="Still Pending"
          value={`₹${Math.max(0, pending).toLocaleString("en-IN")}`}
          sub="Outstanding balance"
          color="text-amber-600"
        />
      </div>

      {/* Add Entry */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Plus size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Add Khata Entry
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Record udhaar given or payment received
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Type Selector */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update("type", "udhaar")}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                form.type === "udhaar"
                  ? "border-red-200 bg-red-50 text-red-700 ring-4 ring-red-50"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <ArrowUpRight size={18} />

              Udhaar Diya
            </button>

            <button
              type="button"
              onClick={() => update("type", "received")}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                form.type === "received"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <ArrowDownLeft size={18} />

              Paisa Mila
            </button>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Customer name">
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  placeholder="Ramesh bhai"
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                />
              </div>
            </Field>

            <Field label="Amount (₹)">
              <div className="relative">
                <IndianRupee
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  placeholder="500"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                />
              </div>
            </Field>

            <Field label="Type">
              <div className="relative">
                <Wallet
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                >
                  <option value="udhaar">Udhaar diya</option>
                  <option value="received">Paisa mila</option>
                </select>
              </div>
            </Field>

            <Field label="Note">
              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  placeholder="Grocery, payment, etc."
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                />
              </div>
            </Field>
          </div>

          {/* Submit */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Adding Entry...
                </>
              ) : (
                <>
                  <Plus
                    size={17}
                    className="transition-transform group-hover:rotate-90"
                  />
                  Add Entry
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Ledger */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Ledger Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Khata Ledger
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Complete credit and payment history
              </p>
            </div>
          </div>

          {/* Search */}
          {!loading && entries.length > 0 && (
            <div className="relative w-full lg:w-72">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Loader2 size={32} className="animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading khata entries...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching your ledger
            </p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty */
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ReceiptIndianRupee size={29} />
            </div>

            <h3 className="mt-5 text-base font-semibold text-slate-800">
              No khata entries yet
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              Add your first udhaar or payment entry using the form above.
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          /* No Search Results */
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
            <Search size={30} className="text-slate-300" />

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              No matching entries
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try searching with another customer name.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Note
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Type
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.map((entry) => (
                    <tr
                      key={entry._id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      {/* Customer */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              entry.type === "udhaar"
                                ? "bg-red-50 text-red-500"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            <User size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {entry.customerName}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Khata customer
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {entry.date}
                      </td>

                      {/* Note */}
                      <td className="max-w-[240px] px-6 py-5">
                        <p className="truncate text-sm text-slate-500">
                          {entry.note || "—"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <Badge status={entry.type} />
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5 text-right">
                        <div
                          className={`inline-flex items-center gap-1 text-sm font-bold ${
                            entry.type === "udhaar"
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {entry.type === "udhaar" ? (
                            <ArrowUpRight size={15} />
                          ) : (
                            <ArrowDownLeft size={15} />
                          )}

                          {entry.type === "udhaar" ? "-" : "+"}₹
                          {Number(entry.amount || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry._id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:border-red-200 hover:bg-red-100 hover:text-red-600"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredEntries.map((entry) => (
                <div key={entry._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          entry.type === "udhaar"
                            ? "bg-red-50 text-red-500"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {entry.type === "udhaar" ? (
                          <ArrowUpRight size={18} />
                        ) : (
                          <ArrowDownLeft size={18} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {entry.customerName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {entry.date}
                        </p>
                      </div>
                    </div>

                    <Badge status={entry.type} />
                  </div>

                  {entry.note && (
                    <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Note
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {entry.note}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Amount
                      </p>

                      <p
                        className={`mt-1 text-lg font-bold ${
                          entry.type === "udhaar"
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {entry.type === "udhaar" ? "- " : "+ "}₹
                        {Number(entry.amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(entry._id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                      aria-label="Delete khata entry"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ledger Footer */}
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredEntries.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {entries.length}
                </span>{" "}
                entries
              </p>

              {pending > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <TriangleAlert size={14} />
                  ₹{pending.toLocaleString("en-IN")} still pending
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}