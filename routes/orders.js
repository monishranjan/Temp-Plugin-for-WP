const express = require("express");
const router = express.Router();
const { createOrder, getOrders } = require("../controller/orderController");
const protect = require("../middleware/authMiddleware");

// GET all orders (owner/vendor)
router.get("/", protect(), async (req, res) => {
  try {
    const orders = await getOrders(req.user);
    res.json(orders);
  } catch (err) {
    console.error("❌ GET /orders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new order (webhook from WooCommerce)
router.post("/", async (req, res) => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
