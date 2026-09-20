import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Edit3,
  FileText,
  History,
  IndianRupee,
  Landmark,
  Loader2,
  MessageCircle,
  Package,
  Printer,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import InvoicePrint from "../components/InvoicePrint";
import Badge from "../components/Badge";

import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const PAYMENT_METHODS = [
  {
    value: "upi",
    label: "UPI",
    icon: Smartphone,
  },
  {
    value: "card",
    label: "Card",
    icon: CreditCard,
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: Landmark,
  },
  {
    value: "net_banking",
    label: "Net Banking",
    icon: Building2,
  },
  {
    value: "cash",
    label: "Cash",
    icon: Banknote,
  },
  {
    value: "cheque",
    label: "Cheque",
    icon: FileText,
  },
  {
    value: "other",
    label: "Other",
    icon: Wallet,
  },
];

const DEMO_BANKS = [
  "State Bank Demo",
  "HDFC Sandbox Bank",
  "ICICI Test Bank",
  "Axis Demo Bank",
  "Kotak Sandbox Bank",
];

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMethod(method) {
  const found = PAYMENT_METHODS.find(
    (item) => item.value === method,
  );

  return found?.label || "Payment";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function maskAccount(value) {
  const text = String(value || "").replace(/\s/g, "");

  if (!text) {
    return "•••• 4582";
  }

  const last4 = text.slice(-4);

  return `•••• ${last4}`;
}

function lastFour(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(-4);
}

function getPaymentStatusStyle(status) {
  if (status === "success") {
    return {
      label: "Success",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "pending") {
    return {
      label: "Pending",
      icon: Loader2,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Failed",
    icon: XCircle,
    className:
      "border-red-200 bg-red-50 text-red-700",
  };
}

export default function InvoiceDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [invoice, setInvoice] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [downloading, setDownloading] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
    setLoading(true);
    setError("");

    try {
      const data = await api.get(`/invoices/${id}`);

      setInvoice(data.invoice);
    } catch (err) {
      setError(
        err?.message || "Could not load invoice.",
      );
    } finally {
      setLoading(false);
    }
  }

  const total = Number(invoice?.total || 0);

  const amountPaid = Number(
    invoice?.amountPaid || 0,
  );

  const balanceDue = Number(
    invoice?.balanceDue ?? Math.max(0, total - amountPaid),
  );

  const paidPercentage =
    total > 0
      ? Math.min(100, (amountPaid / total) * 100)
      : 0;

  async function downloadPdf() {
    if (!invoice || downloading) return;

    const element =
      document.getElementById("invoice-preview");

    if (!element) return;

    setDownloading(true);
    setError("");

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;

      const pdfHeight =
        (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
      );

      pdf.save(`${invoice.invoiceNo}.pdf`);
    } catch {
      setError(
        "Could not generate the PDF. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  }

  function whatsappShare() {
    if (!invoice) return;

    const itemLines = (invoice.items || [])
      .map((item) => {
        const base =
          Number(item.qty || 0) *
          Number(item.rate || 0);

        return `• ${item.desc} (${item.qty} × ₹${Number(
          item.rate || 0,
        ).toFixed(2)}) = ₹${base.toFixed(2)}`;
      })
      .join("\n");

    const totalGst =
      Number(invoice.cgst || 0) +
      Number(invoice.sgst || 0) +
      Number(invoice.igst || 0);

    const message = `*${user?.businessName || "Business"}*
*${invoice.docType || "Invoice"} ${invoice.invoiceNo}*

Dear ${invoice.customerName || "Customer"},

Your bill details:

${itemLines}

Subtotal: ₹${Number(invoice.subtotal || 0).toFixed(2)}
GST: ₹${totalGst.toFixed(2)}
Total: ₹${Number(invoice.total || 0).toFixed(2)}
Paid: ₹${amountPaid.toFixed(2)}
Balance Due: ₹${balanceDue.toFixed(2)}

Thank you for your business!`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

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
          Fetching invoice details
        </p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-white px-6 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={30} />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Invoice unavailable
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {error}
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
    <div className="space-y-6">
      {error && (
        <div className="no-print flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="text-sm font-bold">
              Something went wrong
            </p>

            <p className="mt-1 text-sm opacity-80">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <ReceiptText size={27} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                  Invoice Details
                </p>

                <Badge status={invoice.status} />
              </div>

              <h1 className="mt-2 break-all text-xl font-bold tracking-tight sm:text-2xl">
                {invoice.invoiceNo}
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                {invoice.docType || "Invoice"} for{" "}
                {invoice.customerName}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-indigo-100">
              Invoice Total
            </p>

            <div className="mt-1 flex items-center text-2xl font-extrabold">
              <IndianRupee size={22} />

              {formatMoney(invoice.total)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => navigate("/invoices")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(`/invoices/${id}/edit`)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700"
        >
          <Edit3 size={17} />
          Edit Invoice
        </button>

        {balanceDue > 0 && (
          <button
            type="button"
            onClick={() => setPaymentOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700"
          >
            <CircleDollarSign size={18} />
            Record Payment
          </button>
        )}

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700"
        >
          <Printer size={17} />
          Print
        </button>

        <button
          type="button"
          onClick={downloadPdf}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Creating PDF...
            </>
          ) : (
            <>
              <Download size={17} />
              Download PDF
            </>
          )}
        </button>

        <button
          type="button"
          onClick={whatsappShare}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"
        >
          <MessageCircle size={17} />
          WhatsApp
        </button>
      </div>

      {/* Payment summary */}
      <section className="no-print overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Payment Status
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Track received and outstanding payments
              </p>
            </div>
          </div>

          <Badge status={invoice.status} />
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <PaymentMetric
            label="Invoice Total"
            value={invoice.total}
            icon={ReceiptText}
          />

          <PaymentMetric
            label="Amount Paid"
            value={amountPaid}
            icon={CheckCircle2}
            accent="emerald"
          />

          <PaymentMetric
            label="Balance Due"
            value={balanceDue}
            icon={Wallet}
            accent={balanceDue > 0 ? "amber" : "emerald"}
          />
        </div>

        <div className="px-5 pb-6 sm:px-6">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-500">
                Payment progress
              </span>

              <span className="text-xs font-bold text-slate-700">
                {paidPercentage.toFixed(0)}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${paidPercentage}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Payment history */}
      <PaymentHistory
        payments={invoice.payments || []}
      />

      {/* Invoice quick information */}
      <div className="no-print grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={CalendarDays}
          label="Invoice Date"
          value={invoice.date || "—"}
        />

        <InfoCard
          icon={CalendarDays}
          label="Due Date"
          value={invoice.dueDate || "—"}
        />

        <InfoCard
          icon={UserRound}
          label="Customer"
          value={invoice.customerName || "—"}
        />

        <InfoCard
          icon={Package}
          label="Items"
          value={`${invoice.items?.length || 0} item${
            (invoice.items?.length || 0) !== 1
              ? "s"
              : ""
          }`}
        />
      </div>

      {/* Printable invoice */}
      <div
        id="invoice-preview"
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none"
      >
        <InvoicePrint
          invoice={invoice}
          business={user}
        />
      </div>

      {/* Payment modal */}
      {paymentOpen && (
        <PaymentGatewayModal
          invoice={invoice}
          business={user}
          onClose={() => setPaymentOpen(false)}
          onInvoiceUpdated={(updatedInvoice) => {
            setInvoice(updatedInvoice);
          }}
        />
      )}
    </div>
  );
}

function PaymentGatewayModal({
  invoice,
  business,
  onClose,
  onInvoiceUpdated,
}) {
  const balance = Number(invoice.balanceDue || 0);

  const [method, setMethod] = useState("upi");

  const [amount, setAmount] = useState(
    balance.toFixed(2),
  );

  const [note, setNote] = useState("");

  const [upiId, setUpiId] = useState("demo@upi");

  const [cardNumber, setCardNumber] =
    useState("4242 4242 4242 4242");

  const [cardHolder, setCardHolder] =
    useState("DEMO CUSTOMER");

  const [expiry, setExpiry] = useState("12/30");

  const [cvv, setCvv] = useState("123");

  const [selectedBank, setSelectedBank] =
    useState(DEMO_BANKS[0]);

  const [chequeNumber, setChequeNumber] =
    useState("");

  const [chequeBank, setChequeBank] =
    useState("");

  const [sandboxResult, setSandboxResult] =
    useState("success");

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState("");

  const [paymentResult, setPaymentResult] =
    useState(null);

  const methodConfig = useMemo(
    () =>
      PAYMENT_METHODS.find(
        (item) => item.value === method,
      ),
    [method],
  );

  async function processPayment() {
    setError("");

    const numericAmount = Number(amount);

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      setError(
        "Please enter a valid payment amount.",
      );
      return;
    }

    if (numericAmount > balance) {
      setError(
        `Payment cannot exceed the remaining balance of ₹${formatMoney(
          balance,
        )}.`,
      );
      return;
    }

    if (method === "upi" && !upiId.trim()) {
      setError("Please enter a test UPI ID.");
      return;
    }

    if (
      method === "card" &&
      lastFour(cardNumber).length !== 4
    ) {
      setError(
        "Please enter the sandbox card details.",
      );
      return;
    }

    if (
      method === "cheque" &&
      !chequeNumber.trim()
    ) {
      setError(
        "Please enter a cheque number.",
      );
      return;
    }

    setProcessing(true);

    try {
      const payload = {
        amount: numericAmount,
        method,
        status: sandboxResult,
        paymentDate: new Date()
          .toISOString()
          .split("T")[0],
        note,
        bankName: "",
        maskedAccount: "",
        maskedCard: "",
      };

      if (method === "card") {
        payload.maskedCard = `•••• ${lastFour(
          cardNumber,
        )}`;
      }

      if (method === "bank_transfer") {
        payload.bankName =
          business?.bankName ||
          "Sandbox Business Bank";

        payload.maskedAccount = maskAccount(
          business?.accountNumber,
        );
      }

      if (method === "net_banking") {
        payload.bankName = selectedBank;
      }

      if (method === "cheque") {
        payload.bankName =
          chequeBank || "Cheque Bank";

        payload.note = [
          `Cheque ${chequeNumber}`,
          note,
        ]
          .filter(Boolean)
          .join(" — ");
      }

      if (method === "upi") {
        payload.note = [
          `Sandbox UPI: ${upiId}`,
          note,
        ]
          .filter(Boolean)
          .join(" — ");
      }

      // Small checkout-style processing state.
      await new Promise((resolve) =>
        setTimeout(resolve, 900),
      );

      const data = await api.post(
        `/invoices/${invoice._id}/payments`,
        payload,
      );

      setPaymentResult({
        payment: data.payment,
        invoice: data.invoice,
      });

      onInvoiceUpdated(data.invoice);
    } catch (err) {
      setError(
        err?.message ||
          "Could not process sandbox payment.",
      );
    } finally {
      setProcessing(false);
    }
  }

  if (paymentResult) {
    const payment = paymentResult.payment;

    const status =
      getPaymentStatusStyle(payment.status);

    const StatusIcon = status.icon;

    return (
      <ModalShell onClose={onClose}>
        <div className="p-6 sm:p-8">
          <div className="text-center">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                payment.status === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : payment.status === "pending"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-red-100 text-red-600"
              }`}
            >
              <StatusIcon
                size={38}
                className={
                  payment.status === "pending"
                    ? "animate-spin"
                    : ""
                }
              />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Sandbox Payment
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              {payment.status === "success"
                ? "Payment Successful"
                : payment.status === "pending"
                  ? "Payment Pending"
                  : "Payment Failed"}
            </h2>

            <div className="mt-4 flex items-center justify-center text-3xl font-extrabold text-slate-900">
              <IndianRupee size={26} />

              {formatMoney(payment.amount)}
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <ReceiptRow
              label="Payment Method"
              value={formatMethod(payment.method)}
            />

            <ReceiptRow
              label="Transaction Reference"
              value={payment.transactionId || "—"}
              mono
            />

            <ReceiptRow
              label="Bank / UTR Reference"
              value={payment.reference || "—"}
              mono
            />

            <ReceiptRow
              label="Payment Date"
              value={formatDate(payment.paymentDate)}
            />

            <ReceiptRow
              label="Status"
              value={status.label}
            />
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-800">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="text-sm font-bold">
                Sandbox transaction
              </p>

              <p className="mt-1 text-xs leading-5 text-indigo-700">
                This receipt is generated for demo and
                testing purposes. No real funds were
                transferred.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            <Check size={18} />
            Done
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={processing ? undefined : onClose}>
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={18}
                className="text-indigo-600"
              />

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Sandbox
              </span>
            </div>

            <h2 className="mt-3 text-xl font-extrabold text-slate-900">
              Record Payment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {invoice.invoiceNo} ·{" "}
              {invoice.customerName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
        {/* Amount */}
        <div className="rounded-2xl bg-slate-900 p-5 text-white">
          <p className="text-xs font-medium text-slate-400">
            Balance Due
          </p>

          <div className="mt-1 flex items-center text-2xl font-extrabold">
            <IndianRupee size={22} />
            {formatMoney(balance)}
          </div>

          <div className="mt-5">
            <label className="text-xs font-semibold text-slate-300">
              Payment Amount
            </label>

            <div className="relative mt-2">
              <IndianRupee
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="number"
                min="0.01"
                step="0.01"
                max={balance}
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-lg font-bold text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Sandbox notice */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p className="text-xs leading-5">
            Demo checkout only. Do not enter real card,
            banking, UPI, OTP, PIN or CVV credentials.
            No real payment will be initiated.
          </p>
        </div>

        {/* Methods */}
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Payment Method
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAYMENT_METHODS.map((item) => {
              const Icon = item.icon;

              const active = method === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setMethod(item.value);
                    setError("");
                  }}
                  className={`flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Method panel */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              {methodConfig && (
                <methodConfig.icon size={19} />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {methodConfig?.label}
              </p>

              <p className="text-xs text-slate-500">
                Sandbox payment method
              </p>
            </div>
          </div>

          {method === "upi" && (
            <div>
              <FieldLabel>Test UPI ID</FieldLabel>

              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="demo@upi"
                className={gatewayInputClass}
              />

              <p className="mt-2 text-xs text-slate-400">
                Use a fictional/test UPI ID only.
              </p>
            </div>
          )}

          {method === "card" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel>Test Card Number</FieldLabel>

                <input
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value)
                  }
                  placeholder="4242 4242 4242 4242"
                  className={gatewayInputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <FieldLabel>Cardholder</FieldLabel>

                <input
                  value={cardHolder}
                  onChange={(e) =>
                    setCardHolder(e.target.value)
                  }
                  className={gatewayInputClass}
                />
              </div>

              <div>
                <FieldLabel>Expiry</FieldLabel>

                <input
                  value={expiry}
                  onChange={(e) =>
                    setExpiry(e.target.value)
                  }
                  placeholder="12/30"
                  className={gatewayInputClass}
                />
              </div>

              <div>
                <FieldLabel>Test CVV</FieldLabel>

                <input
                  value={cvv}
                  onChange={(e) =>
                    setCvv(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 3),
                    )
                  }
                  placeholder="123"
                  className={gatewayInputClass}
                />
              </div>

              <p className="sm:col-span-2 text-xs leading-5 text-slate-400">
                Card data is used only for the visual
                sandbox form. Only the masked last four
                digits are sent to your server.
              </p>
            </div>
          )}

          {method === "bank_transfer" && (
            <div>
              <div className="rounded-xl border border-indigo-100 bg-white p-4">
                <ReceiptRow
                  label="Account Name"
                  value={
                    business?.accountHolderName ||
                    business?.businessName ||
                    "Your Business"
                  }
                />

                <ReceiptRow
                  label="Bank"
                  value={
                    business?.bankName ||
                    "Sandbox Business Bank"
                  }
                />

                <ReceiptRow
                  label="Account"
                  value={maskAccount(
                    business?.accountNumber,
                  )}
                />

                <ReceiptRow
                  label="IFSC"
                  value={
                    business?.ifsc ||
                    "SBX0001234"
                  }
                  mono
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Clicking Process records a sandbox transfer.
                It does not verify or initiate a real bank
                transfer.
              </p>
            </div>
          )}

          {method === "net_banking" && (
            <div>
              <FieldLabel>Demo Bank</FieldLabel>

              <select
                value={selectedBank}
                onChange={(e) =>
                  setSelectedBank(e.target.value)
                }
                className={gatewayInputClass}
              >
                {DEMO_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Continue to sandbox bank

                <ChevronRight size={17} />
              </button>
            </div>
          )}

          {method === "cash" && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <Banknote
                  size={20}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Record cash received
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    This records a manual cash payment
                    against the invoice.
                  </p>
                </div>
              </div>
            </div>
          )}

          {method === "cheque" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Cheque Number</FieldLabel>

                <input
                  value={chequeNumber}
                  onChange={(e) =>
                    setChequeNumber(e.target.value)
                  }
                  placeholder="000123"
                  className={gatewayInputClass}
                />
              </div>

              <div>
                <FieldLabel>Bank Name</FieldLabel>

                <input
                  value={chequeBank}
                  onChange={(e) =>
                    setChequeBank(e.target.value)
                  }
                  placeholder="Bank name"
                  className={gatewayInputClass}
                />
              </div>
            </div>
          )}

          {method === "other" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">
                Custom payment
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Add the payment details in the note below.
              </p>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="mt-5">
          <FieldLabel>Payment Note</FieldLabel>

          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional payment note..."
            className={`${gatewayInputClass} resize-none`}
          />
        </div>

        {/* Sandbox outcome */}
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={17}
              className="text-indigo-600"
            />

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sandbox Test Result
            </p>
          </div>

          <select
            value={sandboxResult}
            onChange={(e) =>
              setSandboxResult(e.target.value)
            }
            className={`${gatewayInputClass} mt-3`}
          >
            <option value="success">
              Simulate successful payment
            </option>

            <option value="pending">
              Simulate pending payment
            </option>

            <option value="failed">
              Simulate failed payment
            </option>
          </select>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm">
              {error}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={processPayment}
          disabled={processing}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {processing ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              Processing Sandbox Payment...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />

              Process ₹{formatMoney(amount || 0)}
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
          Sandbox Mode · No real funds are transferred
        </p>
      </div>
    </ModalShell>
  );
}

function PaymentHistory({ payments }) {
  return (
    <section className="no-print overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <History size={20} />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            Payment History
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            All payments recorded against this invoice
          </p>
        </div>
      </div>

      {!payments.length ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Wallet size={25} />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            No payment history yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Payments recorded from this invoice will appear
            here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {[...payments]
            .reverse()
            .map((payment) => {
              const status =
                getPaymentStatusStyle(payment.status);

              const StatusIcon = status.icon;

              const MethodIcon =
                PAYMENT_METHODS.find(
                  (item) =>
                    item.value === payment.method,
                )?.icon || Wallet;

              return (
                <div
                  key={payment._id}
                  className="p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <MethodIcon size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {formatMethod(payment.method)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            payment.paymentDate,
                          )}
                        </p>

                        {payment.transactionId && (
                          <p className="mt-2 break-all font-mono text-[11px] text-slate-400">
                            {payment.transactionId}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-lg font-extrabold text-slate-900">
                        ₹{formatMoney(payment.amount)}
                      </p>

                      <span
                        className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${status.className}`}
                      >
                        <StatusIcon
                          size={12}
                          className={
                            payment.status === "pending"
                              ? "animate-spin"
                              : ""
                          }
                        />

                        {status.label}
                      </span>
                    </div>
                  </div>

                  {(payment.reference ||
                    payment.note ||
                    payment.bankName ||
                    payment.maskedCard) && (
                    <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                      {payment.reference && (
                        <HistoryDetail
                          label="Reference / UTR"
                          value={payment.reference}
                        />
                      )}

                      {payment.bankName && (
                        <HistoryDetail
                          label="Bank"
                          value={payment.bankName}
                        />
                      )}

                      {payment.maskedCard && (
                        <HistoryDetail
                          label="Card"
                          value={payment.maskedCard}
                        />
                      )}

                      {payment.note && (
                        <HistoryDetail
                          label="Note"
                          value={payment.note}
                        />
                      )}
                    </div>
                  )}

                  {payment.isDemo && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                      <ShieldCheck size={12} />
                      Sandbox transaction
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div className="no-print fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function PaymentMetric({
  label,
  value,
  icon: Icon,
  accent = "indigo",
}) {
  const classes = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          classes[accent] || classes.indigo
        }`}
      >
        <Icon size={19} />
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-1 flex items-center text-xl font-extrabold text-slate-900">
        <IndianRupee size={18} />
        {formatMoney(value)}
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-3 last:border-b-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span
        className={`max-w-[65%] break-all text-right text-xs font-semibold text-slate-800 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function HistoryDetail({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-xs font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="mb-2 block text-xs font-semibold text-slate-600">
      {children}
    </label>
  );
}

const gatewayInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";
