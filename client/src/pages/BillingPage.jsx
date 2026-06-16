import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoicePrint from "../components/InvoicePrint";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const GST_RATES = [0, 5, 12, 18, 28];
const STATES = [
  "Gujarat", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Rajasthan",
  "Uttar Pradesh", "West Bengal", "Telangana", "Madhya Pradesh", "Punjab", "Haryana",
];

function emptyItem() {
  return { id: Date.now() + Math.random(), desc: "", qty: 1, rate: 0, gst: 18 };
}

export default function BillingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([emptyItem()]);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    invoiceNo: "INV-001",
    docType: "Tax Invoice",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    placeOfSupply: "Gujarat",
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerGstin: "",
    customerAddress: "",
    notes: "Payment due within 30 days. Thank you for your business!",
    status: "paid",
  });

  useEffect(() => {
    api
      .get("/customers")
      .then((data) => setCustomers(data.customers || []))
      .catch(() => {});

    const due = new Date();
    due.setDate(due.getDate() + 30);
    setForm((f) => ({ ...f, dueDate: due.toISOString().split("T")[0] }));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectCustomer(id) {
    if (!id) { update("customerId", ""); return; }
    const c = customers.find((c) => c._id === id);
    if (c) {
      setForm((f) => ({
        ...f,
        customerId: id,
        customerName: c.name,
        customerPhone: c.phone || "",
        customerGstin: c.gstin || "",
        customerAddress: c.address || "",
      }));
    }
  }

  function addItem() { setItems((it) => [...it, emptyItem()]); }
  function removeItem(id) { setItems((it) => it.filter((i) => i.id !== id)); }
  function updateItem(id, field, value) {
    setItems((it) => it.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function calcTotals() {
    let subtotal = 0, cgst = 0, sgst = 0;
    items.forEach((i) => {
      const base = (Number(i.qty) || 0) * (Number(i.rate) || 0);
      subtotal += base;
      cgst += (base * (Number(i.gst) || 0)) / 200;
      sgst += (base * (Number(i.gst) || 0)) / 200;
    });
    return { subtotal, cgst, sgst, total: subtotal + cgst + sgst };
  }

  const totals = calcTotals();

  async function handleSave() {
    if (!items.length || items.every((i) => !i.desc)) {
      alert("Please add at least one item with a description.");
      return;
    }
    if (!form.customerName) {
      alert("Please enter a customer name.");
      return;
    }
    setSaving(true);
    try {
      const data = await api.post("/invoices", { ...form, items });
      setSavedInvoice(data.invoice);
    } catch (err) {
      alert(err.message || "Could not save invoice");
    } finally {
      setSaving(false);
    }
  }

  function whatsappShare() {
    const msg = `*${user?.businessName || "Business"}*\n*Invoice ${form.invoiceNo}*\n\nDear ${form.customerName || "Customer"},\n\nYour bill details:\n${items
      .map((i) => `• ${i.desc}: ₹${(i.qty * i.rate).toFixed(2)}`)
      .join("\n")}\n\nSubtotal: ₹${totals.subtotal.toFixed(2)}\nGST: ₹${(totals.cgst + totals.sgst).toFixed(2)}\n*Total: ₹${totals.total.toFixed(2)}*\n\nThank you for your business!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  if (savedInvoice) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4 no-print flex-wrap">
          <button
            onClick={() => setSavedInvoice(null)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50"
          >
            ← New bill
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-3 py-1.5 shadow-lg shadow-teal-500/20"
          >
            Print / Save PDF
          </button>
          <button
            onClick={whatsappShare}
            className="text-sm bg-[#25D366] text-white rounded-xl px-3 py-1.5 hover:opacity-90"
          >
            Share on WhatsApp
          </button>
          <button
            onClick={() => navigate("/invoices")}
            className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50"
          >
            View all invoices
          </button>
        </div>
        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-xl">
          <InvoicePrint invoice={savedInvoice} business={user} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-indigo-900">
          ₹
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create new bill</h1>
          <p className="text-slate-500">Fill in details to generate a GST invoice</p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">Invoice details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Document type">
            <select className="input" value={form.docType} onChange={(e) => update("docType", e.target.value)}>
              <option>Tax Invoice</option>
              <option>Quotation</option>
              <option>Proforma Invoice</option>
            </select>
          </Field>
          <Field label="Invoice number">
            <input className="input" value={form.invoiceNo} onChange={(e) => update("invoiceNo", e.target.value)} />
          </Field>
          <Field label="Date">
            <input type="date" className="input" value={form.date} onChange={(e) => update("date", e.target.value)} />
          </Field>
          <Field label="Due date">
            <input type="date" className="input" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} />
          </Field>
          <Field label="Place of supply">
            <select className="input" value={form.placeOfSupply} onChange={(e) => update("placeOfSupply", e.target.value)}>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="paid">Paid</option>
              <option value="udhaar">Udhaar (credit)</option>
              <option value="partial">Partial payment</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">Customer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Select saved customer">
            <select className="input" value={form.customerId} onChange={(e) => selectCustomer(e.target.value)}>
              <option value="">— or enter manually below —</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
              ))}
            </select>
          </Field>
          <Field label="Customer GSTIN">
            <input className="input" placeholder="Optional" value={form.customerGstin} onChange={(e) => update("customerGstin", e.target.value)} />
          </Field>
          <Field label="Customer name *">
            <input className="input" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <input className="input" value={form.customerAddress} onChange={(e) => update("customerAddress", e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-3">Items</h2>
        <div className="hidden sm:grid grid-cols-[3fr_1fr_1fr_1fr_32px] gap-2 text-xs text-gray-500 mb-1 px-1">
          <span>Description</span>
          <span>Qty</span>
          <span>Rate (₹)</span>
          <span>GST</span>
          <span></span>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-2 sm:grid-cols-[3fr_1fr_1fr_1fr_32px] gap-2 items-center">
              <input
                className="input col-span-2 sm:col-span-1"
                placeholder="Product / service name"
                value={item.desc}
                onChange={(e) => updateItem(item.id, "desc", e.target.value)}
              />
              <input
                type="number" min="1" className="input"
                value={item.qty}
                onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))}
              />
              <input
                type="number" min="0" className="input"
                value={item.rate}
                onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
              />
              <select
                className="input" value={item.gst}
                onChange={(e) => updateItem(item.id, "gst", Number(e.target.value))}
              >
                {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
              </select>
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 justify-self-end sm:justify-self-auto"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-3 text-sm border border-dashed border-slate-300 hover:border-teal-400 hover:text-teal-600 text-gray-500 rounded-xl px-3 py-1.5 transition-colors"
        >
          + Add item
        </button>
      </div>

      {/* Notes + Totals + Actions */}
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Notes / terms">
            <textarea
              className="input min-h-[80px]"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </Field>
          <div className="bg-slate-50 rounded-2xl p-4">
            <Row label="Subtotal" value={totals.subtotal} />
            <Row label="CGST" value={totals.cgst} />
            <Row label="SGST" value={totals.sgst} />
            <div className="flex justify-between text-base font-semibold border-t border-slate-200 mt-2 pt-2 text-slate-900">
              <span>Total</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/20 font-semibold text-white text-sm px-5 py-2.5 rounded-xl disabled:opacity-60"
          >
            {saving ? "Saving..." : "Generate invoice"}
          </button>
          <button
            onClick={whatsappShare}
            className="bg-[#25D366] hover:opacity-90 text-white font-medium text-sm px-4 py-2.5 rounded-xl"
          >
            Share on WhatsApp
          </button>
          <button
            onClick={() => navigate("/invoices")}
            className="bg-white border border-slate-200 hover:bg-slate-50 font-medium text-sm px-4 py-2.5 rounded-xl"
          >
            View all invoices
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-600 py-0.5">
      <span>{label}</span>
      <span>₹{value.toFixed(2)}</span>
    </div>
  );
}