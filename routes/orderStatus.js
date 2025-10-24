const express = require("express");
const router = express.Router();
const { updateOrderStatus } = require("../controller/orderController");
const protect = require("../middleware/authMiddleware");

/**
 * ======================================
 * PATCH /orderStatus/:id
 * → Update order status in MongoDB (and WooCommerce via backend if needed)
 * ======================================
 */
router.patch("/:id", protect(), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validate required data
    if (!status) {
      return res.status(400).json({ message: "Missing 'status' in request body" });
    }

    // Update the order
    const updatedOrder = await updateOrderStatus(orderId, status);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`✅ Order #${orderId} updated to status: ${status}`);

    res.status(200).json({
      message: `Order #${orderId} status updated successfully`,
      order: updatedOrder,
    });
  } catch (err) {
    console.error(`❌ PATCH /orderStatus/${req.params.id} error:`, err.message);
    res.status(500).json({
      message: "Failed to update order status",
      error: err.message,
    });
  }
});

module.exports = router;
