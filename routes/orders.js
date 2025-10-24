const express = require("express");
const router = express.Router();
const { createOrUpdateOrder, getOrders } = require("../controller/orderController");
const protect = require("../middleware/authMiddleware");

/**
 * ===========================
 * GET all orders (owner/vendor)
 * ===========================
 */
router.get("/", protect(), async (req, res) => {
  try {
    const orders = await getOrders(req.user);
    res.json(orders);
  } catch (err) {
    console.error("❌ GET /orders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ============================================
 * POST a new or updated order (WooCommerce Webhook)
 * ============================================
 */
router.post("/", async (req, res) => {
  try {
    // WooCommerce webhook payload can contain id or order_number
    const { id, order_number, status } = req.body;

    // Determine the correct orderId
    const finalOrderId = id || order_number;
    if (!finalOrderId) {
      return res.status(400).json({ message: "Missing orderId in request body" });
    }

    // Prepare sanitized order data
    const orderData = {
      ...req.body,
      orderId: finalOrderId,
      woo_order_id: id || null, // WooCommerce internal ID for syncing
      status: status || "pending", // default status if missing
    };

    // Create or update the order safely (no duplicates)
    const { order, isNew } = await createOrUpdateOrder(orderData);

    console.log(`🧩 Order processed (Created/Updated): #${finalOrderId}`);

    res.status(201).json({
      message: isNew ? "New order created" : "Order updated successfully",
      order,
    });
  } catch (err) {
    console.error("❌ POST /orders error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
