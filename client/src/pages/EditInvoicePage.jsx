
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
    id:
      Date.now() +
      Math.random(),

    desc:
      item.desc || "",

    qty:
      Number(item.qty) || 1,

    rate:
      Number(item.rate) || 0,

    gst:
      Number(item.gst) || 18,
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
};

export default function EditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoiceNo, setInvoiceNo] =
    useState("");

  const [customers, setCustomers] =
    useState([]);

  const [items, setItems] =
    useState([]);

  const [form, setForm] =
    useState(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState(null);

  useEffect(() => {
    loadPage();
  }, [id]);

  async function loadPage() {
    setLoading(true);
    setMessage(null);

    try {
      const [
        invoiceData,
        customerData,
      ] = await Promise.all([
        api.get(
          `/invoices/${id}`,
        ),

        api.get(
          "/customers",
        ),
      ]);

      const invoice =
        invoiceData.invoice;

      setCustomers(
        customerData.customers ||
          [],
      );

      setInvoiceNo(
        invoice.invoiceNo ||
          "",
      );

      setForm({
        docType:
          invoice.docType ||
          "Tax Invoice",

        date:
          invoice.date || "",

        dueDate:
          invoice.dueDate ||
          "",

        placeOfSupply:
          invoice.placeOfSupply ||
          "Gujarat",

        customerId:
          invoice.customerId ||
          "",

        customerName:
          invoice.customerName ||
          "",

        customerPhone:
          invoice.customerPhone ||
          "",

        customerGstin:
          invoice.customerGstin ||
          "",

        customerAddress:
          invoice.customerAddress ||
          "",

        notes:
          invoice.notes || "",

        status:
          invoice.status ||
          "paid",
      });

      setItems(
        (invoice.items || []).map(
          (item) =>
            createLocalItem(
              item,
            ),
        ),
      );
    } catch (err) {
      setMessage({
        type: "error",

        text:
          err?.message ||
          "Could not load invoice.",
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

  function selectCustomer(
    customerId,
  ) {
    if (!customerId) {
      setForm(
        (current) => ({
          ...current,

          customerId: "",
        }),
      );

      return;
    }

    const customer =
      customers.find(
        (item) =>
          item._id ===
          customerId,
      );

    if (!customer) return;

    setForm(
      (current) => ({
        ...current,

        customerId,

        customerName:
          customer.name || "",

        customerPhone:
          customer.phone || "",

        customerGstin:
          customer.gstin || "",

        customerAddress:
          customer.address || "",
      }),
    );

    if (message) {
      setMessage(null);
    }
  }

  function addItem() {
    setItems(
      (current) => [
        ...current,
        createLocalItem(),
      ],
    );
  }

  function removeItem(
    itemId,
  ) {
    setItems(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            itemId,
        ),
    );

    if (message) {
      setMessage(null);
    }
  }

  function updateItem(
    itemId,
    field,
    value,
  ) {
    setItems(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            itemId
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item,
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

    items.forEach(
      (item) => {
        const base =
          (Number(
            item.qty,
          ) || 0) *
          (Number(
            item.rate,
          ) || 0);

        subtotal += base;

        cgst +=
          (base *
            (Number(
              item.gst,
            ) || 0)) /
          200;

        sgst +=
          (base *
            (Number(
              item.gst,
            ) || 0)) /
          200;
      },
    );

    return {
      subtotal,
      cgst,
      sgst,

      total:
        subtotal +
        cgst +
        sgst,
    };
  }

  const totals =
    calcTotals();

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

    const validItems =
      items.filter(
        (item) =>
          item.desc.trim(),
      );

    if (
      validItems.length ===
      0
    ) {
      showError(
        "Please add at least one item with a description.",
      );

      return;
    }

    if (
      !form.customerName.trim()
    ) {
      showError(
        "Please enter a customer name.",
      );

      return;
    }

    const invalidItem =
      validItems.find(
        (item) =>
          Number(item.qty) <= 0 ||
          Number(item.rate) <
            0,
      );

    if (invalidItem) {
      showError(
        "Please check item quantity and rate.",
      );

      return;
    }

    setSaving(true);

    try {
      const payloadItems =
        validItems.map(
          ({
            id: localId,
            ...item
          }) => item,
        );

      const data =
        await api.put(
          `/invoices/${id}`,
          {
            ...form,

            items:
              payloadItems,
          },
        );

      setMessage({
        type: "success",

        text:
          "Invoice updated successfully.",
      });

      setTimeout(() => {
        navigate(
          `/invoices/${data.invoice._id}`,
        );
      }, 500);
    } catch (err) {
      showError(
        err?.message ||
          "Could not update invoice.",
      );
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
          <Loader2
            size={30}
            className="animate-spin"
          />
        </div>

        <h2 className="mt-5 text-base font-bold text-slate-800">
          Loading invoice...
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Preparing invoice for
          editing
        </p>
      </div>
    );
  }

  if (
    message?.type ===
      "error" &&
    !invoiceNo
  ) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-white px-6 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle
            size={30}
          />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Invoice unavailable
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {message.text}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/invoices",
            )
          }
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft
            size={17}
          />

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
            message.type ===
            "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                message.type ===
                "error"
                  ? "bg-red-100"
                  : "bg-emerald-100"
              }`}
            >
              {message.type ===
              "error" ? (
                <AlertCircle
                  size={19}
                />
              ) : (
                <CheckCircle2
                  size={19}
                />
              )}
            </div>

            <div>
              <p className="text-sm font-bold">
                {message.type ===
                "error"
                  ? "Please check your invoice"
                  : "Invoice updated"}
              </p>

              <p className="mt-1 text-sm opacity-80">
                {message.text}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setMessage(null)
            }
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
              <ReceiptText
                size={28}
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Edit Invoice
              </p>

              <h1 className="mt-1 break-all text-xl font-bold sm:text-2xl">
                {invoiceNo}
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                Update invoice
                details, customer,
                items or payment
                status.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/invoices/${id}`,
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft
                size={17}
              />

              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={
                handleSave
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save
                    size={17}
                  />

                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Important notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-800">
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0"
        />

        <div>
          <p className="text-sm font-bold">
            Invoice number will not
            change
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-700">
            Editing this invoice
            keeps its original
            invoice number. Totals
            are recalculated securely
            by the server after you
            save.
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
                  value={
                    invoiceNo
                  }
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
                  value={
                    form.docType
                  }
                  onChange={(e) =>
                    update(
                      "docType",
                      e.target.value,
                    )
                  }
                >
                  <option>
                    Tax Invoice
                  </option>

                  <option>
                    Quotation
                  </option>

                  <option>
                    Proforma Invoice
                  </option>
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
                  value={
                    form.status
                  }
                  onChange={(e) =>
                    update(
                      "status",
                      e.target.value,
                    )
                  }
                >
                  <option value="paid">
                    Paid
                  </option>

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

            <Field label="Invoice date">
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  className={
                    iconInputClass
                  }
                  value={
                    form.date
                  }
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
                  className={
                    iconInputClass
                  }
                  value={
                    form.dueDate
                  }
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
                  value={
                    form.placeOfSupply
                  }
                  onChange={(e) =>
                    update(
                      "placeOfSupply",
                      e.target.value,
                    )
                  }
                >
                  {STATES.map(
                    (state) => (
                      <option
                        key={
                          state
                        }
                        value={
                          state
                        }
                      >
                        {state}
                      </option>
                    ),
                  )}
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
                  value={
                    form.customerId
                  }
                  onChange={(e) =>
                    selectCustomer(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    -- Enter manually --
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={
                          customer._id
                        }
                        value={
                          customer._id
                        }
                      >
                        {customer.name}
                        {customer.phone
                          ? ` — ${customer.phone}`
                          : ""}
                      </option>
                    ),
                  )}
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
                  value={
                    form.customerGstin
                  }
                  onChange={(e) =>
                    update(
                      "customerGstin",
                      e.target.value.toUpperCase(),
                    )
                  }
                />
              </div>
            </Field>

            <Field
              label="Customer name"
              required
            >
              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={
                    iconInputClass
                  }
                  placeholder="Customer name"
                  value={
                    form.customerName
                  }
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
                  className={
                    iconInputClass
                  }
                  placeholder="Customer phone"
                  value={
                    form.customerPhone
                  }
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
                    value={
                      form.customerAddress
                    }
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
              <Package2
                size={20}
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Invoice Items
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Update products,
                quantity, rates or GST
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
          <div className="mb-2 hidden grid-cols-[minmax(220px,3fr)_90px_130px_110px_120px_44px] gap-2 px-1 lg:grid">
            <ColumnTitle>
              Description
            </ColumnTitle>

            <ColumnTitle>
              Qty
            </ColumnTitle>

            <ColumnTitle>
              Rate
            </ColumnTitle>

            <ColumnTitle>
              GST
            </ColumnTitle>

            <span className="text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
              Amount
            </span>

            <span />
          </div>

          <div className="space-y-3">
            {items.map(
              (
                item,
                index,
              ) => {
                const base =
                  (Number(
                    item.qty,
                  ) || 0) *
                  (Number(
                    item.rate,
                  ) || 0);

                const lineTotal =
                  base *
                  (1 +
                    (Number(
                      item.gst,
                    ) ||
                      0) /
                      100);

                return (
                  <div
                    key={
                      item.id
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 lg:grid lg:grid-cols-[minmax(220px,3fr)_90px_130px_110px_120px_44px] lg:items-center lg:gap-2 lg:rounded-xl lg:bg-white lg:p-2"
                  >
                    {/* Mobile header */}
                    <div className="mb-3 flex items-center justify-between lg:hidden">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                          {index +
                            1}
                        </div>

                        <span className="text-xs font-semibold text-slate-500">
                          Invoice item
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.id,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                        aria-label="Remove item"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>

                    <div className="mb-3 lg:mb-0">
                      <MobileLabel>
                        Description
                      </MobileLabel>

                      <input
                        className={
                          inputClass
                        }
                        placeholder="Product / service name"
                        value={
                          item.desc
                        }
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
                        <MobileLabel>
                          Qty
                        </MobileLabel>

                        <input
                          type="number"
                          min="1"
                          className={
                            inputClass
                          }
                          value={
                            item.qty
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "qty",
                              Number(
                                e
                                  .target
                                  .value,
                              ),
                            )
                          }
                        />
                      </div>

                      <div>
                        <MobileLabel>
                          Rate (₹)
                        </MobileLabel>

                        <input
                          type="number"
                          min="0"
                          className={
                            inputClass
                          }
                          value={
                            item.rate
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "rate",
                              Number(
                                e
                                  .target
                                  .value,
                              ),
                            )
                          }
                        />
                      </div>

                      <div>
                        <MobileLabel>
                          GST
                        </MobileLabel>

                        <select
                          className={`${inputClass} appearance-none`}
                          value={
                            item.gst
                          }
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "gst",
                              Number(
                                e
                                  .target
                                  .value,
                              ),
                            )
                          }
                        >
                          {GST_RATES.map(
                            (
                              rate,
                            ) => (
                              <option
                                key={
                                  rate
                                }
                                value={
                                  rate
                                }
                              >
                                {
                                  rate
                                }
                                %
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div>
                        <MobileLabel>
                          Amount
                        </MobileLabel>

                        <div className="flex h-[46px] items-center justify-end rounded-xl bg-indigo-50 px-3 text-sm font-bold text-indigo-700 lg:bg-transparent lg:px-1">
                          ₹
                          {lineTotal.toFixed(
                            2,
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          item.id,
                        )
                      }
                      className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500 lg:flex"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>
                  </div>
                );
              },
            )}
          </div>

          {items.length ===
            0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <Package2
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No items
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add at least one item
                before saving.
              </p>

              <button
                type="button"
                onClick={addItem}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus
                  size={16}
                />

                Add Item
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Summary */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={
            CircleDollarSign
          }
          title="Summary & Notes"
          subtitle="Review the updated invoice before saving"
        />

        <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-2">
          <div>
            <Field label="Notes / terms">
              <textarea
                rows={6}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                value={
                  form.notes
                }
                onChange={(e) =>
                  update(
                    "notes",
                    e.target.value,
                  )
                }
                placeholder="Payment terms, bank details, thank you note..."
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Updated Summary
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {items.length} item
                  {items.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <IndianRupee
                  size={19}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Row
                label="Subtotal"
                value={
                  totals.subtotal
                }
              />

              <Row
                label="CGST"
                value={
                  totals.cgst
                }
              />

              <Row
                label="SGST"
                value={
                  totals.sgst
                }
              />

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Grand Total
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Inclusive of
                      GST
                    </p>
                  </div>

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

            <div
              className={`mt-5 flex items-center gap-3 rounded-xl p-3 ${
                form.status ===
                "paid"
                  ? "bg-emerald-50 text-emerald-700"
                  : form.status ===
                      "udhaar"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {form.status ===
              "paid" ? (
                <CheckCircle2
                  size={18}
                />
              ) : (
                <Wallet
                  size={18}
                />
              )}

              <div>
                <p className="text-xs font-bold">
                  {form.status ===
                  "paid"
                    ? "Payment received"
                    : form.status ===
                        "udhaar"
                      ? "Credit / Udhaar invoice"
                      : "Partial payment"}
                </p>

                <p className="mt-0.5 text-[11px] opacity-70">
                  Updated payment
                  status
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Save size={15} />

            Server will recalculate
            and verify invoice
            totals.
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                navigate(
                  `/invoices/${id}`,
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ArrowLeft
                size={17}
              />

              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving Changes...
                </>
              ) : (
                <>
                  <Save
                    size={18}
                  />

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
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function ColumnTitle({
  children,
}) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </span>
  );
}

function MobileLabel({
  children,
}) {
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
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-800">
        ₹
        {Number(
          value || 0,
        ).toLocaleString(
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