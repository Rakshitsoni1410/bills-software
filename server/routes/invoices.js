const express = require("express");

const Invoice = require("../models/Invoice");
const Khata = require("../models/Khata");
const Customer = require("../models/Customer");
const Counter = require("../models/Counter");
const User = require("../models/User");

const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// ─────────────────────────────────────────────
// CALCULATE INVOICE TOTALS
// ─────────────────────────────────────────────

function calcTotals(items) {
  let subtotal = 0;
  let cgst = 0;
  let sgst = 0;

  items.forEach((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const gst = Number(item.gst) || 0;

    const base = qty * rate;

    subtotal += base;

    // GST split equally into CGST + SGST
    cgst += (base * gst) / 200;
    sgst += (base * gst) / 200;
  });

  subtotal = Math.round(subtotal * 100) / 100;
  cgst = Math.round(cgst * 100) / 100;
  sgst = Math.round(sgst * 100) / 100;

  const total = Math.round((subtotal + cgst + sgst) * 100) / 100;

  return {
    subtotal,
    cgst,
    sgst,
    igst: 0,
    total,
  };
}

// ─────────────────────────────────────────────
// INVOICE NUMBER HELPERS
// ─────────────────────────────────────────────

// "Shree Traders" → "SHREETRADERS"
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

// Atomically creates the next invoice number.
async function generateInvoiceNo(userId, businessName) {
  const dateKey = todayKey();

  const counterKey = `${userId}:${dateKey}`;

  const counter = await Counter.findOneAndUpdate(
    {
      key: counterKey,
    },
    {
      $inc: {
        seq: 1,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  const seqStr = String(counter.seq).padStart(3, "0");

  const slug = slugifyBusinessName(businessName);

  return `${slug}-${dateKey}-${seqStr}`;
}

// ─────────────────────────────────────────────
// CUSTOMER HELPER
// ─────────────────────────────────────────────

async function resolveCustomer(userId, body) {
  // Existing selected customer
  if (body.customerId) {
    const customer = await Customer.findOne({
      _id: body.customerId,
      userId,
    });

    if (customer) {
      return customer._id;
    }
  }

  if (!body.customerName?.trim()) {
    return null;
  }

  const customerName = body.customerName.trim();

  // Check existing customer by name
  const existing = await Customer.findOne({
    userId,
    name: customerName,
  });

  if (existing) {
    return existing._id;
  }

  // Automatically save manually entered customer
  const created = await Customer.create({
    userId,

    name: customerName,

    phone: body.customerPhone || "",

    gstin: body.customerGstin || "",

    address: body.customerAddress || "",
  });

  return created._id;
}

// ─────────────────────────────────────────────
// GET ALL INVOICES
// ─────────────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      userId: req.user.userId,
    };

    if (status && status !== "all") {
      filter.status = status;
    }

    const invoices = await Invoice.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      invoices,
    });
  } catch (err) {
    console.error("Load invoices error:", err);

    res.status(500).json({
      error: "Could not load invoices",
    });
  }
});

// ─────────────────────────────────────────────
// GET SINGLE INVOICE
// ─────────────────────────────────────────────

router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,

      userId: req.user.userId,
    });

    if (!invoice) {
      return res.status(404).json({
        error: "Invoice not found",
      });
    }

    res.json({
      invoice,
    });
  } catch (err) {
    console.error("Load invoice error:", err);

    res.status(500).json({
      error: "Could not load invoice",
    });
  }
});

// ─────────────────────────────────────────────
// CREATE INVOICE
// ─────────────────────────────────────────────

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (!body.items || !Array.isArray(body.items) || !body.items.length) {
      return res.status(400).json({
        error: "At least one item is required",
      });
    }

    if (!body.customerName?.trim()) {
      return res.status(400).json({
        error: "Customer name is required",
      });
    }

    const totals = calcTotals(body.items);

    const user = await User.findById(req.user.userId).select("businessName");

    const invoiceNo = await generateInvoiceNo(
      req.user.userId,
      user?.businessName,
    );

    const customerId = await resolveCustomer(req.user.userId, body);

    const invoice = await Invoice.create({
      userId: req.user.userId,

      customerId,

      customerName: body.customerName.trim(),

      customerPhone: body.customerPhone || "",

      customerGstin: body.customerGstin || "",

      customerAddress: body.customerAddress || "",

      invoiceNo,

      docType: body.docType || "Tax Invoice",

      date: body.date,

      dueDate: body.dueDate || "",

      placeOfSupply: body.placeOfSupply || "",

      items: body.items,

      ...totals,

      notes: body.notes || "",

      status: body.status || "paid",
    });

    // Automatically create Khata entry
    // only for Udhaar invoices.
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

    res.status(201).json({
      invoice,
    });
  } catch (err) {
    console.error("Create invoice error:", err);

    res.status(500).json({
      error: "Could not create invoice",
    });
  }
});

// ─────────────────────────────────────────────
// EDIT / UPDATE INVOICE
// ─────────────────────────────────────────────

router.put("/:id", async (req, res) => {
  try {
    const body = req.body;

    // Find invoice first.
    // This also ensures the logged-in business owns it.
    const invoice = await Invoice.findOne({
      _id: req.params.id,

      userId: req.user.userId,
    });

    if (!invoice) {
      return res.status(404).json({
        error: "Invoice not found",
      });
    }

    // ─────────────────────────
    // VALIDATION
    // ─────────────────────────

    if (!body.items || !Array.isArray(body.items) || !body.items.length) {
      return res.status(400).json({
        error: "At least one item is required",
      });
    }

    const validItems = body.items.filter((item) => item.desc?.trim());

    if (validItems.length === 0) {
      return res.status(400).json({
        error: "At least one item must have a description",
      });
    }

    if (!body.customerName?.trim()) {
      return res.status(400).json({
        error: "Customer name is required",
      });
    }

    const allowedStatuses = ["paid", "udhaar", "partial"];

    const newStatus = allowedStatuses.includes(body.status)
      ? body.status
      : invoice.status;

    // Keep old status so Khata can
    // be synchronized correctly.
    const oldStatus = invoice.status;

    // ─────────────────────────
    // SERVER-SIDE TOTALS
    // ─────────────────────────

    const totals = calcTotals(validItems);

    // ─────────────────────────
    // CUSTOMER
    // ─────────────────────────

    const customerId = await resolveCustomer(req.user.userId, {
      ...body,

      customerName: body.customerName.trim(),
    });

    // ─────────────────────────
    // UPDATE ALLOWED FIELDS
    // ─────────────────────────

    // IMPORTANT:
    // invoiceNo and userId are intentionally
    // NOT updated.

    invoice.customerId = customerId;

    invoice.customerName = body.customerName.trim();

    invoice.customerPhone = body.customerPhone || "";

    invoice.customerGstin = body.customerGstin || "";

    invoice.customerAddress = body.customerAddress || "";

    invoice.docType = body.docType || invoice.docType;

    invoice.date = body.date || invoice.date;

    invoice.dueDate = body.dueDate || "";

    invoice.placeOfSupply = body.placeOfSupply || "";

    invoice.items = validItems.map((item) => ({
      desc: String(item.desc).trim(),

      qty: Number(item.qty) || 0,

      rate: Number(item.rate) || 0,

      gst: Number(item.gst) || 0,
    }));

    invoice.subtotal = totals.subtotal;

    invoice.cgst = totals.cgst;

    invoice.sgst = totals.sgst;

    invoice.igst = totals.igst;

    invoice.total = totals.total;

    invoice.notes = body.notes || "";

    invoice.status = newStatus;

    await invoice.save();

    // ─────────────────────────
    // SYNCHRONIZE KHATA
    // ─────────────────────────

    const relatedKhata = await Khata.findOne({
      userId: req.user.userId,

      relatedInvoiceId: invoice._id,

      type: "udhaar",
    });

    // Case 1:
    // Invoice is still Udhaar.
    // Update existing Khata entry or create one
    // if it doesn't exist.
    if (newStatus === "udhaar") {
      if (relatedKhata) {
        relatedKhata.customerId = customerId;

        relatedKhata.customerName = invoice.customerName;

        relatedKhata.amount = invoice.total;

        relatedKhata.note = `Invoice ${invoice.invoiceNo}`;

        relatedKhata.date = invoice.date;

        await relatedKhata.save();
      } else {
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
    }

    // Case 2:
    // Invoice used to be Udhaar but has
    // now changed to Paid or Partial.
    //
    // Only the automatically-created
    // invoice-linked Udhaar entry is removed.
    // Manual Khata entries are untouched.
    if (oldStatus === "udhaar" && newStatus !== "udhaar" && relatedKhata) {
      await Khata.deleteOne({
        _id: relatedKhata._id,

        userId: req.user.userId,
      });
    }

    res.json({
      message: "Invoice updated successfully",

      invoice,
    });
  } catch (err) {
    console.error("Update invoice error:", err);

    res.status(500).json({
      error: "Could not update invoice",
    });
  }
});

// ─────────────────────────────────────────────
// DELETE INVOICE
// ─────────────────────────────────────────────

router.delete("/:id", async (req, res) => {
  try {
    const result = await Invoice.findOneAndDelete({
      _id: req.params.id,

      userId: req.user.userId,
    });

    if (!result) {
      return res.status(404).json({
        error: "Invoice not found",
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("Delete invoice error:", err);

    res.status(500).json({
      error: "Could not delete invoice",
    });
  }
});

module.exports = router;
