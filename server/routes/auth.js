const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // ✅ built-in Node.js, no install needed
const User = require("../models/User");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 30 * 60 * 60 * 24 * 30,
};

// ── SIGNUP ────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { businessName, ownerName, email, password, phone, gstin, address } = req.body;

    if (!businessName || !email || !phone || !password) {
      return res.status(400).json({
        error: "Business name, email, phone and password are required",
      });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });
    if (existing) {
      return res.status(409).json({ error: "Email or phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate sessionToken on signup too
    const sessionToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      businessName,
      ownerName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      gstin,
      address,
      sessionToken, // ✅ save to DB
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      sessionToken, // ✅ embed in JWT
    });

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      user: {
        id: user._id,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ── LOGIN ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "Email/Mobile and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { phone: login }],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email/mobile or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email/mobile or password" });
    }

    // ✅ Generate NEW sessionToken — this invalidates all other devices
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // ✅ Save to DB — old device's token no longer matches
    user.sessionToken = sessionToken;
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      sessionToken, // ✅ embed in JWT
    });

    res.cookie("token", token, cookieOptions);

    res.json({
      user: {
        id: user._id,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
        gstin: user.gstin,
        address: user.address,
        upiId: user.upiId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ── LOGOUT ────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  try {
    // ✅ Clear sessionToken from DB so JWT is permanently invalid
    await User.findByIdAndUpdate(req.user.userId, { sessionToken: null });
  } catch {
    // still clear cookie even if DB update fails
  }

  res.clearCookie("token", cookieOptions);
  res.json({ success: true });
});

// ── CURRENT USER ──────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -sessionToken");

    if (!user) return res.status(401).json({ user: null });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ user: null });
  }
});

module.exports = router;