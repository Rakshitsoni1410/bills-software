const express = require("express");
const Invoice = require("../models/Invoice");
const Khata = require("../models/Khata");
const Customer = require("../models/Customer");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = req.user.userId;

  const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
  const khataEntries = await Khata.find({ userId });
  const customerCount = await Customer.countDocuments({ userId });

  const totalSales = invoices.reduce((s, i) => s + i.total, 0);
  const totalGst = invoices.reduce((s, i) => s + i.cgst + i.sgst + (i.igst || 0), 0);

  let udhaarGiven = 0;
  let udhaarReceived = 0;
  const udhaarCustomers = new Set();
  khataEntries.forEach((e) => {
    if (e.type === "udhaar") {
      udhaarGiven += e.amount;
      udhaarCustomers.add(e.customerName);
    } else {
      udhaarReceived += e.amount;
    }
  });

  const gstByRate = {};
  invoices.forEach((inv) => {
    inv.items.forEach((it) => {
      const key = it.gst;
      gstByRate[key] = (gstByRate[key] || 0) + (it.qty * it.rate * it.gst) / 100;
    });
  });

  res.json({
    totalSales: Math.round(totalSales * 100) / 100,
    totalGst: Math.round(totalGst * 100) / 100,
    invoiceCount: invoices.length,
    udhaarPending: Math.round((udhaarGiven - udhaarReceived) * 100) / 100,
    udhaarCustomerCount: udhaarCustomers.size,
    customerCount,
    recentInvoices: invoices.slice(0, 5),
    gstByRate,
  });
});

module.exports = router;
