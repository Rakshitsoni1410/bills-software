function numToWords(num) {
  const a = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
    "eighteen", "nineteen",
  ];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function inWords(n) {
    if (n === 0) return "";
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  }

  const rounded = Math.round(num);
  if (rounded === 0) return "zero rupees only";
  const words = inWords(rounded);
  return words.charAt(0).toUpperCase() + words.slice(1) + " rupees only";
}

export default function InvoicePrint({ invoice, business }) {
  if (!invoice) return null;

  return (
    <div className="bg-white p-6 sm:p-8 text-sm" id="invoice-print-area">
      <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-4">
        <div>
          <div className="text-lg font-medium">{business?.businessName || "Your business"}</div>
          {business?.gstin && <div className="text-xs text-gray-500">GSTIN: {business.gstin}</div>}
          {business?.address && <div className="text-xs text-gray-500">{business.address}</div>}
          {business?.phone && <div className="text-xs text-gray-500">{business.phone}</div>}
        </div>
        <div className="text-right">
          <div className="text-base font-medium">{invoice.docType}</div>
          <div className="text-xs text-gray-500"># {invoice.invoiceNo}</div>
          <div className="text-xs text-gray-500">Date: {invoice.date}</div>
          {invoice.dueDate && <div className="text-xs text-gray-500">Due: {invoice.dueDate}</div>}
          {invoice.placeOfSupply && (
            <div className="text-xs text-gray-500">Place of supply: {invoice.placeOfSupply}</div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 font-medium mb-1">Bill to</div>
        <div className="text-sm font-medium">{invoice.customerName}</div>
        {invoice.customerGstin && <div className="text-xs text-gray-500">GSTIN: {invoice.customerGstin}</div>}
        {invoice.customerAddress && <div className="text-xs text-gray-500">{invoice.customerAddress}</div>}
        {invoice.customerPhone && <div className="text-xs text-gray-500">{invoice.customerPhone}</div>}
      </div>

      <table className="w-full text-xs mb-4 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">#</th>
            <th className="text-left p-2">Description</th>
            <th className="text-center p-2">Qty</th>
            <th className="text-right p-2">Rate</th>
            <th className="text-center p-2">GST</th>
            <th className="text-right p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{item.desc}</td>
              <td className="text-center p-2">{item.qty}</td>
              <td className="text-right p-2">₹{Number(item.rate).toFixed(2)}</td>
              <td className="text-center p-2">{item.gst}%</td>
              <td className="text-right p-2">
                ₹{(item.qty * item.rate * (1 + item.gst / 100)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-2">
        <div className="w-56">
          <div className="flex justify-between text-xs text-gray-600 py-1">
            <span>Subtotal</span>
            <span>₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 py-1">
            <span>CGST</span>
            <span>₹{invoice.cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 py-1">
            <span>SGST</span>
            <span>₹{invoice.sgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium border-t border-gray-300 pt-2 mt-1">
            <span>Total</span>
            <span>₹{invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 italic mb-3">
        Amount in words: {numToWords(invoice.total)}
      </div>

      {invoice.notes && (
        <div className="text-xs text-gray-600 border-t border-gray-200 pt-3 mt-3">
          <div className="font-medium text-gray-700 mb-1">Notes</div>
          {invoice.notes}
        </div>
      )}

      <div className="text-xs text-gray-400 text-center mt-6">This is a computer-generated invoice.</div>
    </div>
  );
}
