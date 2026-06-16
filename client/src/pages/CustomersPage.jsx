import { useEffect, useState } from "react";
import Field from "../components/Field";
import { api } from "../api/client";
import { toast } from "react-hot-toast";

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
      (c.phone || "").includes(search)
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-indigo-900">
            👥
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Customers
            </h1>

            <p className="text-slate-500">
              Manage your customer database
            </p>
          </div>
        </div>
      </div>

      {/* Add Customer */}
      <div
        className="
        bg-white/95
        backdrop-blur
        rounded-3xl
        shadow-xl
        border
        border-slate-100
        p-4 sm:p-5
        mb-6"
      >
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-4">
          Add customer
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name *">
            <input
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>

          <Field label="Phone">
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>

          <Field label="GSTIN (optional)">
            <input
              className="input"
              value={form.gstin}
              onChange={(e) => update("gstin", e.target.value)}
            />
          </Field>

          <Field label="City">
            <input
              className="input"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Address">
              <input
                className="input"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={saving}
          className="
          mt-4
          bg-teal-500
          hover:bg-teal-600
          shadow-lg
          shadow-teal-500/20
          font-semibold
          text-white
          text-sm
          px-4
          py-2
          rounded-md
          transition
          disabled:opacity-60"
        >
          {saving ? "Adding..." : "+ Add customer"}
        </button>
      </div>

      {/* Customer Database */}
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
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-4">
          Customer database
        </h2>

        <input
          className="input mb-4"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-sm text-gray-400">Loading customers...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400">No customers found.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="flex items-center gap-3 py-3"
              >
                <div
                  className="
                  w-10
                  h-10
                  rounded-xl
                  bg-teal-100
                  text-indigo-900
                  flex
                  items-center
                  justify-center
                  text-xs
                  font-bold
                  flex-shrink-0"
                >
                  {c.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    {c.name}
                  </div>

                  <div className="text-xs text-slate-500 truncate">
                    {c.phone}
                    {c.city ? ` · ${c.city}` : ""}
                    {c.gstin ? ` · GSTIN: ${c.gstin}` : ""}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(c._id)}
                  className="
                  text-xs
                  text-red-600
                  border
                  border-red-100
                  rounded-md
                  px-3
                  py-1.5
                  hover:bg-red-50
                  font-medium
                  transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}