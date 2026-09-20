const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    desc: {
      type: String,
      required: true,
      trim: true,
    },

    qty: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },

    rate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    gst: {
      type: Number,
      required: true,
      default: 18,
    },
  },
  {
    _id: false,
  },
);

// ─────────────────────────────────────────────
// PAYMENT HISTORY
// ─────────────────────────────────────────────

const PaymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    method: {
      type: String,

      enum: [
        "upi",
        "card",
        "bank_transfer",
        "net_banking",
        "cash",
        "cheque",
        "other",
      ],

      required: true,
    },

    // Internal sandbox transaction reference
    transactionId: {
      type: String,
      trim: true,
    },

    // UTR / bank-style reference
    reference: {
      type: String,
      trim: true,
    },

    status: {
      type: String,

      enum: [
        "success",
        "pending",
        "failed",
      ],

      default: "success",
    },

    paymentDate: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    // Optional display information
    bankName: {
      type: String,
      trim: true,
      default: "",
    },

    maskedAccount: {
      type: String,
      trim: true,
      default: "",
    },

    maskedCard: {
      type: String,
      trim: true,
      default: "",
    },

    // IMPORTANT:
    // Gateway payments are simulated.
    mode: {
      type: String,

      enum: [
        "sandbox",
        "manual",
      ],

      default: "sandbox",
    },

    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const InvoiceSchema = new mongoose.Schema(
  {
    userId: {
      type:
        mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    customerId: {
      type:
        mongoose.Schema.Types.ObjectId,

      ref: "Customer",
    },

    customerName: {
      type: String,
      required: true,
    },

    customerPhone: String,
    customerGstin: String,
    customerAddress: String,

    invoiceNo: {
      type: String,
      required: true,
    },

    docType: {
      type: String,

      enum: [
        "Tax Invoice",
        "Quotation",
        "Proforma Invoice",
      ],

      default: "Tax Invoice",
    },

    date: {
      type: String,
      required: true,
    },

    dueDate: String,

    placeOfSupply:
      String,

    items: {
      type: [ItemSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      default: 0,
    },

    cgst: {
      type: Number,
      default: 0,
    },

    sgst: {
      type: Number,
      default: 0,
    },

    igst: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    notes: String,

    status: {
      type: String,

      enum: [
        "paid",
        "udhaar",
        "partial",
      ],

      default: "paid",
    },

    // ───────────────────────────────────────
    // PAYMENT TRACKING
    // ───────────────────────────────────────

    // null keeps old invoices backward-compatible.
    amountPaid: {
      type: Number,
      default: null,
      min: 0,
    },

    balanceDue: {
      type: Number,
      default: null,
      min: 0,
    },

    payments: {
      type: [PaymentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

InvoiceSchema.index(
  {
    userId: 1,
    invoiceNo: 1,
  },
  {
    unique: true,
  },
);

module.exports =
  mongoose.model(
    "Invoice",
    InvoiceSchema,
  );