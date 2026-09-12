require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const connectDB    = require("./config/db");

const authRoutes      = require("./routes/auth");
const customerRoutes  = require("./routes/customers");
const invoiceRoutes   = require("./routes/invoices");
const khataRoutes     = require("./routes/khata");
const dashboardRoutes = require("./routes/dashboard");

// ✅ Import rate limiters
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

connectDB();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Apply global rate limiter to ALL /api routes
// This runs before any route — blocks API spam and DDoS
app.use("/api", apiLimiter);

// ── Routes ─────────────────────────────────────────────────
// login/signup limiters are applied inside auth.js per route
app.use("/api/auth",      authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices",  invoiceRoutes);
app.use("/api/khata",     khataRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  // ✅ Handle rate limit errors that bubble up
  if (err.status === 429) {
    return res.status(429).json({ error: err.message });
  }

  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`BillKaro server running on port ${PORT}`)
);