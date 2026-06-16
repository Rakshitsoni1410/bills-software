const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    ownerName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
   phone: {
  type: String,
  unique: true,
  sparse: true,
},
    gstin: { type: String },
    address: { type: String },
    upiId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
