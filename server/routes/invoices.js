const express = require("express");
const Invoice = require("../models/Invoice");
const Khata = require("../models/Khata");
const Customer = require("../models/Customer");
const Counter = require("../models/Counter");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function calcTotals(items) {
  let subtotal = 0,
    cgst = 0,
    sgst = 0;
  items.forEach((i) => {
    const base = (Number(i.qty) || 0) * (Number(i.rate) || 0);
    subtotal += base;
    cgst += (base * (Number(i.gst) || 0)) / 200;
    sgst += (base * (Number(i.gst) || 0)) / 200;
  });
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    total: Math.round((subtotal + cgst + sgst) * 100) / 100,
  };
}

// Strips spaces/punctuation and uppercases the business name so
// "Shree Traders" becomes "SHREETRADERS" for use in invoice numbers.
function slugifyBusinessName(name) {
  const cleaned = (name || "BUSINESS").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned || "BUSINESS";
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// Atomically increments a per-business, per-day counter and returns the
// next invoice number, e.g. "SHREETRADERS-20260616-001". Using
// findOneAndUpdate with $inc and upsert means concurrent requests never
// collide on the same sequence number, even under load.
async function generateInvoiceNo(userId, businessName) {
  const dateKey = todayKey();
  const counterKey = `${userId}:${dateKey}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const seqStr = String(counter.seq).padStart(3, "0");
  const slug = slugifyBusinessName(businessName);
  return `${slug}-${dateKey}-${seqStr}`;
}

router.get("/", async (req, res) => {
  const { status } = req.query;
  const filter = { userId: req.user.userId };
  if (status && status !== "all") filter.status = status;

  const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
  res.json({ invoices });
});

router.get("/:id", async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  res.json({ invoice });
});

router.post("/", async (req, res) => {
  const body = req.body;
  if (!body.items || !body.items.length) {
    return res.status(400).json({ error: "At least one item is required" });
  }

  const totals = calcTotals(body.items);

  const user = await User.findById(req.user.userId).select("businessName");
  const invoiceNo = await generateInvoiceNo(req.user.userId, user?.businessName);

  // Auto-save new customers typed manually so they appear in the customer
  // database next time, avoiding duplicate data entry.
  let customerId = body.customerId || null;
  if (!customerId && body.customerName) {
    const existing = await Customer.findOne({ userId: req.user.userId, name: body.customerName });
    if (existing) {
      customerId = existing._id;
    } else {
      const created = await Customer.create({
        userId: req.user.userId,
        name: body.customerName,
        phone: body.customerPhone,
        gstin: body.customerGstin,
        address: body.customerAddress,
      });
      customerId = created._id;
    }
  }

  const invoice = await Invoice.create({
    userId: req.user.userId,
    customerId,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerGstin: body.customerGstin,
    customerAddress: body.customerAddress,
    invoiceNo,
    docType: body.docType || "Tax Invoice",
    date: body.date,
    dueDate: body.dueDate,
    placeOfSupply: body.placeOfSupply,
    items: body.items,
    ...totals,
    notes: body.notes,
    status: body.status || "paid",
  });

  // Udhaar invoices automatically create a matching khata entry so the
  // user doesn't have to log the same credit twice.
  if (invoice.status === "udhaar") {
    await Khata.create({
      userId: req.user.userId,
      customerId,
      customerName: invoice.customerName,
      amount: invoice.total,
      type: "udhaar",
      note: `Invoice ${invoice.invoiceNo}`,
      date: invoice.date,
      relatedInvoiceId: invoice._id,
    });
  }

  res.status(201).json({ invoice });
});

router.put("/:id", async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    req.body,
    { new: true }
  );
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  res.json({ invoice });
});

router.delete("/:id", async (req, res) => {
  const result = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!result) return res.status(404).json({ error: "Invoice not found" });
  res.json({ success: true });
});

module.exports = router;