import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Field from "../components/Field";

import { api } from "../api/client";

import {
  AlertCircle,
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileText,
  IndianRupee,
  Loader2,
  MapPin,
  Package2,
  Phone,
  Plus,
  ReceiptText,
  Save,
  Trash2,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

const GST_RATES = [0, 5, 12, 18, 28];

const UNITS = [
  "Nos",
  "Pcs",
  "Kg",
  "Gm",
  "Ltr",
  "Ml",
  "Mtr",
  "Sq Ft",
  "Box",
  "Pack",
  "Set",
  "Hr",
  "Day",
  "Service",
];

const DISCOUNT_TYPES = [
  { value: "none", label: "No discount" },
  { value: "percent", label: "Percent (%)" },
  { value: "fixed", label: "Fixed (₹)" },
];

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

function createLocalItem(item = {}) {
  return {
    id: Date.now() + Math.random(),
    desc: item.desc || "",
    hsnSac: item.hsnSac || "",
    unit: item.unit || "Nos",
    qty: Number(item.qty) || 1,
    rate: Number(item.rate) || 0,
    gst: item.gst === 0 ? 0 : Number(item.gst) || 18,
    discountType: normalizeDiscountType(item.discountType),
    discountValue: Number(item.discountValue) || 0,
  };
}

function normalizeDiscountType(value) {
  return ["none", "percent", "fixed"].includes(value) ? value : "none";
}

function getDiscountAmount(baseAmount, type, rawValue) {
  const base = Math.max(0, Number(baseAmount) || 0);
  const discountType = normalizeDiscountType(type);
  const value = Math.max(0, Number(rawValue) || 0);

  if (discountType === "percent") {
    return Math.min(base, (base * Math.min(value, 100)) / 100);
  }

  if (discountType === "fixed") {
    return Math.min(base, value);
  }

  return 0;
}

function getItemPreview(item) {
  const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);

  const discountAmount = getDiscountAmount(
    gross,
    item.discountType,
    item.discountValue,
  );

  const taxable = Math.max(0, gross - discountAmount);
  const gstAmount = (taxable * (Number(item.gst) || 0)) / 100;

  return {
    gross,
    discountAmount,
    taxable,
    lineTotal: taxable + gstAmount,
  };
}

const emptyForm = {
  docType: "Tax Invoice",

  date: "",

  dueDate: "",

  placeOfSupply: "Gujarat",

  customerId: "",

  customerName: "",

  customerPhone: "",

  customerGstin: "",

  customerAddress: "",

  notes: "",

  status: "paid",
  invoiceDiscountType: "none",
  invoiceDiscountValue: 0,
  extraChargeName: "",
  extraChargeAmount: 0,
};

export default function EditInvoicePage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [invoiceNo, setInvoiceNo] = useState("");

  const [customers, setCustomers] = useState([]);

  const [items, setItems] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPage();
  }, [id]);

  async function loadPage() {
    setLoading(true);

    setMessage(null);

    try {
      const [invoiceData, customerData] = await Promise.all([
        api.get(`/invoices/${id}`),

        api.get("/customers"),
      ]);

      const invoice = invoiceData.invoice;

      setCustomers(customerData.customers || []);

      setInvoiceNo(invoice.invoiceNo || "");

      setForm({
        docType: invoice.docType || "Tax Invoice",

        date: invoice.date || "",

        dueDate: invoice.dueDate || "",

        placeOfSupply: invoice.placeOfSupply || "Gujarat",

        customerId: invoice.customerId || "",

        customerName: invoice.customerName || "",

        customerPhone: invoice.customerPhone || "",

        customerGstin: invoice.customerGstin || "",

        customerAddress: invoice.customerAddress || "",

        notes: invoice.notes || "",

        status: invoice.status || "paid",

        invoiceDiscountType: invoice.invoiceDiscountType || "none",

        invoiceDiscountValue: Number(invoice.invoiceDiscountValue) || 0,

        extraChargeName: invoice.extraChargeName || "",

        extraChargeAmount: Number(invoice.extraChargeAmount) || 0,
      });

      setItems((invoice.items || []).map((item) => createLocalItem(item)));
    } catch (err) {
      setMessage({
        type: "error",

        text: err?.message || "Could not load invoice.",
      });
    } finally {
      setLoading(false);
    }
  }

  function update(
    field,

    value,
  ) {
    setForm((current) => ({
      ...current,

      [field]: value,
    }));

    if (message) {
      setMessage(null);
    }
  }

  function selectCustomer(customerId) {
    if (!customerId) {
      setForm((current) => ({
        ...current,

        customerId: "",
      }));

      return;
    }

    const customer = customers.find((item) => item._id === customerId);

    if (!customer) return;

    setForm((current) => ({
      ...current,

      customerId,

      customerName: customer.name || "",

      customerPhone: customer.phone || "",

      customerGstin: customer.gstin || "",

      customerAddress: customer.address || "",
    }));

    if (message) {
      setMessage(null);
    }
  }

  function addItem() {
    setItems((current) => [...current, createLocalItem()]);
  }

  function removeItem(itemId) {
    setItems((current) => current.filter((item) => item.id !== itemId));

    if (message) {
      setMessage(null);
    }
  }

  function updateItem(
    itemId,

    field,

    value,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,

              [field]: value,
            }
          : item,
      ),
    );

    if (message) {
      setMessage(null);
    }
  }

  function calcTotals() {
    let grossSubtotal = 0;
    let itemDiscountTotal = 0;
    let preInvoiceDiscountSubtotal = 0;

    const itemPreviews = items.map((item) => {
      const preview = getItemPreview(item);

      grossSubtotal += preview.gross;
      itemDiscountTotal += preview.discountAmount;
      preInvoiceDiscountSubtotal += preview.taxable;

      return {
        ...preview,
        gst: Number(item.gst) || 0,
      };
    });

    const invoiceDiscountAmount = getDiscountAmount(
      preInvoiceDiscountSubtotal,
      form.invoiceDiscountType,
      form.invoiceDiscountValue,
    );

    const subtotal = Math.max(
      0,
      preInvoiceDiscountSubtotal - invoiceDiscountAmount,
    );

    const ratio =
      preInvoiceDiscountSubtotal > 0
        ? subtotal / preInvoiceDiscountSubtotal
        : 0;

    let cgst = 0;
    let sgst = 0;

    itemPreviews.forEach((item) => {
      const adjustedTaxable = item.taxable * ratio;
      cgst += (adjustedTaxable * item.gst) / 200;
      sgst += (adjustedTaxable * item.gst) / 200;
    });

    const extraChargeAmount = Math.max(0, Number(form.extraChargeAmount) || 0);

    return {
      grossSubtotal,
      itemDiscountTotal,
      invoiceDiscountAmount,
      subtotal,
      cgst,
      sgst,
      extraChargeAmount,
      total: subtotal + cgst + sgst + extraChargeAmount,
    };
  }

  const totals = calcTotals();

  function showError(text) {
    setMessage({
      type: "error",

      text,
    });

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  }

  async function handleSave() {
    setMessage(null);

    const validItems = items.filter((item) => item.desc.trim());

    if (validItems.length === 0) {
      showError("Please add at least one item with a description.");

      return;
    }

    if (!form.customerName.trim()) {
      showError("Please enter a customer name.");

      return;
    }

    const invalidItem = validItems.find(
      (item) => Number(item.qty) <= 0 || Number(item.rate) < 0,
    );

    if (invalidItem) {
      showError("Please check item quantity and rate.");

      return;
    }

    const invalidDiscount = validItems.find((item) => {
      const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);

      return (
        Number(item.discountValue) < 0 ||
        (item.discountType === "percent" && Number(item.discountValue) > 100) ||
        (item.discountType === "fixed" && Number(item.discountValue) > gross)
      );
    });

    if (invalidDiscount) {
      showError(
        "Please check item discounts. Percentage must be 0–100 and fixed discount cannot exceed the item value.",
      );
      return;
    }

    if (
      form.invoiceDiscountType === "percent" &&
      Number(form.invoiceDiscountValue) > 100
    ) {
      showError("Invoice discount percentage cannot exceed 100%.");
      return;
    }

    if (Number(form.extraChargeAmount) < 0) {
      showError("Extra charge cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const payloadItems = validItems.map(
        ({
          id: localId,

          ...item
        }) => item,
      );

      const data = await api.put(
        `/invoices/${id}`,

        {
          ...form,

          items: payloadItems,
        },
      );

      setMessage({
        type: "success",

        text: "Invoice updated successfully.",
      });

      setTimeout(() => {
        navigate(`/invoices/${data.invoice._id}`);
      }, 500);
    } catch (err) {
      showError(err?.message || "Could not update invoice.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  const iconInputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Loader2 size={30} className="animate-spin" />
        </div>

        <h2 className="mt-5 text-base font-bold text-slate-800">
          Loading invoice...
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Preparing invoice for editing
        </p>
      </div>
    );
  }

  if (message?.type === "error" && !invoiceNo) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-white px-6 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={30} />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Invoice unavailable
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {message.text}
        </p>

        <button
          type="button"
          onClick={() => navigate("/invoices")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={17} />
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Message */}

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
                  : "Invoice updated"}
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

      {/* Hero */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <ReceiptText size={28} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Edit Invoice
              </p>

              <h1 className="mt-1 break-all text-xl font-bold sm:text-2xl">
                {invoiceNo}
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                Update invoice details, customer, items or payment status.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(`/invoices/${id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft size={17} />
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Important notice */}

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-800">
        <AlertCircle size={19} className="mt-0.5 shrink-0" />

        <div>
          <p className="text-sm font-bold">Invoice number will not change</p>

          <p className="mt-1 text-xs leading-5 text-amber-700">
            Editing this invoice keeps its original invoice number. Totals are
            recalculated securely by the server after you save.
          </p>
        </div>
      </div>

      {/* Invoice Details */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={ReceiptText}
          title="Invoice Details"
          subtitle="Document details and payment status"
        />

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Invoice number">
              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  disabled
                  value={invoiceNo}
                  className={`${iconInputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                />
              </div>
            </Field>

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
                    update(
                      "docType",

                      e.target.value,
                    )
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
                    update(
                      "status",

                      e.target.value,
                    )
                  }
                >
                  <option value="paid">Paid</option>

                  <option value="udhaar">Udhaar (credit)</option>

                  <option value="partial">Partial payment</option>
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
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  className={iconInputClass}
                  value={form.date}
                  onChange={(e) =>
                    update(
                      "date",

                      e.target.value,
                    )
                  }
                />
              </div>
            </Field>

            <Field label="Due date">
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  className={iconInputClass}
                  value={form.dueDate}
                  onChange={(e) =>
                    update(
                      "dueDate",

                      e.target.value,
                    )
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
                    update(
                      "placeOfSupply",

                      e.target.value,
                    )
                  }
                >
                  {STATES.map((state) => (
                    <option key={state} value={state}>
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
          </div>
        </div>
      </section>

      {/* Customer */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={UserRound}
          title="Customer Details"
          subtitle="Change the invoice customer or edit their invoice details"
        />

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
                  onChange={(e) => selectCustomer(e.target.value)}
                >
                  <option value="">-- Enter manually --</option>

                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}

                      {customer.phone ? ` — ${customer.phone}` : ""}
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

            <Field label="Customer name" required>
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
                    update(
                      "customerName",

                      e.target.value,
                    )
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
                    update(
                      "customerPhone",

                      e.target.value,
                    )
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
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
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
                Update HSN/SAC, unit, GST and discounts for each item
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

        <div className="space-y-4 p-4 sm:p-6">
          {items.map((item, index) => {
            const preview = getItemPreview(item);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-indigo-200 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-700">
                      {index + 1}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Invoice Item
                      </p>
                      <p className="text-xs text-slate-400">
                        Product or service details
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                  <div className="sm:col-span-2 xl:col-span-2">
                    <Field label="Description">
                      <input
                        className={inputClass}
                        placeholder="Product / service name"
                        value={item.desc}
                        onChange={(e) =>
                          updateItem(item.id, "desc", e.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <Field label="HSN / SAC">
                    <input
                      className={inputClass}
                      placeholder="e.g. 8471"
                      value={item.hsnSac}
                      onChange={(e) =>
                        updateItem(item.id, "hsnSac", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Unit">
                    <select
                      className={`${inputClass} appearance-none`}
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(item.id, "unit", e.target.value)
                      }
                    >
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Qty">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={inputClass}
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(item.id, "qty", Number(e.target.value))
                      }
                    />
                  </Field>

                  <Field label="Rate (₹)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.id, "rate", Number(e.target.value))
                      }
                    />
                  </Field>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <Field label="Item Discount">
                    <select
                      className={`${inputClass} appearance-none`}
                      value={item.discountType}
                      onChange={(e) =>
                        updateItem(item.id, "discountType", e.target.value)
                      }
                    >
                      {DISCOUNT_TYPES.map((discount) => (
                        <option key={discount.value} value={discount.value}>
                          {discount.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label={
                      item.discountType === "percent"
                        ? "Discount %"
                        : "Discount Value (₹)"
                    }
                  >
                    <input
                      type="number"
                      min="0"
                      max={item.discountType === "percent" ? 100 : undefined}
                      step="0.01"
                      disabled={item.discountType === "none"}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                      value={item.discountValue}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "discountValue",
                          Number(e.target.value),
                        )
                      }
                    />
                  </Field>

                  <Field label="GST">
                    <select
                      className={`${inputClass} appearance-none`}
                      value={item.gst}
                      onChange={(e) =>
                        updateItem(item.id, "gst", Number(e.target.value))
                      }
                    >
                      {GST_RATES.map((rate) => (
                        <option key={rate} value={rate}>
                          {rate}%
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Taxable Value
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      ₹{preview.taxable.toFixed(2)}
                    </p>
                    {preview.discountAmount > 0 && (
                      <p className="mt-1 text-[11px] text-emerald-600">
                        Discount ₹{preview.discountAmount.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-indigo-600 p-3 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-100">
                      Line Total
                    </p>
                    <p className="mt-1 text-base font-extrabold">
                      ₹{preview.lineTotal.toFixed(2)}
                    </p>
                    <p className="mt-1 text-[10px] text-indigo-100">
                      Before invoice discount
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {!items.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <Package2 size={30} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                No items
              </p>

              <button
                type="button"
                onClick={addItem}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Summary */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={CircleDollarSign}
          title="Summary & Notes"
          subtitle="Review discounts, charges and updated totals before saving"
        />

        <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-2">
          <div className="space-y-5">
            <Field label="Notes / terms">
              <textarea
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Payment terms, bank details, thank you note..."
              />
            </Field>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">
                Invoice Adjustments
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Invoice discount reduces taxable value. Extra charge is added
                after GST.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Invoice Discount">
                  <select
                    className={`${inputClass} appearance-none`}
                    value={form.invoiceDiscountType}
                    onChange={(e) =>
                      update("invoiceDiscountType", e.target.value)
                    }
                  >
                    {DISCOUNT_TYPES.map((discount) => (
                      <option key={discount.value} value={discount.value}>
                        {discount.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label={
                    form.invoiceDiscountType === "percent"
                      ? "Discount %"
                      : "Discount Value (₹)"
                  }
                >
                  <input
                    type="number"
                    min="0"
                    max={
                      form.invoiceDiscountType === "percent" ? 100 : undefined
                    }
                    step="0.01"
                    disabled={form.invoiceDiscountType === "none"}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                    value={form.invoiceDiscountValue}
                    onChange={(e) =>
                      update("invoiceDiscountValue", Number(e.target.value))
                    }
                  />
                </Field>

                <Field label="Extra Charge Name">
                  <input
                    className={inputClass}
                    placeholder="Shipping / Packing / Other"
                    value={form.extraChargeName}
                    onChange={(e) => update("extraChargeName", e.target.value)}
                  />
                </Field>

                <Field label="Extra Charge Amount (₹)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={form.extraChargeAmount}
                    onChange={(e) =>
                      update("extraChargeAmount", Number(e.target.value))
                    }
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Updated Summary
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Existing payments remain linked after recalculation
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <IndianRupee size={19} />
              </div>
            </div>

            <div className="space-y-3">
              <Row label="Gross subtotal" value={totals.grossSubtotal} />

              {totals.itemDiscountTotal > 0 && (
                <Row
                  label="Item discounts (-)"
                  value={totals.itemDiscountTotal}
                />
              )}

              {totals.invoiceDiscountAmount > 0 && (
                <Row
                  label="Invoice discount (-)"
                  value={totals.invoiceDiscountAmount}
                />
              )}

              <Row label="Taxable subtotal" value={totals.subtotal} />
              <Row label="CGST" value={totals.cgst} />
              <Row label="SGST" value={totals.sgst} />

              {totals.extraChargeAmount > 0 && (
                <Row
                  label={form.extraChargeName || "Extra charge"}
                  value={totals.extraChargeAmount}
                />
              )}

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Grand Total
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Final recalculated amount
                    </p>
                  </div>

                  <span className="text-2xl font-extrabold tracking-tight text-indigo-700">
                    ₹
                    {totals.total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

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
                  Payment status is recalculated safely by the server
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Save size={15} />
            Server will recalculate and verify invoice totals.
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate(`/invoices/${id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ArrowLeft size={17} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,

  title,

  subtitle,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>

        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ColumnTitle({ children }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </span>
  );
}

function MobileLabel({ children }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-slate-500 lg:hidden">
      {children}
    </label>
  );
}

function Row({
  label,

  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>

      <span className="font-semibold text-slate-800">
        ₹
        {Number(value || 0).toLocaleString(
          "en-IN",

          {
            minimumFractionDigits: 2,

            maximumFractionDigits: 2,
          },
        )}
      </span>
    </div>
  );
}
