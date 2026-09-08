
import { useEffect, useState } from "react";
import Field from "../components/Field";
import { api } from "../api/client";
import { toast } from "react-hot-toast";
import {
  Users,
  UserPlus,
  User,
  Phone,
  MapPin,
  Building2,
  BadgeIndianRupee,
  Search,
  Trash2,
  Loader2,
  Inbox,
  Plus,
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gstin: "",
    city: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  function loadCustomers() {
    setLoading(true);

    api
      .get("/customers")
      .then((data) => {
        setCustomers(data.customers || []);
      })
      .catch(() => {
        toast.error("Failed to load customers");
      })
      .finally(() => setLoading(false));
  }

  function update(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));
  }

  async function handleAdd() {
    if (!form.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setSaving(true);

    try {
      await api.post("/customers", form);

      toast.success("Customer added successfully");

      setForm({
        name: "",
        phone: "",
        gstin: "",
        city: "",
        address: "",
      });

      loadCustomers();
    } catch (err) {
      toast.error(err.message || "Failed to add customer");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api.delete(`/customers/${id}`);

      setCustomers((c) => c.filter((cust) => cust._id !== id));

      toast.success("Customer deleted");
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search),
  );

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <Users size={28} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Customer Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Customers
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                Manage your customer database and billing details.
              </p>
            </div>
          </div>

          {!loading && (
            <div className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur">
              <Users size={17} />

              <span className="text-sm font-semibold">
                {customers.length} customer
                {customers.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserPlus size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Add Customer
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Save customer details for faster billing
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Name */}
            <Field label="Name *">
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={inputClass}
                  placeholder="Customer name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
            </Field>

            {/* Phone */}
            <Field label="Phone">
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="tel"
                  className={inputClass}
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </Field>

            {/* GSTIN */}
            <Field label="GSTIN (optional)">
              <div className="relative">
                <BadgeIndianRupee
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} uppercase`}
                  placeholder="GSTIN"
                  value={form.gstin}
                  onChange={(e) => update("gstin", e.target.value)}
                />
              </div>
            </Field>

            {/* City */}
            <Field label="City">
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={inputClass}
                  placeholder="Ahmedabad"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
            </Field>

            {/* Address */}
            <div className="sm:col-span-2">
              <Field label="Address">
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3.5 top-3.5 text-slate-400"
                  />

                  <textarea
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    placeholder="Customer address"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Add Button */}
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
                  Adding Customer...
                </>
              ) : (
                <>
                  <Plus
                    size={17}
                    className="transition-transform group-hover:rotate-90"
                  />
                  Add Customer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Database */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Database Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Users size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Database
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Search and manage saved customers
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Loader2 size={32} className="animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading customers...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching your customer database
            </p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={29} />
            </div>

            <h3 className="mt-5 text-base font-semibold text-slate-800">
              {search ? "No matching customers" : "No customers yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              {search
                ? "Try searching with a different customer name or phone number."
                : "Add your first customer using the form above."}
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
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      City
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      GSTIN
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Address
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((customer) => (
                    <tr
                      key={customer._id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      {/* Customer */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 text-sm font-bold text-indigo-700">
                            {customer.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {customer.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Customer
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-5">
                        {customer.phone ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} className="text-slate-400" />

                            {customer.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>

                      {/* City */}
                      <td className="px-6 py-5">
                        {customer.city ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin size={14} className="text-slate-400" />

                            {customer.city}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>

                      {/* GST */}
                      <td className="px-6 py-5">
                        {customer.gstin ? (
                          <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                            {customer.gstin}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="max-w-[250px] px-6 py-5">
                        <p className="truncate text-sm text-slate-500">
                          {customer.address || "—"}
                        </p>
                      </td>

                      {/* Delete */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(customer._id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:border-red-200 hover:bg-red-100 hover:text-red-600"
                          title="Delete customer"
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
              {filtered.map((customer) => (
                <div key={customer._id} className="p-4">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 text-sm font-bold text-indigo-700">
                        {customer.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {customer.name}
                        </p>

                        {customer.city && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={12} />
                            {customer.city}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(customer._id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                      aria-label="Delete customer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Customer Details */}
                  <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4">
                    {customer.phone && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                          <Phone size={14} />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Phone
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-slate-700">
                            {customer.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {customer.gstin && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                          <BadgeIndianRupee size={14} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            GSTIN
                          </p>

                          <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                            {customer.gstin}
                          </p>
                        </div>
                      </div>
                    )}

                    {customer.address && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                          <MapPin size={14} />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Address
                          </p>

                          <p className="mt-0.5 text-sm leading-5 text-slate-600">
                            {customer.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {customers.length}
                </span>{" "}
                customers
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
