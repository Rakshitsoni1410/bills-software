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
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, server-to-server health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`BillKaro server running on port ${PORT}`));