import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Badge from "../components/Badge";
import { api } from "../api/client";
import { toast } from "react-hot-toast";

import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  IndianRupee,
  Inbox,
  Loader2,
  Package,
  ReceiptText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

const TABS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "udhaar", label: "Udhaar" },
  { value: "partial", label: "Partial" },
];

const INITIAL_FILTERS = {
  customer: "all",
  docType: "all",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function InvoicesPage() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    loadInvoices();
  }, []);

  function loadInvoices() {
    setLoading(true);

    api
      .get("/invoices")
      .then((data) => {
        setInvoices(data.invoices || []);
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to load invoices");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setFilters(INITIAL_FILTERS);
  }

  const customers = useMemo(() => {
    const names = invoices
      .map((invoice) => invoice.customerName?.trim())
      .filter(Boolean);

    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  const documentTypes = useMemo(() => {
    const values = invoices
      .map((invoice) => invoice.docType?.trim())
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  const activeAdvancedFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "customer" || key === "docType") {
        return value !== "all";
      }

      return String(value || "").trim() !== "";
    }).length;
  }, [filters]);

  const hasAnyFilter =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    activeAdvancedFilterCount > 0;

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const total = Number(invoice.total || 0);

      const searchableText = [
        invoice.invoiceNo,
        invoice.customerName,
        invoice.customerPhone,
        invoice.customerGstin,
        invoice.docType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (term && !searchableText.includes(term)) {
        return false;
      }

      if (statusFilter !== "all" && invoice.status !== statusFilter) {
        return false;
      }

      if (
        filters.customer !== "all" &&
        invoice.customerName !== filters.customer
      ) {
        return false;
      }

      if (filters.docType !== "all" && invoice.docType !== filters.docType) {
        return false;
      }

      if (filters.fromDate && invoice.date && invoice.date < filters.fromDate) {
        return false;
      }

      if (filters.toDate && invoice.date && invoice.date > filters.toDate) {
        return false;
      }

      if (filters.minAmount !== "" && total < Number(filters.minAmount)) {
        return false;
      }

      if (filters.maxAmount !== "" && total > Number(filters.maxAmount)) {
        return false;
      }

      return true;
    });
  }, [invoices, search, statusFilter, filters]);

  const visibleTotal = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.total || 0),
      0,
    );
  }, [filteredInvoices]);

  return (
    <div className="space-y-7">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-indigo-500/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <ReceiptText size={28} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Billing Records
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Invoices
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                Search, filter and manage all generated invoices.
              </p>
            </div>
          </div>

          {!loading && (
            <div className="flex flex-wrap gap-2">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                  Invoices
                </p>
                <p className="mt-0.5 text-sm font-bold">{invoices.length}</p>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                  Visible Total
                </p>
                <p className="mt-0.5 text-sm font-bold">
                  ₹{formatMoney(visibleTotal)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Search + status */}
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      statusFilter === tab.value
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                <div className="relative min-w-0 flex-1 xl:w-80 xl:flex-none">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Invoice, customer, phone, GSTIN..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    showFilters || activeAdvancedFilterCount > 0
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <SlidersHorizontal size={17} />
                  Filters
                  {activeAdvancedFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                      {activeAdvancedFilterCount}
                    </span>
                  )}
                </button>

                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Filter size={17} className="text-indigo-600" />

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Advanced Filters
                    </p>

                    <p className="text-xs text-slate-500">
                      Combine multiple filters to narrow the invoice list.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <FilterField label="Customer">
                    <SelectWrap>
                      <select
                        value={filters.customer}
                        onChange={(e) =>
                          updateFilter("customer", e.target.value)
                        }
                        className={filterInputClass}
                      >
                        <option value="all">All customers</option>

                        {customers.map((customer) => (
                          <option key={customer} value={customer}>
                            {customer}
                          </option>
                        ))}
                      </select>
                    </SelectWrap>
                  </FilterField>

                  <FilterField label="Document Type">
                    <SelectWrap>
                      <select
                        value={filters.docType}
                        onChange={(e) =>
                          updateFilter("docType", e.target.value)
                        }
                        className={filterInputClass}
                      >
                        <option value="all">All document types</option>

                        {documentTypes.map((docType) => (
                          <option key={docType} value={docType}>
                            {docType}
                          </option>
                        ))}
                      </select>
                    </SelectWrap>
                  </FilterField>

                  <FilterField label="From Date">
                    <input
                      type="date"
                      value={filters.fromDate}
                      max={filters.toDate || undefined}
                      onChange={(e) => updateFilter("fromDate", e.target.value)}
                      className={filterInputClass}
                    />
                  </FilterField>

                  <FilterField label="To Date">
                    <input
                      type="date"
                      value={filters.toDate}
                      min={filters.fromDate || undefined}
                      onChange={(e) => updateFilter("toDate", e.target.value)}
                      className={filterInputClass}
                    />
                  </FilterField>

                  <FilterField label="Minimum Amount">
                    <div className="relative">
                      <IndianRupee
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={filters.minAmount}
                        onChange={(e) =>
                          updateFilter("minAmount", e.target.value)
                        }
                        placeholder="0.00"
                        className={`${filterInputClass} pl-9`}
                      />
                    </div>
                  </FilterField>

                  <FilterField label="Maximum Amount">
                    <div className="relative">
                      <IndianRupee
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={filters.maxAmount}
                        onChange={(e) =>
                          updateFilter("maxAmount", e.target.value)
                        }
                        placeholder="No limit"
                        className={`${filterInputClass} pl-9`}
                      />
                    </div>
                  </FilterField>
                </div>
              </div>
            )}

            {/* Result summary */}
            {!loading && hasAnyFilter && (
              <div className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing{" "}
                  <strong className="text-slate-700">
                    {filteredInvoices.length}
                  </strong>{" "}
                  matching invoice
                  {filteredInvoices.length !== 1 ? "s" : ""}
                </span>

                <span>
                  Matching value:{" "}
                  <strong className="text-slate-700">
                    ₹{formatMoney(visibleTotal)}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <Loader2 size={34} className="animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading invoices...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching your billing records
            </p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={30} />
            </div>

            <h3 className="mt-5 text-base font-semibold text-slate-800">
              No invoices found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              {hasAnyFilter
                ? "No invoices match the current search and filters."
                : "There are no invoices yet."}
            </p>

            {hasAnyFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <RotateCcw size={16} />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Items
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[210px] truncate text-sm font-semibold text-slate-900">
                              {invoice.invoiceNo}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Invoice
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <p className="max-w-[180px] truncate text-sm font-medium text-slate-700">
                          {invoice.customerName}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
                          <CalendarDays size={15} className="text-slate-400" />
                          {invoice.date || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
                          {invoice.docType || "Tax Invoice"}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <Package size={13} />
                          {invoice.items?.length || 0}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <div className="inline-flex items-center justify-end font-bold text-slate-900">
                          <IndianRupee size={15} />
                          {formatMoney(invoice.total)}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <Badge status={invoice.status} />
                      </td>

                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/invoices/${invoice._id}`)}
                          className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-100"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FileText size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {invoice.invoiceNo}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-600">
                          {invoice.customerName}
                        </p>

                        <p className="mt-1 text-[11px] font-medium text-violet-600">
                          {invoice.docType || "Tax Invoice"}
                        </p>
                      </div>
                    </div>

                    <Badge status={invoice.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                    <MobileMetric
                      label="Date"
                      value={invoice.date || "—"}
                      icon={CalendarDays}
                    />

                    <MobileMetric
                      label="Items"
                      value={`${invoice.items?.length || 0} item${
                        (invoice.items?.length || 0) !== 1 ? "s" : ""
                      }`}
                      icon={Package}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Total Amount
                      </p>

                      <div className="mt-1 flex items-center text-lg font-bold text-slate-900">
                        <IndianRupee size={16} />
                        {formatMoney(invoice.total)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/invoices/${invoice._id}`)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                    >
                      View
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredInvoices.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {invoices.length}
                </span>{" "}
                invoices
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectWrap({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function MobileMetric({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <Icon size={13} />
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

const filterInputClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";
