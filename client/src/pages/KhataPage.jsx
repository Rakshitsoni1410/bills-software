import { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import Badge from "../components/Badge";
import Field from "../components/Field";
import { api } from "../api/client";

export default function KhataPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customerName: "", amount: "", type: "udhaar", note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  function loadEntries() {
    setLoading(true);
    api
      .get("/khata")
      .then((data) => setEntries(data.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd() {
    if (!form.customerName.trim() || !form.amount) {
      alert("Customer name and amount are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/khata", {
        ...form,
        amount: Number(form.amount),
        date: new Date().toISOString().split("T")[0],
      });
      setForm({ customerName: "", amount: "", type: "udhaar", note: "" });
      loadEntries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this entry?")) return;
    await api.delete(`/khata/${id}`);
    setEntries((e) => e.filter((entry) => entry._id !== id));
  }

  const given = entries.filter((e) => e.type === "udhaar").reduce((s, e) => s + e.amount, 0);
  const received = entries.filter((e) => e.type === "received").reduce((s, e) => s + e.amount, 0);
  const pending = given - received;

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Khata / Udhaar</h1>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricCard label="Total udhaar given" value={`₹${given.toLocaleString("en-IN")}`} color="text-red-600" />
        <MetricCard label="Received back" value={`₹${received.toLocaleString("en-IN")}`} color="text-green-600" />
        <MetricCard
          label="Still pending"
          value={`₹${Math.max(0, pending).toLocaleString("en-IN")}`}
          color="text-red-600"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-4">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">Add khata entry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Customer name">
            <input
              className="input"
              placeholder="Ramesh bhai"
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
            />
          </Field>
          <Field label="Amount (₹)">
            <input
              type="number"
              className="input"
              placeholder="500"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
            />
          </Field>
          <Field label="Type">
            <select className="input" value={form.type} onChange={(e) => update("type", e.target.value)}>
              <option value="udhaar">Udhaar diya (credit given)</option>
              <option value="received">Paisa mila (received)</option>
            </select>
          </Field>
          <Field label="Note">
            <input
              className="input"
              placeholder="Grocery, etc."
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
            />
          </Field>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="mt-3 bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Adding..." : "+ Add entry"}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">Khata ledger</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-400">No entries yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((e) => (
              <div key={e._id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{e.customerName}</div>
                  <div className="text-xs text-gray-500">
                    {e.date}
                    {e.note ? ` · ${e.note}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div
                      className={e.type === "udhaar" ? "text-red-600 font-medium text-sm" : "text-green-600 font-medium text-sm"}
                    >
                      {e.type === "udhaar" ? "- " : "+ "}₹{e.amount.toLocaleString("en-IN")}
                    </div>
                    <Badge status={e.type} />
                  </div>
                  <button onClick={() => handleDelete(e._id)} className="text-xs text-gray-400 hover:text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
