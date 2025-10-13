const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

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

  console.log(order.type === "new_order" ? "🆕 NEW ORDER RECEIVED" : order.type === "status_change" ? "🔄 ORDER STATUS CHANGED" : "📦 UNKNOWN ORDER EVENT");

  console.log("===========================================");
  console.log(`🆔 Order ID: ${order.id}`);
  console.log(`💰 Total: ${order.total} ${order.currency}`);
  console.log(`📦 Status: ${order.status}`);
  if (order.type === "status_change") {
    console.log(`🔁 Old Status: ${order.old_status}`);
    console.log(`➡️ New Status: ${order.new_status}`);
  }

  const customer = order.customer || {};
  console.log(`👤 Customer: ${customer.name || "N/A"} (${customer.email || "N/A"})`);

  console.log("🛒 Items:");
  (order.items || []).forEach((item, index) => {
    const vendor = item.vendor || "No Vendor Found";
    console.log(`  ${index + 1}. ${item.name} ×${item.quantity} — ₹${item.total} | Vendor: ${vendor}`);
  });
  console.log("===========================================\n");

  res.status(200).json({
    success: true,
    message: `Order ${order.id} processed successfully`,
    receivedAt: new Date().toISOString(),
    order: order,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test API running on port ${PORT}`);
});
