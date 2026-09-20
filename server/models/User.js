const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────────────
    // BUSINESS PROFILE
    // ─────────────────────────────────────────────
    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "Gujarat",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    // We store the URL for now.
    // Actual image uploading can be added later without changing the DB again.
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // ─────────────────────────────────────────────
    // BANK DETAILS
    // ─────────────────────────────────────────────
    bankName: {
      type: String,
      trim: true,
      default: "",
    },

    accountHolderName: {
      type: String,
      trim: true,
      default: "",
    },

    accountNumber: {
      type: String,
      trim: true,
      default: "",
    },

    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    upiId: {
      type: String,
      trim: true,
      default: "",
    },

    // ─────────────────────────────────────────────
    // INVOICE DEFAULTS
    // ─────────────────────────────────────────────
    invoicePrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    defaultGstRate: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      default: 18,
    },

    defaultNotes: {
      type: String,
      trim: true,
      default:
        "Payment due within 30 days. Thank you for your business!",
    },

    // ─────────────────────────────────────────────
    // AUTH / SECURITY
    // ─────────────────────────────────────────────
    sessionToken: {
      type: String,
      default: null,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// True while account is temporarily locked
UserSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

module.exports = mongoose.model("User", UserSchema);