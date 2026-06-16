const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String },
    gstin: { type: String },
    address: { type: String },
    city: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
