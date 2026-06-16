const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    desc: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
    gst: { type: Number, required: true, default: 18 },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
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
      enum: ["Tax Invoice", "Quotation", "Proforma Invoice"],
      default: "Tax Invoice",
    },

    date: {
      type: String,
      required: true,
    },

    dueDate: String,
    placeOfSupply: String,

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
      enum: ["paid", "udhaar", "partial"],
      default: "paid",
    },


  },
  {
    timestamps: true,
  }
);

InvoiceSchema.index(
  { userId: 1, invoiceNo: 1 },
  { unique: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
