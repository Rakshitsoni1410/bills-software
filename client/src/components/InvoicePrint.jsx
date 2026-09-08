
function numToWords(num) {
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  function inWords(n) {
    if (n === 0) return "";

    if (n < 20) {
      return a[n];
    }

    if (n < 100) {
      return (
        b[Math.floor(n / 10)] +
        (n % 10 ? " " + a[n % 10] : "")
      );
    }

    if (n < 1000) {
      return (
        a[Math.floor(n / 100)] +
        " hundred" +
        (n % 100 ? " " + inWords(n % 100) : "")
      );
    }

    if (n < 100000) {
      return (
        inWords(Math.floor(n / 1000)) +
        " thousand" +
        (n % 1000 ? " " + inWords(n % 1000) : "")
      );
    }

    if (n < 10000000) {
      return (
        inWords(Math.floor(n / 100000)) +
        " lakh" +
        (n % 100000 ? " " + inWords(n % 100000) : "")
      );
    }

    return (
      inWords(Math.floor(n / 10000000)) +
      " crore" +
      (n % 10000000 ? " " + inWords(n % 10000000) : "")
    );
  }

  const rounded = Math.round(num);

  if (rounded === 0) {
    return "Zero rupees only";
  }

  const words = inWords(rounded);

  return (
    words.charAt(0).toUpperCase() +
    words.slice(1) +
    " rupees only"
  );
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusStyle(status) {
  if (status === "paid") {
    return {
      label: "Paid",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "udhaar") {
    return {
      label: "Udhaar",
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (status === "partial") {
    return {
      label: "Partial",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: status || "Invoice",
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  };
}

export default function InvoicePrint({
  invoice,
  business,
}) {
  if (!invoice) return null;

  const status = getStatusStyle(invoice.status);

  const totalGst =
    Number(invoice.cgst || 0) +
    Number(invoice.sgst || 0);

  return (
    <div
      id="invoice-print-area"
      className="min-h-[1050px] bg-white text-slate-800"
    >
      {/* Top Accent */}
      <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500" />

      <div className="p-5 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="flex flex-col gap-7 border-b border-slate-200 pb-7 sm:flex-row sm:items-start sm:justify-between">
          {/* Business */}
          <div className="max-w-md">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-sm">
                ₹
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {business?.businessName ||
                    "Your Business"}
                </h1>

                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-indigo-500">
                  GST Billing
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-1.5 text-xs leading-5 text-slate-500">
              {business?.gstin && (
                <div>
                  <span className="font-semibold text-slate-700">
                    GSTIN:
                  </span>{" "}
                  {business.gstin}
                </div>
              )}

              {business?.address && (
                <div className="max-w-sm">
                  {business.address}
                </div>
              )}

              {business?.phone && (
                <div>
                  <span className="font-semibold text-slate-700">
                    Phone:
                  </span>{" "}
                  {business.phone}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Identity */}
          <div className="sm:min-w-[270px] sm:text-right">
            <div className="flex items-start justify-between gap-3 sm:block">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                  {invoice.docType || "Invoice"}
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                  {invoice.invoiceNo}
                </h2>
              </div>

              {invoice.status && (
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${status.className}`}
                >
                  {status.label}
                </span>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2 text-xs sm:grid-cols-1">
              <InvoiceMeta
                label="Invoice Date"
                value={invoice.date}
              />

              {invoice.dueDate && (
                <InvoiceMeta
                  label="Due Date"
                  value={invoice.dueDate}
                />
              )}

              {invoice.placeOfSupply && (
                <InvoiceMeta
                  label="Place of Supply"
                  value={invoice.placeOfSupply}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Bill To
            </p>

            <h3 className="mt-2 text-base font-bold text-slate-900">
              {invoice.customerName ||
                "Customer Name"}
            </h3>

            <div className="mt-3 space-y-1.5 text-xs leading-5 text-slate-500">
              {invoice.customerGstin && (
                <div>
                  <span className="font-semibold text-slate-700">
                    GSTIN:
                  </span>{" "}
                  {invoice.customerGstin}
                </div>
              )}

              {invoice.customerPhone && (
                <div>
                  <span className="font-semibold text-slate-700">
                    Phone:
                  </span>{" "}
                  {invoice.customerPhone}
                </div>
              )}

              {invoice.customerAddress && (
                <div>
                  {invoice.customerAddress}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Invoice Summary
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Items
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {invoice.items?.length || 0}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  GST
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  ₹{formatMoney(totalGst)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="w-12 px-3 py-3.5 text-center font-semibold">
                  #
                </th>

                <th className="px-3 py-3.5 text-left font-semibold">
                  Description
                </th>

                <th className="w-16 px-3 py-3.5 text-center font-semibold">
                  Qty
                </th>

                <th className="w-28 px-3 py-3.5 text-right font-semibold">
                  Rate
                </th>

                <th className="w-20 px-3 py-3.5 text-center font-semibold">
                  GST
                </th>

                <th className="w-32 px-3 py-3.5 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {invoice.items?.map((item, index) => {
                const amount =
                  Number(item.qty || 0) *
                  Number(item.rate || 0) *
                  (1 +
                    Number(item.gst || 0) /
                      100);

                return (
                  <tr
                    key={index}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-4 text-center text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-3 py-4">
                      <p className="font-semibold text-slate-800">
                        {item.desc}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-center text-slate-600">
                      {item.qty}
                    </td>

                    <td className="px-3 py-4 text-right text-slate-600">
                      ₹{formatMoney(item.rate)}
                    </td>

                    <td className="px-3 py-4 text-center">
                      <span className="inline-flex rounded-lg bg-indigo-50 px-2 py-1 font-semibold text-indigo-600">
                        {item.gst}%
                      </span>
                    </td>

                    <td className="px-3 py-4 text-right font-semibold text-slate-900">
                      ₹{formatMoney(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-7 flex justify-end">
          <div className="w-full sm:w-[340px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <TotalRow
                label="Subtotal"
                value={invoice.subtotal}
              />

              <TotalRow
                label="CGST"
                value={invoice.cgst}
              />

              <TotalRow
                label="SGST"
                value={invoice.sgst}
              />

              <div className="my-4 border-t border-dashed border-slate-300" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Grand Total
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Inclusive of GST
                  </p>
                </div>

                <div className="text-xl font-extrabold text-indigo-700">
                  ₹{formatMoney(invoice.total)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400">
            Amount in Words
          </p>

          <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-700">
            {numToWords(invoice.total)}
          </p>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Notes / Terms
            </p>

            <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Signature / Footer */}
        <div className="mt-12 grid gap-8 border-t border-slate-200 pt-7 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-700">
              Thank you for your business.
            </p>

            <p className="mt-2 max-w-sm text-[11px] leading-5 text-slate-400">
              Please retain this invoice for your
              records. For billing queries, contact the
              business using the details provided above.
            </p>
          </div>

          <div className="sm:text-right">
            <div className="inline-block min-w-[180px] border-t border-slate-300 pt-2 text-center">
              <p className="text-xs font-semibold text-slate-700">
                Authorized Signatory
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                {business?.businessName ||
                  "Your Business"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-slate-100 pt-5 text-center">
          <p className="text-[10px] leading-5 text-slate-400">
            This is a computer-generated invoice and
            does not require a physical signature.
          </p>

          <p className="mt-1 text-[10px] font-medium text-slate-400">
            Generated using Bills Software
          </p>

          <p className="mt-1 text-[10px] text-slate-300">
            Technical Support:
            {" "}
            rakshitrsoni@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}

function InvoiceMeta({ label, value }) {
  return (
    <div className="sm:flex sm:justify-end sm:gap-3">
      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function TotalRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-700">
        ₹{formatMoney(value)}
      </span>
    </div>
  );
}
