const mongoose = require("mongoose");

const KhataSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["udhaar", "received"], required: true },
    note: { type: String },
    date: { type: String, required: true },
    relatedInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Khata", KhataSchema);
