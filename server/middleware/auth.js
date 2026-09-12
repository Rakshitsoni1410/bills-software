const express  = require("express");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");
const User     = require("../models/User");
const { signToken, requireAuth }      = require("../middleware/auth");
const { loginLimiter, signupLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME           = 30 * 60 * 1000; // 30 minutes

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure:   isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge:   30 * 60 * 60 * 24 * 30,
};

// ── SIGNUP ─────────────────────────────────────────────────
router.post("/signup", signupLimiter, async (req, res) => {
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
    const sessionToken   = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      businessName,
      ownerName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      gstin,
      address,
      sessionToken,
    });

    const token = signToken({
      userId: user._id.toString(),
      email:  user.email,
      sessionToken,
    });

    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      user: {
        id:           user._id,
        businessName: user.businessName,
        email:        user.email,
        phone:        user.phone,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ── LOGIN ──────────────────────────────────────────────────
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "Email/Mobile and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { phone: login }],
    });

    // ✅ Don't reveal whether email exists or not
    if (!user) {
      return res.status(401).json({ error: "Invalid email/mobile or password" });
    }

    // ✅ Check if account is locked
    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        error: `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      // ✅ Increment failed attempts
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        // ✅ Lock the account for 30 minutes
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        await user.save();
        return res.status(423).json({
          error: "Account locked for 30 minutes due to too many failed attempts.",
        });
      }

      const attemptsLeft = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
      await user.save();

      return res.status(401).json({
        error: `Invalid email/mobile or password. ${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left before lockout.`,
      });
    }

    // ✅ Success — reset lockout fields
    user.failedLoginAttempts = 0;
    user.lockUntil           = null;
    user.sessionToken        = crypto.randomBytes(32).toString("hex");
    await user.save();

    const token = signToken({
      userId:       user._id.toString(),
      email:        user.email,
      sessionToken: user.sessionToken,
    });

    res.cookie("token", token, cookieOptions);
    res.json({
      user: {
        id:           user._id,
        businessName: user.businessName,
        email:        user.email,
        phone:        user.phone,
        gstin:        user.gstin,
        address:      user.address,
        upiId:        user.upiId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ── LOGOUT ─────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { sessionToken: null });
  } catch {}
  res.clearCookie("token", cookieOptions);
  res.json({ success: true });
});

// ── CURRENT USER ───────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password -sessionToken -failedLoginAttempts -lockUntil");
    if (!user) return res.status(401).json({ user: null });
    res.json({ user });
  } catch {
    res.status(500).json({ user: null });
  }
});

module.exports = router;