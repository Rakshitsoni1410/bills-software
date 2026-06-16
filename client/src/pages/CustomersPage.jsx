import { useEffect, useState } from "react";
import Field from "../components/Field";
import { api } from "../api/client";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", gstin: "", city: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  function loadCustomers() {
    setLoading(true);
    api
      .get("/customers")
      .then((data) => setCustomers(data.customers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd() {
    if (!form.name.trim()) {
      alert("Customer name is required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/customers", form);
      setForm({ name: "", phone: "", gstin: "", city: "", address: "" });
      loadCustomers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this customer?")) return;
    await api.delete(`/customers/${id}`);
    setCustomers((c) => c.filter((cust) => cust._id !== id));
  }

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || "").includes(search)
  );

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Customers</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-4">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">Add customer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name *">
            <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label="GSTIN (optional)">
            <input className="input" value={form.gstin} onChange={(e) => update("gstin", e.target.value)} />
          </Field>
          <Field label="City">
            <input className="input" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <input className="input" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </Field>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="mt-3 bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Adding..." : "+ Add customer"}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">Customer database</h2>
        <input
          className="input mb-3"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400">No customers found.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <div key={c._id} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {c.phone}
                    {c.city ? ` · ${c.city}` : ""}
                    {c.gstin ? ` · GSTIN: ${c.gstin}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-xs text-red-600 border border-red-100 rounded-md px-2 py-1 hover:bg-red-50"
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
