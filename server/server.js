require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const invoiceRoutes = require("./routes/invoices");
const khataRoutes = require("./routes/khata");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

connectDB();

// Render sits behind a proxy/load balancer. Without trust proxy, Express
// can't tell the request was actually HTTPS, which breaks secure cookies.
app.set("trust proxy", 1);

// CLIENT_URL can be a single URL or a comma-separated list (useful for
// supporting both a Netlify preview URL and a custom domain at once).
// Trailing slashes are stripped so "https://x.com/" and "https://x.com"
// both match - browsers send Origin without a trailing slash.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, server-to-server health checks)
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

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/khata", khataRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Catches any unhandled errors (including CORS rejections) so they return
// a clean JSON response instead of Express's default 500 HTML error page.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`BillKaro server running on port ${PORT}`));