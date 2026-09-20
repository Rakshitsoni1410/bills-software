const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");

const {
  signToken,
  requireAuth,
} = require("../middleware/auth");

const {
  loginLimiter,
  signupLimiter,
} = require("../middleware/rateLimiter");

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000;

const isProduction =
  process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 30 * 60 * 60 * 24 * 30,
};

// ─────────────────────────────────────────────
// Public user helper
// Never expose password/security fields
// ─────────────────────────────────────────────

function publicUser(user) {
  return {
    id: user._id,

    businessName: user.businessName,
    ownerName: user.ownerName,

    email: user.email,
    phone: user.phone,

    gstin: user.gstin,
    address: user.address,
    city: user.city,
    state: user.state,
    pincode: user.pincode,

    logoUrl: user.logoUrl,

    bankName: user.bankName,
    accountHolderName: user.accountHolderName,
    accountNumber: user.accountNumber,
    ifsc: user.ifsc,
    upiId: user.upiId,

    invoicePrefix: user.invoicePrefix,
    defaultGstRate: user.defaultGstRate,
    defaultNotes: user.defaultNotes,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ─────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────

router.post(
  "/signup",
  signupLimiter,
  async (req, res) => {
    try {
      const {
        businessName,
        ownerName,
        email,
        password,
        phone,
        gstin,
        address,
      } = req.body;

      if (
        !businessName ||
        !email ||
        !phone ||
        !password
      ) {
        return res.status(400).json({
          error:
            "Business name, email, phone and password are required",
        });
      }

      const cleanEmail = email
        .trim()
        .toLowerCase();

      const cleanPhone = String(phone).trim();

      const existing = await User.findOne({
        $or: [
          { email: cleanEmail },
          { phone: cleanPhone },
        ],
      });

      if (existing) {
        return res.status(409).json({
          error:
            "Email or phone already registered",
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const sessionToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      const user = await User.create({
        businessName: businessName.trim(),

        ownerName:
          typeof ownerName === "string"
            ? ownerName.trim()
            : "",

        email: cleanEmail,

        password: hashedPassword,

        phone: cleanPhone,

        gstin:
          typeof gstin === "string"
            ? gstin.trim().toUpperCase()
            : "",

        address:
          typeof address === "string"
            ? address.trim()
            : "",

        sessionToken,
      });

      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        sessionToken,
      });

      res.cookie(
        "token",
        token,
        cookieOptions,
      );

      res.status(201).json({
        user: publicUser(user),
      });
    } catch (err) {
      console.error(
        "Signup error:",
        err,
      );

      res.status(500).json({
        error:
          "Server error during signup",
      });
    }
  },
);

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

router.post(
  "/login",
  loginLimiter,
  async (req, res) => {
    try {
      const {
        login,
        password,
      } = req.body;

      if (!login || !password) {
        return res.status(400).json({
          error:
            "Email/Mobile and password are required",
        });
      }

      const cleanLogin =
        String(login).trim();

      const user =
        await User.findOne({
          $or: [
            {
              email:
                cleanLogin.toLowerCase(),
            },
            {
              phone: cleanLogin,
            },
          ],
        });

      if (!user) {
        return res.status(401).json({
          error:
            "Invalid email/mobile or password",
        });
      }

      // Account temporarily locked
      if (user.isLocked) {
        const minutesLeft =
          Math.ceil(
            (user.lockUntil -
              Date.now()) /
            60000,
          );

        return res.status(423).json({
          error: `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1
              ? "s"
              : ""
            }.`,
        });
      }

      const valid =
        await bcrypt.compare(
          password,
          user.password,
        );

      if (!valid) {
        user.failedLoginAttempts += 1;

        if (
          user.failedLoginAttempts >=
          MAX_FAILED_ATTEMPTS
        ) {
          user.lockUntil = new Date(
            Date.now() + LOCK_TIME,
          );

          await user.save();

          return res.status(423).json({
            error:
              "Account locked for 30 minutes due to too many failed attempts.",
          });
        }

        const attemptsLeft =
          MAX_FAILED_ATTEMPTS -
          user.failedLoginAttempts;

        await user.save();

        return res.status(401).json({
          error: `Invalid email/mobile or password. ${attemptsLeft} attempt${attemptsLeft > 1
              ? "s"
              : ""
            } left before lockout.`,
        });
      }

      // Successful login
      user.failedLoginAttempts = 0;
      user.lockUntil = null;

      user.sessionToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      await user.save();

      const token = signToken({
        userId:
          user._id.toString(),

        email:
          user.email,

        sessionToken:
          user.sessionToken,
      });

      res.cookie(
        "token",
        token,
        cookieOptions,
      );

      res.json({
        user: publicUser(user),
      });
    } catch (err) {
      console.error(
        "Login error:",
        err,
      );

      res.status(500).json({
        error:
          "Server error during login",
      });
    }
  },
);

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────

router.post(
  "/logout",
  requireAuth,
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.user.userId,
        {
          sessionToken: null,
        },
      );
    } catch {
      // Still clear cookie
    }

    res.clearCookie(
      "token",
      cookieOptions,
    );

    res.json({
      success: true,
    });
  },
);

// ─────────────────────────────────────────────
// CURRENT USER
// ─────────────────────────────────────────────

router.get(
  "/me",
  requireAuth,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId,
        ).select(
          "-password -sessionToken -failedLoginAttempts -lockUntil",
        );

      if (!user) {
        return res.status(401).json({
          user: null,
        });
      }

      res.json({
        user: publicUser(user),
      });
    } catch (err) {
      console.error(
        "Current user error:",
        err,
      );

      res.status(500).json({
        user: null,
      });
    }
  },
);

// ─────────────────────────────────────────────
// UPDATE BUSINESS SETTINGS
// ─────────────────────────────────────────────

router.put(
  "/me",
  requireAuth,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId,
        );

      if (!user) {
        return res.status(404).json({
          error:
            "Business account not found",
        });
      }

      const {
        businessName,
        ownerName,
        phone,
        gstin,
        address,
        city,
        state,
        pincode,
        logoUrl,

        bankName,
        accountHolderName,
        accountNumber,
        ifsc,
        upiId,

        invoicePrefix,
        defaultGstRate,
        defaultNotes,
      } = req.body;

      // ─────────────────────────────
      // Required business name
      // ─────────────────────────────

      const cleanBusinessName =
        String(
          businessName || "",
        ).trim();

      if (!cleanBusinessName) {
        return res.status(400).json({
          error:
            "Business name is required",
        });
      }

      // ─────────────────────────────
      // Phone validation
      // ─────────────────────────────

      const cleanPhone =
        String(
          phone || "",
        )
          .replace(/\D/g, "")
          .slice(0, 10);

      if (
        cleanPhone.length !== 10
      ) {
        return res.status(400).json({
          error:
            "Please enter a valid 10-digit mobile number",
        });
      }

      // Ensure phone belongs only to
      // this account
      if (
        cleanPhone !==
        user.phone
      ) {
        const phoneExists =
          await User.findOne({
            phone: cleanPhone,
            _id: {
              $ne: user._id,
            },
          });

        if (phoneExists) {
          return res.status(409).json({
            error:
              "This phone number is already registered",
          });
        }
      }

      // ─────────────────────────────
      // GSTIN validation
      // ─────────────────────────────

      const cleanGstin =
        String(
          gstin || "",
        )
          .trim()
          .toUpperCase();

      if (
        cleanGstin &&
        !/^[0-9A-Z]{15}$/.test(
          cleanGstin,
        )
      ) {
        return res.status(400).json({
          error:
            "GSTIN must be 15 characters",
        });
      }

      // ─────────────────────────────
      // PIN code
      // ─────────────────────────────

      const cleanPincode =
        String(
          pincode || "",
        )
          .replace(/\D/g, "")
          .slice(0, 6);

      if (
        cleanPincode &&
        cleanPincode.length !== 6
      ) {
        return res.status(400).json({
          error:
            "PIN code must be 6 digits",
        });
      }

      // ─────────────────────────────
      // GST default
      // ─────────────────────────────

      const parsedGst =
        Number(defaultGstRate);

      const allowedGstRates = [
        0,
        5,
        12,
        18,
        28,
      ];

      if (
        !allowedGstRates.includes(
          parsedGst,
        )
      ) {
        return res.status(400).json({
          error:
            "Invalid default GST rate",
        });
      }

      // ─────────────────────────────
      // Invoice prefix
      // ─────────────────────────────

      const cleanInvoicePrefix =
        String(
          invoicePrefix || "",
        )
          .trim()
          .toUpperCase()
          .replace(
            /[^A-Z0-9_-]/g,
            "",
          )
          .slice(0, 20);

      // ─────────────────────────────
      // Save
      // ─────────────────────────────

      user.businessName =
        cleanBusinessName;

      user.ownerName =
        String(
          ownerName || "",
        ).trim();

      user.phone =
        cleanPhone;

      user.gstin =
        cleanGstin;

      user.address =
        String(
          address || "",
        ).trim();

      user.city =
        String(
          city || "",
        ).trim();

      user.state =
        String(
          state || "",
        ).trim();

      user.pincode =
        cleanPincode;

      user.logoUrl =
        String(
          logoUrl || "",
        ).trim();

      user.bankName =
        String(
          bankName || "",
        ).trim();

      user.accountHolderName =
        String(
          accountHolderName || "",
        ).trim();

      user.accountNumber =
        String(
          accountNumber || "",
        ).trim();

      user.ifsc =
        String(
          ifsc || "",
        )
          .trim()
          .toUpperCase();

      user.upiId =
        String(
          upiId || "",
        ).trim();

      user.invoicePrefix =
        cleanInvoicePrefix;

      user.defaultGstRate =
        parsedGst;

      user.defaultNotes =
        String(
          defaultNotes || "",
        ).trim();

      await user.save();

      res.json({
        message:
          "Business settings updated successfully",

        user:
          publicUser(user),
      });
    } catch (err) {
      console.error(
        "Settings update error:",
        err,
      );

      if (
        err?.code === 11000
      ) {
        return res.status(409).json({
          error:
            "Phone number is already registered",
        });
      }

      res.status(500).json({
        error:
          "Could not update business settings",
      });
    }
  },
);

module.exports = router;