import { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import Badge from "../components/Badge";
import Field from "../components/Field";
import { api } from "../api/client";
import { toast } from "react-hot-toast";

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-indigo-900">
            ₹
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Khata / Udhaar
            </h1>

            <p className="text-slate-500">Track credit and payment records</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Total Udhaar Given"
          value={`₹${given.toLocaleString("en-IN")}`}
          color="text-red-600"
        />

        <MetricCard
          label="Received Back"
          value={`₹${received.toLocaleString("en-IN")}`}
          color="text-teal-600"
        />

        <MetricCard
          label="Still Pending"
          value={`₹${Math.max(0, pending).toLocaleString("en-IN")}`}
          color="text-amber-600"
        />
      </div>

      {/* Add Entry */}
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-4">
          Add khata entry
        </h2>

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
            <select
              className="input"
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
            >
              <option value="udhaar">Udhaar diya</option>
              <option value="received">Paisa mila</option>
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
            disabled:opacity-60
          "
        >
          {saving ? "Adding..." : "+ Add entry"}
        </button>
      </div>

      {/* Ledger */}
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-5">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-4">
          Khata ledger
        </h2>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-400">No entries yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {e.customerName}
                  </div>

                  <div className="text-xs text-slate-500">
                    {e.date}
                    {e.note ? ` · ${e.note}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`font-semibold text-sm ${
                        e.type === "udhaar" ? "text-red-600" : "text-teal-600"
                      }`}
                    >
                      {e.type === "udhaar" ? "- " : "+ "}₹
                      {e.amount.toLocaleString("en-IN")}
                    </div>

                    <Badge status={e.type} />
                  </div>

                  <button
                    onClick={() => handleDelete(e._id)}
                    className="
                    text-xs
                    text-red-600
                    border
                    border-red-100
                    rounded-md
                    px-3
                    py-1.5
                    hover:bg-red-50
                    transition"
                  >
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
