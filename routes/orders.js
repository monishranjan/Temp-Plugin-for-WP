const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const protect = require("../middleware/authMiddleware");

// GET all orders (owner sees all, vendor sees only their orders)
router.get("/", protect(), async (req, res) => {
  try {
    let orders;
    if (req.user.role === "owner") {
      orders = await Order.find().sort({ createdAt: -1 });
    } else if (req.user.role === "vendor") {
      orders = await Order.find({ "items.vendor": req.user.role }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new order (from WordPress webhook)
router.post("/", async (req, res) => {
  const { id, status, total, currency, customer, items } = req.body;

  try {
    const exists = await Order.findOne({ orderId: id });
    if (exists) return res.status(400).json({ message: "Order already exists" });

    const newOrder = new Order({
      orderId: id,
      status,
      total,
      currency,
      customer,
      items,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved", order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
