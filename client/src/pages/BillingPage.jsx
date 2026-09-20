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



function emptyItem() {
  return {
    id: Date.now() + Math.random(),
    desc: "",
    hsnSac: "",
    unit: "Nos",
    qty: 1,
    rate: 0,
    gst: 18,
    discountType: "none",
    discountValue: 0,
  };
}

function normalizeDiscountType(value) {
  return ["none", "percent", "fixed"].includes(value)
    ? value
    : "none";
}

function getDiscountAmount(baseAmount, type, rawValue) {
  const base = Math.max(0, Number(baseAmount) || 0);
  const discountType = normalizeDiscountType(type);
  const value = Math.max(0, Number(rawValue) || 0);

  if (discountType === "percent") {
    return Math.min(base, base * Math.min(value, 100) / 100);
  }

  if (discountType === "fixed") {
    return Math.min(base, value);
  }

  return 0;
}

function getItemPreview(item) {
  const gross =
    (Number(item.qty) || 0) * (Number(item.rate) || 0);

  const discountAmount = getDiscountAmount(
    gross,
    item.discountType,
    item.discountValue,
  );

  const taxable = Math.max(0, gross - discountAmount);
  const gstAmount =
    taxable * (Number(item.gst) || 0) / 100;

  return {
    gross,
    discountAmount,
    taxable,
    lineTotal: taxable + gstAmount,
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
      cgst += adjustedTaxable * item.gst / 200;
      sgst += adjustedTaxable * item.gst / 200;
    });

    const extraChargeAmount = Math.max(
      0,
      Number(form.extraChargeAmount) || 0,
    );

    return {
      grossSubtotal,
      itemDiscountTotal,
      invoiceDiscountAmount,
      subtotal,
      cgst,
      sgst,
      extraChargeAmount,
      total:
        subtotal +
        cgst +
        sgst +
        extraChargeAmount,
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



    const invalidDiscount = items.find((item) => {
      const gross =
        (Number(item.qty) || 0) * (Number(item.rate) || 0);

      return (
        Number(item.discountValue) < 0 ||
        (item.discountType === "percent" &&
          Number(item.discountValue) > 100) ||
        (item.discountType === "fixed" &&
          Number(item.discountValue) > gross)
      );
    });

    if (invalidDiscount) {
      setMessage({
        type: "error",
        text: "Please check item discounts. Percentage must be 0–100 and fixed discount cannot exceed the item value.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (
      form.invoiceDiscountType === "percent" &&
      Number(form.invoiceDiscountValue) > 100
    ) {
      setMessage({
        type: "error",
        text: "Invoice discount percentage cannot exceed 100%.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (Number(form.extraChargeAmount) < 0) {
      setMessage({
        type: "error",
        text: "Extra charge cannot be negative.",
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
                Add HSN/SAC, unit, GST and discounts for each item
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
                        updateItem(
                          item.id,
                          "discountType",
                          e.target.value,
                        )
                      }
                    >
                      {DISCOUNT_TYPES.map((discount) => (
                        <option
                          key={discount.value}
                          value={discount.value}
                        >
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
                      max={
                        item.discountType === "percent"
                          ? 100
                          : undefined
                      }
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
              Add invoice-level discount or an extra charge
            </p>
          </div>
        </div>

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
                Invoice discount reduces taxable value. Extra charge is added after GST.
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
                      <option
                        key={discount.value}
                        value={discount.value}
                      >
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
                      form.invoiceDiscountType === "percent"
                        ? 100
                        : undefined
                    }
                    step="0.01"
                    disabled={form.invoiceDiscountType === "none"}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                    value={form.invoiceDiscountValue}
                    onChange={(e) =>
                      update(
                        "invoiceDiscountValue",
                        Number(e.target.value),
                      )
                    }
                  />
                </Field>

                <Field label="Extra Charge Name">
                  <input
                    className={inputClass}
                    placeholder="Shipping / Packing / Other"
                    value={form.extraChargeName}
                    onChange={(e) =>
                      update("extraChargeName", e.target.value)
                    }
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
                      update(
                        "extraChargeAmount",
                        Number(e.target.value),
                      )
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
                  Invoice Summary
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Server recalculates these totals before saving
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
                      Final amount payable
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
                  Current invoice payment status
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Save size={15} />
            Server-side calculation protects invoice totals.
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
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
