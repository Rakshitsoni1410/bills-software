const express = require("express");
const Khata = require("../models/Khata");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const entries = await Khata.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ entries });
});

router.post("/", async (req, res) => {
  const { customerId, customerName, amount, type, note, date } = req.body;
  if (!customerName || !amount || !type) {
    return res.status(400).json({ error: "Customer name, amount and type are required" });
  }

  const entry = await Khata.create({
    userId: req.user.userId,
    customerId: customerId || null,
    customerName,
    amount,
    type,
    note,
    date: date || new Date().toISOString().split("T")[0],
  });
  res.status(201).json({ entry });
});

router.delete("/:id", async (req, res) => {
  const result = await Khata.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!result) return res.status(404).json({ error: "Entry not found" });
  res.json({ success: true });
});

module.exports = router;
