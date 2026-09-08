import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoicePrint from "../components/InvoicePrint";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FilePlus2,
  FileText,
  IndianRupee,
  List,
  Loader2,
  MapPin,
  MessageCircle,
  Package2,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  Save,
  Trash2,
  UserRound,
  Wallet,
  AlertCircle,
  X,
} from "lucide-react";

const GST_RATES = [0, 5, 12, 18, 28];

const STATES = [
  "Gujarat",
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  "Telangana",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
];

function emptyItem() {
  return {
    id: Date.now() + Math.random(),
    desc: "",
    qty: 1,
    rate: 0,
    gst: 18,
  };
}

export default function BillingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([emptyItem()]);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
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

    setForm((f) => ({
      ...f,
      dueDate: due.toISOString().split("T")[0],
    }));
  }, []);

  function update(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));

    if (message) {
      setMessage(null);
    }
  }

  function selectCustomer(id) {
    if (!id) {
      update("customerId", "");
      return;
    }

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

  function addItem() {
    setItems((it) => [...it, emptyItem()]);
  }

  function removeItem(id) {
    setItems((it) => it.filter((i) => i.id !== id));
  }

  function updateItem(id, field, value) {
    setItems((it) =>
      it.map((i) =>
        i.id === id
          ? {
              ...i,
              [field]: value,
            }
          : i,
      ),
    );

    if (message) {
      setMessage(null);
    }
  }

  function calcTotals() {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;

    items.forEach((i) => {
      const base = (Number(i.qty) || 0) * (Number(i.rate) || 0);

      subtotal += base;
      cgst += (base * (Number(i.gst) || 0)) / 200;
      sgst += (base * (Number(i.gst) || 0)) / 200;
    });

    return {
      subtotal,
      cgst,
      sgst,
      total: subtotal + cgst + sgst,
    };
  }

  const totals = calcTotals();

  async function handleSave() {
    setMessage(null);

    if (!items.length || items.every((i) => !i.desc.trim())) {
      setMessage({
        type: "error",
        text: "Please add at least one item with a description.",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!form.customerName.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a customer name before generating the invoice.",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);

    try {
      const data = await api.post("/invoices", {
        ...form,
        items,
      });

      setMessage(null);
      setSavedInvoice(data.invoice);

      setTimeout(() => {
        downloadInvoicePdf(data.invoice.invoiceNo);
      }, 1000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Could not generate the invoice. Please try again.",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  async function downloadInvoicePdf(invoiceNo) {
    const element = document.getElementById("invoice-preview");

    if (!element) {
      console.error("invoice-preview not found");
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight,
    );

    pdf.save(`${invoiceNo}.pdf`);
  }

  function whatsappShare() {
    const invoiceNumber = savedInvoice?.invoiceNo || "Draft";

    const msg = `*${user?.businessName || "Business"}*
*Invoice ${invoiceNumber}*

Dear ${form.customerName || "Customer"},

Your bill details:

${items
  .map(
    (i) =>
      `• ${i.desc} (${i.qty} × ₹${i.rate}) = ₹${(
        i.qty * i.rate
      ).toFixed(2)}`,
  )
  .join("\n")}

Subtotal: ₹${totals.subtotal.toFixed(2)}
GST: ₹${(totals.cgst + totals.sgst).toFixed(2)}

*Total: ₹${totals.total.toFixed(2)}*

Thank you for your business!`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  const iconInputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  if (savedInvoice) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500 px-6 py-6 text-white shadow-xl shadow-emerald-500/10 sm:px-8">
          <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
                <CheckCircle2 size={25} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Invoice Generated
                </p>

                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  {savedInvoice.invoiceNo}
                </h1>

                <p className="mt-1 text-sm text-emerald-100">
                  Invoice saved successfully and ready to share.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs text-emerald-100">
                Invoice total
              </p>

              <p className="mt-1 text-xl font-bold">
                ₹
                {Number(savedInvoice.total || 0).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  },
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="no-print flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <button
            type="button"
            onClick={() => setSavedInvoice(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            New Bill
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700"
          >
            <Printer size={17} />
            Print / Save PDF
          </button>

          <button
            type="button"
            onClick={whatsappShare}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"
          >
            <MessageCircle size={17} />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <List size={17} />
            All Invoices
          </button>
        </div>

        {/* Invoice */}
        <div
          id="invoice-preview"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
        >
          <InvoicePrint
            invoice={savedInvoice}
            business={user}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {message && (
        <div
          className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-4 shadow-sm ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                message.type === "error" ? "bg-red-100" : "bg-emerald-100"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )}
            </div>

            <div>
              <p className="text-sm font-bold">
                {message.type === "error"
                  ? "Please check your invoice"
                  : "Success"}
              </p>

              <p className="mt-1 text-sm opacity-80">{message.text}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMessage(null)}
            className="rounded-lg p-1.5 transition hover:bg-black/5"
            aria-label="Close message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <FilePlus2 size={28} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Billing
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Create New Bill
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                Create professional GST invoices for your
                customers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-100">
                Items
              </p>

              <p className="mt-0.5 font-bold">
                {items.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-100">
                Draft Total
              </p>

              <p className="mt-0.5 font-bold">
                ₹{totals.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ReceiptText size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Invoice Details
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Document type, dates and payment status
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Document type">
              <div className="relative">
                <FileText
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  className={`${iconInputClass} appearance-none pr-10`}
                  value={form.docType}
                  onChange={(e) =>
                    update("docType", e.target.value)
                  }
                >
                  <option>Tax Invoice</option>
                  <option>Quotation</option>
                  <option>Proforma Invoice</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </Field>

            <Field label="Invoice date">
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  className={iconInputClass}
                  value={form.date}
                  onChange={(e) =>
                    update("date", e.target.value)
                  }
                />
              </div>
            </Field>

            <Field label="Due date">
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  className={iconInputClass}
                  value={form.dueDate}
                  onChange={(e) =>
                    update("dueDate", e.target.value)
                  }
                />
              </div>
            </Field>

            <Field label="Place of supply">
              <div className="relative">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  className={`${iconInputClass} appearance-none pr-10`}
                  value={form.placeOfSupply}
                  onChange={(e) =>
                    update("placeOfSupply", e.target.value)
                  }
                >
                  {STATES.map((state) => (
                    <option key={state}>
                      {state}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </Field>

            <Field label="Payment status">
              <div className="relative">
                <CreditCard
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  className={`${iconInputClass} appearance-none pr-10`}
                  value={form.status}
                  onChange={(e) =>
                    update("status", e.target.value)
                  }
                >
                  <option value="paid">Paid</option>
                  <option value="udhaar">
                    Udhaar (credit)
                  </option>
                  <option value="partial">
                    Partial payment
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </Field>
          </div>
        </div>
      </section>

      {/* Customer */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <UserRound size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Customer Details
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Select a saved customer or enter details manually
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Select saved customer">
              <div className="relative">
                <UserRound
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  className={`${iconInputClass} appearance-none pr-10`}
                  value={form.customerId}
                  onChange={(e) =>
                    selectCustomer(e.target.value)
                  }
                >
                  <option value="">
                    -- Enter manually --
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer._id}
                      value={customer._id}
                    >
                      {customer.name}
                      {customer.phone
                        ? ` — ${customer.phone}`
                        : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </Field>

            <Field label="Customer GSTIN">
              <div className="relative">
                <BadgeIndianRupee
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${iconInputClass} uppercase`}
                  placeholder="Optional GSTIN"
                  value={form.customerGstin}
                  onChange={(e) =>
                    update(
                      "customerGstin",
                      e.target.value.toUpperCase(),
                    )
                  }
                />
              </div>
            </Field>

            <Field label="Customer name *">
              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={iconInputClass}
                  placeholder="Customer name"
                  value={form.customerName}
                  onChange={(e) =>
                    update("customerName", e.target.value)
                  }
                />
              </div>
            </Field>

            <Field label="Phone">
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="tel"
                  className={iconInputClass}
                  placeholder="Customer phone"
                  value={form.customerPhone}
                  onChange={(e) =>
                    update("customerPhone", e.target.value)
                  }
                />
              </div>
            </Field>

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
                    value={form.customerAddress}
                    onChange={(e) =>
                      update(
                        "customerAddress",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </Field>
            </div>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Package2 size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Invoice Items
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Add products or services to this invoice
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            <Plus size={17} />
            Add Item
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Desktop headings */}
          <div className="mb-2 hidden grid-cols-[minmax(220px,3fr)_90px_130px_110px_120px_44px] gap-2 px-1 lg:grid">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </span>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Qty
            </span>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Rate
            </span>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              GST
            </span>

            <span className="text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
              Amount
            </span>

            <span />
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const base =
                (Number(item.qty) || 0) *
                (Number(item.rate) || 0);

              const lineTotal =
                base *
                (1 + (Number(item.gst) || 0) / 100);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 lg:grid lg:grid-cols-[minmax(220px,3fr)_90px_130px_110px_120px_44px] lg:items-center lg:gap-2 lg:rounded-xl lg:bg-white lg:p-2"
                >
                  {/* Mobile Item Number */}
                  <div className="mb-3 flex items-center justify-between lg:hidden">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                        {index + 1}
                      </div>

                      <span className="text-xs font-semibold text-slate-500">
                        Invoice item
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="mb-3 lg:mb-0">
                    <label className="mb-1.5 block text-xs font-medium text-slate-500 lg:hidden">
                      Description
                    </label>

                    <input
                      className={inputClass}
                      placeholder="Product / service name"
                      value={item.desc}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "desc",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:contents">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500 lg:hidden">
                        Qty
                      </label>

                      <input
                        type="number"
                        min="1"
                        className={inputClass}
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "qty",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500 lg:hidden">
                        Rate (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "rate",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500 lg:hidden">
                        GST
                      </label>

                      <select
                        className={`${inputClass} appearance-none`}
                        value={item.gst}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "gst",
                            Number(e.target.value),
                          )
                        }
                      >
                        {GST_RATES.map((rate) => (
                          <option
                            key={rate}
                            value={rate}
                          >
                            {rate}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500 lg:hidden">
                        Amount
                      </label>

                      <div className="flex h-[46px] items-center justify-end rounded-xl bg-indigo-50 px-3 text-sm font-bold text-indigo-700 lg:bg-transparent lg:px-1">
                        ₹{lineTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500 lg:flex"
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 sm:hidden"
          >
            <Plus size={16} />
            Add another item
          </button>
        </div>
      </section>

      {/* Notes + Summary */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CircleDollarSign size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Summary & Notes
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Review invoice totals before generating
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-2">
          {/* Notes */}
          <div>
            <Field label="Notes / terms">
              <textarea
                rows={6}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                value={form.notes}
                onChange={(e) =>
                  update("notes", e.target.value)
                }
                placeholder="Payment terms, bank details, thank you note..."
              />
            </Field>
          </div>

          {/* Totals */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Invoice Summary
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {items.length} item
                  {items.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <IndianRupee size={19} />
              </div>
            </div>

            <div className="space-y-3">
              <Row
                label="Subtotal"
                value={totals.subtotal}
              />

              <Row
                label="CGST"
                value={totals.cgst}
              />

              <Row
                label="SGST"
                value={totals.sgst}
              />

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Grand Total
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Inclusive of GST
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold tracking-tight text-indigo-700">
                      ₹
                      {totals.total.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div
              className={`mt-5 flex items-center gap-3 rounded-xl p-3 ${
                form.status === "paid"
                  ? "bg-emerald-50 text-emerald-700"
                  : form.status === "udhaar"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {form.status === "paid" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Wallet size={18} />
              )}

              <div>
                <p className="text-xs font-bold">
                  {form.status === "paid"
                    ? "Payment received"
                    : form.status === "udhaar"
                      ? "Credit / Udhaar invoice"
                      : "Partial payment"}
                </p>

                <p className="mt-0.5 text-[11px] opacity-70">
                  Current invoice payment status
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate */}
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Save size={15} />

            Invoice will be saved before the PDF is generated.
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Generating Invoice...
              </>
            ) : (
              <>
                <ReceiptText size={18} />
                Generate Invoice
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-800">
        ₹
        {Number(value || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}
