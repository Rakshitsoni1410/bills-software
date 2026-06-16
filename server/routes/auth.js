const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

router.post("/signup", async (req, res) => {
  try {
    const { businessName, ownerName, email, password, phone, gstin, address } = req.body;

    if (!businessName || !email || !password) {
      return res.status(400).json({ error: "Business name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      businessName,
      ownerName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      gstin,
      address,
    });

    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      user: { id: user._id, businessName: user.businessName, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.cookie("token", token, cookieOptions);

    res.json({
      user: {
        id: user._id,
        businessName: user.businessName,
        email: user.email,
        gstin: user.gstin,
        phone: user.phone,
        address: user.address,
        upiId: user.upiId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ success: true });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(401).json({ user: null });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ user: null });
  }
});

module.exports = router;
