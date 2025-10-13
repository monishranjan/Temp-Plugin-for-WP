// server.js
const express = require("express");
const cors = require("cors");
const app = express();

// ✅ Use Render's assigned port or local 5000
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // handle large JSON bodies if needed

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({
    message: "WooCommerce Test API is running ✅",
    status: "OK",
  });
});

// ✅ Route for WooCommerce orders
app.post("/orders", (req, res) => {
  const order = req.body;

  // Defensive check
  if (!order || !order.order_id) {
    console.log("⚠️ Received invalid order payload:", req.body);
    return res.status(400).json({ success: false, message: "Invalid order data" });
  }

  // 🟢 Differentiate between new orders and status changes
  if (order.type === "new_order") {
    console.log("🆕 NEW ORDER RECEIVED");
  } else if (order.type === "status_change") {
    console.log("🔄 ORDER STATUS CHANGED");
  } else {
    console.log("📦 UNKNOWN ORDER EVENT (missing or unexpected type)");
  }

  // 🧾 Pretty log order summary
  console.log("-------------------------------------------");
  console.log(`🆔 Order ID: ${order.order_id}`);
  console.log(`💰 Total: ${order.total} ${order.currency}`);
  console.log(`📦 Status: ${order.status}`);
  if (order.type === "status_change") {
    console.log(`🔁 Old Status: ${order.old_status}`);
    console.log(`➡️ New Status: ${order.new_status}`);
  }
  console.log(`👤 Customer: ${order.customer?.name || "N/A"} (${order.customer?.email || "N/A"})`);
  console.log("🛒 Items:");
  order.items?.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} ×${item.quantity} — ₹${item.total}`);
  });
  console.log("-------------------------------------------\n");

  // Respond to WooCommerce
  res.status(200).json({
    success: true,
    message: `Order ${order.order_id} processed successfully`,
    receivedAt: new Date().toISOString(),
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Test API running on port ${PORT}`);
});
