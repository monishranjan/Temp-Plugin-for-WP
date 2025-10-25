const express = require("express");
const router = express.Router();
const { createOrUpdateOrder } = require("../controller/orderController");

/**
 * POST /webhook/woocommerce
 * Handles WooCommerce webhook for order create/update
 */
router.post("/woocommerce", async (req, res) => {
  try {
    const order = req.body;

    console.log("📦 Received WooCommerce webhook:", order.id, order.status);

    const orderData = {
      orderId: order.id,
      status: order.status || "pending",
      total: order.total || 0,
      currency: order.currency || "INR",
      payment: order.payment_method_title || "N/A",
      customer: {
        name: `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim(),
        email: order.billing?.email || "",
        phone: order.billing?.phone || "",
        address: order.billing?.address_1 || "",
      },
      items: Array.isArray(order.line_items)
        ? order.line_items.map((item) => ({
            product_id: item.product_id || 0,
            name: item.name || "",
            quantity: item.quantity || 1,
            subtotal: item.subtotal || 0,
            total: item.total || 0,
            vendor: item.vendor || "N/A",
            vendor_id: item.vendor_id || null,
          }))
        : [],
      type: "status_change", // mapped from webhook_update
    };

    // 🔁 Skip WooCommerce sync for webhook triggers
    await createOrUpdateOrder(orderData, true);

    res.status(200).json({ message: "✅ Order processed successfully" });
  } catch (err) {
    console.error("❌ WooCommerce Webhook Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
