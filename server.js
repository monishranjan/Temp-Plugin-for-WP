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
  console.log("📦 New Order Received:");
  console.log(JSON.stringify(req.body, null, 2)); // Pretty log

  // Example: save order data to database later (for now, just confirm receipt)
  res.status(200).json({
    success: true,
    message: "Order received successfully!",
    receivedAt: new Date().toISOString(),
    order: req.body,
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Test API running on port ${PORT}`);
});
