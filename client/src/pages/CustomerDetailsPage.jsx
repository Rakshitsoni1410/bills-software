
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/Badge";
import { api } from "../api/client";

import {
  AlertCircle,
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  FilePlus2,
  FileText,
  History,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  Wallet,
} from "lucide-react";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CustomerDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  const [invoices, setInvoices] = useState([]);

  const [khataEntries, setKhataEntries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomerProfile();
  }, [id]);

  async function loadCustomerProfile() {
    setLoading(true);
    setError("");

    try {
      const [
        customerData,
        invoiceData,
        khataData,
      ] = await Promise.all([
        api.get("/customers"),
        api.get("/invoices"),
        api.get("/khata"),
      ]);

      const customers =
        customerData.customers || [];

      const foundCustomer =
        customers.find(
          (item) =>
            String(item._id) === String(id),
        );

      if (!foundCustomer) {
        setError("Customer not found.");
        return;
      }

      setCustomer(foundCustomer);

      const customerName =
        normalize(foundCustomer.name);

      const relatedInvoices =
        (invoiceData.invoices || []).filter(
          (invoice) => {
            const directMatch =
              String(
                invoice.customerId || "",
              ) === String(id);

            const fallbackMatch =
              !invoice.customerId &&
              normalize(
                invoice.customerName,
              ) === customerName;

            return (
              directMatch ||
              fallbackMatch
            );
          },
        );

      const relatedKhata =
        (khataData.entries || []).filter(
          (entry) => {
            const directMatch =
              String(
                entry.customerId || "",
              ) === String(id);

            const fallbackMatch =
              !entry.customerId &&
              normalize(
                entry.customerName,
              ) === customerName;

            return (
              directMatch ||
              fallbackMatch
            );
          },
        );

      setInvoices(relatedInvoices);

      setKhataEntries(relatedKhata);
    } catch (err) {
      setError(
        err?.message ||
          "Could not load customer profile.",
      );
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const totalBilled =
      invoices.reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.total || 0,
          ),
        0,
      );

    const totalPaid =
      invoices.reduce(
        (sum, invoice) => {
          if (
            invoice.amountPaid !==
              undefined &&
            invoice.amountPaid !==
              null
          ) {
            return (
              sum +
              Number(
                invoice.amountPaid ||
                  0,
              )
            );
          }

          if (
            invoice.status ===
            "paid"
          ) {
            return (
              sum +
              Number(
                invoice.total || 0,
              )
            );
          }

          return sum;
        },
        0,
      );

    const outstanding =
      invoices.reduce(
        (sum, invoice) => {
          if (
            invoice.balanceDue !==
              undefined &&
            invoice.balanceDue !==
              null
          ) {
            return (
              sum +
              Number(
                invoice.balanceDue ||
                  0,
              )
            );
          }

          if (
            invoice.status ===
            "paid"
          ) {
            return sum;
          }

          return (
            sum +
            Number(
              invoice.total || 0,
            )
          );
        },
        0,
      );

    const khataBalance =
      khataEntries.reduce(
        (sum, entry) => {
          const amount =
            Number(
              entry.amount || 0,
            );

          if (
            entry.type ===
            "received"
          ) {
            return sum - amount;
          }

          return sum + amount;
        },
        0,
      );

    return {
      totalBilled,
      totalPaid,
      outstanding,
      khataBalance:
        Math.max(
          0,
          khataBalance,
        ),
    };
  }, [invoices, khataEntries]);

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
        <Loader2
          size={34}
          className="animate-spin text-indigo-600"
        />

        <p className="mt-4 text-sm font-semibold text-slate-700">
          Loading customer profile...
        </p>
      </div>
    );
  }

  if (
    error ||
    !customer
  ) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-white px-6 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle
            size={30}
          />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Customer unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error ||
            "Customer could not be found."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/customers",
            )
          }
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft
            size={17}
          />

          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-extrabold backdrop-blur">
              {customer.name
                ?.charAt(0)
                .toUpperCase() ||
                "C"}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Customer Profile
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                {customer.name}
              </h1>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-indigo-100">
                {customer.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone
                      size={14}
                    />

                    {
                      customer.phone
                    }
                  </span>
                )}

                {customer.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin
                      size={14}
                    />

                    {
                      customer.city
                    }
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/customers",
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft
                size={17}
              />

              Customers
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/billing",
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5"
            >
              <FilePlus2
                size={17}
              />

              New Bill
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total Billed"
          value={
            metrics.totalBilled
          }
          icon={
            ReceiptText
          }
        />

        <Metric
          label="Amount Received"
          value={
            metrics.totalPaid
          }
          icon={
            CircleDollarSign
          }
          accent="emerald"
        />

        <Metric
          label="Outstanding"
          value={
            metrics.outstanding
          }
          icon={Wallet}
          accent={
            metrics.outstanding >
            0
              ? "amber"
              : "emerald"
          }
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <FileText
              size={20}
            />
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Invoices
          </p>

          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {invoices.length}
          </p>
        </div>
      </div>

      {/* Details */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={UserRound}
          title="Customer Information"
          subtitle="Saved contact and tax details"
        />

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <Detail
            icon={UserRound}
            label="Customer Name"
            value={
              customer.name
            }
          />

          <Detail
            icon={Phone}
            label="Phone"
            value={
              customer.phone ||
              "Not provided"
            }
          />

          <Detail
            icon={
              BadgeIndianRupee
            }
            label="GSTIN"
            value={
              customer.gstin ||
              "Not provided"
            }
          />

          <Detail
            icon={MapPin}
            label="City"
            value={
              customer.city ||
              "Not provided"
            }
          />

          <div className="sm:col-span-2">
            <Detail
              icon={MapPin}
              label="Address"
              value={
                customer.address ||
                "Not provided"
              }
            />
          </div>
        </div>
      </section>

      {/* Invoices */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <SectionHeader
          icon={ReceiptText}
          title="Invoice History"
          subtitle={`${invoices.length} invoice${
            invoices.length !==
            1
              ? "s"
              : ""
          } for this customer`}
        />

        {!invoices.length ? (
          <EmptyState
            icon={ReceiptText}
            title="No invoices yet"
            text="Invoices created for this customer will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map(
              (invoice) => (
                <button
                  key={
                    invoice._id
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/invoices/${invoice._id}`,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FileText
                        size={18}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {
                          invoice.invoiceNo
                        }
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays
                          size={13}
                        />

                        {
                          invoice.date
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="font-bold text-slate-900">
                        ₹
                        {formatMoney(
                          invoice.total,
                        )}
                      </p>

                      <div className="mt-1">
                        <Badge
                          status={
                            invoice.status
                          }
                        />
                      </div>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-400"
                    />
                  </div>
                </button>
              ),
            )}
          </div>
        )}
      </section>

      {/* Khata */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <History
                size={20}
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Khata History
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Credit and payment
                ledger entries
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">
              Khata Balance
            </p>

            <p className="mt-0.5 font-extrabold text-amber-800">
              ₹
              {formatMoney(
                metrics.khataBalance,
              )}
            </p>
          </div>
        </div>

        {!khataEntries.length ? (
          <EmptyState
            icon={Wallet}
            title="No khata entries"
            text="Credit and received entries for this customer will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {khataEntries.map(
              (entry) => (
                <div
                  key={
                    entry._id
                  }
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        entry.type ===
                        "received"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {entry.type ===
                      "received" ? (
                        <CircleDollarSign
                          size={18}
                        />
                      ) : (
                        <Wallet
                          size={18}
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {entry.type ===
                        "received"
                          ? "Payment Received"
                          : "Udhaar"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {entry.note ||
                          "Khata entry"}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {
                          entry.date
                        }
                      </p>
                    </div>
                  </div>

                  <div
                    className={`text-right font-extrabold ${
                      entry.type ===
                      "received"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {entry.type ===
                    "received"
                      ? "−"
                      : "+"}
                    ₹
                    {formatMoney(
                      entry.amount,
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  accent = "indigo",
}) {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600",
    emerald:
      "bg-emerald-50 text-emerald-600",
    amber:
      "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          colors[accent] ||
          colors.indigo
        }`}
      >
        <Icon size={20} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-center text-2xl font-extrabold text-slate-900">
        <IndianRupee
          size={20}
        />

        {formatMoney(value)}
      </div>
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

function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={25} />
      </div>

      <p className="mt-4 text-sm font-bold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>
    </div>
  );
}
