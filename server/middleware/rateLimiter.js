const rateLimit = require("express-rate-limit");

// ── Login rate limiter ─────────────────────────────────────
// Max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  // ✅ Custom handler — so it matches your error format
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many login attempts. Please try again after 15 minutes.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// ── Signup rate limiter ────────────────────────────────────
// Max 3 signups per hour per IP
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many accounts created. Please try again after 1 hour.",
    });
  },
});

// ── General API rate limiter ───────────────────────────────
// Max 100 requests per 10 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests. Please slow down.",
    });
  },
});

module.exports = { loginLimiter, signupLimiter, apiLimiter };