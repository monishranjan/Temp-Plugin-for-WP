const express = require("express");
const app = express();
const PORT = 5000;

// Parse JSON requests
app.use(express.json());

// Route for WooCommerce orders
app.post("/orders", (req, res) => {
  console.log("📦 New Order Received:", req.body);

  // Send back a response
  res.json({
    success: true,
    message: "Order received successfully!",
    order: req.body
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test API running at http://localhost:${PORT}/orders`);
});
