const express = require("express");
const Customer = require("../models/Customer");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const customers = await Customer.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ customers });
});

router.post("/", async (req, res) => {
  const { name, phone, gstin, address, city } = req.body;
  if (!name) return res.status(400).json({ error: "Customer name is required" });

  const customer = await Customer.create({
    userId: req.user.userId,
    name,
    phone,
    gstin,
    address,
    city,
  });
  res.status(201).json({ customer });
});

router.put("/:id", async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    req.body,
    { new: true }
  );
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json({ customer });
});

router.delete("/:id", async (req, res) => {
  const result = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!result) return res.status(404).json({ error: "Customer not found" });
  res.json({ success: true });
});

module.exports = router;
