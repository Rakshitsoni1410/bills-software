
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  Loader2,
  Printer,
  Download,
  MessageCircle,
  AlertCircle,
  ReceiptText,
  IndianRupee,
  CalendarDays,
  UserRound,
  Package,
} from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import InvoicePrint from "../components/InvoicePrint";
import Badge from "../components/Badge";

import {
  api,
} from "../api/client";

import {
  useAuth,
} from "../context/AuthContext";

export default function InvoiceDetailsPage() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const [
    invoice,
    setInvoice,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
    setLoading(true);
    setError("");

    try {
      const data =
        await api.get(
          `/invoices/${id}`,
        );

      setInvoice(data.invoice);
    } catch (err) {
      setError(
        err?.message ||
          "Could not load invoice.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (
      !invoice ||
      downloading
    ) {
      return;
    }

    const element =
      document.getElementById(
        "invoice-preview",
      );

    if (!element) return;

    setDownloading(true);

    try {
      const canvas =
        await html2canvas(
          element,
          {
            scale: 2,
            useCORS: true,
            backgroundColor:
              "#ffffff",
          },
        );

      const imgData =
        canvas.toDataURL(
          "image/png",
        );

      const pdf = new jsPDF(
        "p",
        "mm",
        "a4",
      );

      const pdfWidth = 210;

      const pdfHeight =
        (canvas.height *
          pdfWidth) /
        canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
      );

      pdf.save(
        `${invoice.invoiceNo}.pdf`,
      );
    } catch (err) {
      setError(
        "Could not generate the PDF. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  }

  function whatsappShare() {
    if (!invoice) return;

    const itemLines =
      (invoice.items || [])
        .map((item) => {
          const base =
            Number(
              item.qty || 0,
            ) *
            Number(
              item.rate || 0,
            );

          return `• ${
            item.desc
          } (${item.qty} × ₹${Number(
            item.rate || 0,
          ).toFixed(
            2,
          )}) = ₹${base.toFixed(
            2,
          )}`;
        })
        .join("\n");

    const totalGst =
      Number(
        invoice.cgst || 0,
      ) +
      Number(
        invoice.sgst || 0,
      ) +
      Number(
        invoice.igst || 0,
      );

    const message = `*${user?.businessName || "Business"}*
*${invoice.docType || "Invoice"} ${invoice.invoiceNo}*

Dear ${invoice.customerName || "Customer"},

Your bill details:

${itemLines}

Subtotal: ₹${Number(invoice.subtotal || 0).toFixed(2)}
GST: ₹${totalGst.toFixed(2)}

*Total: ₹${Number(invoice.total || 0).toFixed(2)}*

Thank you for your business!`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        message,
      )}`,
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

  if (
    error &&
    !invoice
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
          {error}
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
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="no-print flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <AlertCircle
              size={18}
            />
          </div>

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
              <ReceiptText
                size={27}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                  Invoice Details
                </p>

                <Badge
                  status={
                    invoice.status
                  }
                />
              </div>

              <h1 className="mt-2 break-all text-xl font-bold tracking-tight sm:text-2xl">
                {
                  invoice.invoiceNo
                }
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                {invoice.docType ||
                  "Invoice"}{" "}
                for{" "}
                {
                  invoice.customerName
                }
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-indigo-100">
              Invoice Total
            </p>

            <div className="mt-1 flex items-center text-2xl font-extrabold">
              <IndianRupee
                size={22}
              />

              {Number(
                invoice.total ||
                  0,
              ).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/invoices",
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft
            size={17}
          />

          Back
        </button>

        <button
          type="button"
          onClick={() =>
            window.print()
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700"
        >
          <Printer
            size={17}
          />

          Print
        </button>

        <button
          type="button"
          onClick={
            downloadPdf
          }
          disabled={
            downloading
          }
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
              <Download
                size={17}
              />

              Download PDF
            </>
          )}
        </button>

        <button
          type="button"
          onClick={
            whatsappShare
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"
        >
          <MessageCircle
            size={17}
          />

          WhatsApp
        </button>
      </div>

      {/* Quick Information */}
      <div className="no-print grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={
            CalendarDays
          }
          label="Invoice Date"
          value={
            invoice.date ||
            "—"
          }
        />

        <InfoCard
          icon={
            CalendarDays
          }
          label="Due Date"
          value={
            invoice.dueDate ||
            "—"
          }
        />

        <InfoCard
          icon={
            UserRound
          }
          label="Customer"
          value={
            invoice.customerName ||
            "—"
          }
        />

        <InfoCard
          icon={Package}
          label="Items"
          value={`${
            invoice.items
              ?.length || 0
          } item${
            (invoice.items
              ?.length || 0) !==
            1
              ? "s"
              : ""
          }`}
        />
      </div>

      {/* Printable Invoice */}
      <div
        id="invoice-preview"
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none"
      >
        <InvoicePrint
          invoice={invoice}
          business={user}
        />
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