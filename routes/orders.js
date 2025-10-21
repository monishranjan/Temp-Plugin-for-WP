const express = require("express");
const router = express.Router();
const { createOrder, getOrders } = require("../controller/orderController");
const protect = require("../middleware/authMiddleware");

// ===========================
// GET all orders (owner/vendor)
// ===========================
router.get("/", protect(), async (req, res) => {
  try {
    const orders = await getOrders(req.user);
    res.json(orders);
  } catch (err) {
    console.error("❌ GET /orders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// POST a new order (webhook from WooCommerce)
// ============================================
router.post("/", async (req, res) => {
  try {
    const { id, orderId } = req.body;

    // Determine final orderId
    const finalOrderId = id || orderId;
    if (!finalOrderId) {
      return res
        .status(400)
        .json({ message: "Missing orderId in request body" });
    }

    // Add orderId to body if missing
    const orderData = { ...req.body, orderId: finalOrderId };

    // Create or update order
    const order = await createOrder(orderData);
    console.log(`🆕/🔄 Order processed: #${finalOrderId}`);

    res.status(201).json({ message: "Order processed successfully", order });
  } catch (err) {
    console.error("❌ POST /orders error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
