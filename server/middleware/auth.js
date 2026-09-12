const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

// ✅ Now async — checks sessionToken in DB on every request
async function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  try {
    // ✅ Fetch user from DB to check sessionToken
    const user = await User.findById(decoded.userId).select("sessionToken");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ THE KEY CHECK — if tokens don't match, user logged in elsewhere
    if (!user.sessionToken || user.sessionToken !== decoded.sessionToken) {
      return res.status(401).json({
        error: "Logged in from another device. Please login again.",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication error" });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET };