const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    ownerName:    { type: String },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true },
    phone: {
      type:   String,
      unique: true,
      sparse: true,
    },
    gstin:        { type: String },
    address:      { type: String },
    upiId:        { type: String },
    sessionToken: { type: String, default: null },

    // ✅ Brute force protection
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil:           { type: Date,   default: null },
  },
  { timestamps: true }
);

// ✅ Virtual — true if account is currently locked
UserSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

module.exports = mongoose.model("User", UserSchema);