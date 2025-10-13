const express = require("express");
const cors = require("cors");
const app = express();

// Use Render's assigned port or local 5000
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // handle large JSON bodies

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "WooCommerce Test API is running ✅",
    status: "OK",
  });
});

// Orders endpoint
app.post("/orders", (req, res) => {
  const order = req.body;

  if (!order || !order.id) {
    console.log("⚠️ Received invalid order payload:", req.body);
    return res.status(400).json({ success: false, message: "Invalid order data" });
  }

  // Identify event type
  if (order.type === "new_order") {
    console.log("🆕 NEW ORDER RECEIVED");
  } else if (order.type === "status_change") {
    console.log("🔄 ORDER STATUS CHANGED");
  } else {
    console.log("📦 UNKNOWN ORDER EVENT");
  }

  // Log order summary
  console.log("===========================================");
  console.log(`🆔 Order ID: ${order.id}`);
  console.log(`💰 Total: ${order.total} ${order.currency}`);
  console.log(`📦 Status: ${order.status}`);
  if (order.type === "status_change") {
    console.log(`🔁 Old Status: ${order.old_status}`);
    console.log(`➡️ New Status: ${order.new_status}`);
  }

  // Customer info
  const customer = order.customer || {};
  console.log(`👤 Customer: ${customer.name || "N/A"} (${customer.email || "N/A"})`);

  // Items info
  console.log("🛒 Items:");
  (order.items || []).forEach((item, index) => {
    const vendor = item.vendor || "N/A";
    const variation = item.variation || "N/A";
    console.log(
      `  ${index + 1}. ${item.name} ×${item.quantity} — ₹${item.total} | Vendor: ${vendor} | Variation: ${variation}`
    );
  });

  console.log("===========================================\n");

  // Respond
  res.status(200).json({
    success: true,
    message: `Order ${order.id} processed successfully`,
    receivedAt: new Date().toISOString(),
    order: order,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test API running on port ${PORT}`);
});
