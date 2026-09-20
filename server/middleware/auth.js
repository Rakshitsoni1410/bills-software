const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

// ─────────────────────────────────────────────
// SIGN JWT
// ─────────────────────────────────────────────

function signToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );
}

// ─────────────────────────────────────────────
// REQUIRE AUTHENTICATION
// ─────────────────────────────────────────────

async function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        error:
          "Please login to continue.",
      });
    }

    if (!JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured",
      );

      return res.status(500).json({
        error:
          "Server authentication configuration error",
      });
    }

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET,
      );

    if (!decoded?.userId) {
      return res.status(401).json({
        error:
          "Invalid session. Please login again.",
      });
    }

    // Find current user and verify that
    // this is still the active session.
    const user =
      await User.findById(
        decoded.userId,
      ).select(
        "_id email sessionToken",
      );

    if (!user) {
      return res.status(401).json({
        error:
          "Account not found. Please login again.",
      });
    }

    // Session token validation makes sure that
    // logging in on another device invalidates
    // the old device/session.
    if (
      !decoded.sessionToken ||
      !user.sessionToken ||
      decoded.sessionToken !==
        user.sessionToken
    ) {
      return res.status(401).json({
        error:
          "Your session has expired or you logged in on another device.",
      });
    }

    // Routes already expect:
    // req.user.userId
    req.user = {
      userId:
        user._id.toString(),

      email:
        user.email,

      sessionToken:
        decoded.sessionToken,
    };

    next();
  } catch (err) {
    if (
      err.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          "Session expired. Please login again.",
      });
    }

    if (
      err.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        error:
          "Invalid session. Please login again.",
      });
    }

    console.error(
      "Auth middleware error:",
      err,
    );

    return res.status(401).json({
      error:
        "Authentication failed. Please login again.",
    });
  }
}

module.exports = {
  signToken,
  requireAuth,
};