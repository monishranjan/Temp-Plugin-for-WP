const express = require("express");
const router = express.Router();
const { updateOrderStatus } = require("../controller/orderController");
const protect = require("../middleware/authMiddleware");

// PATCH /orderStatus/:id
router.patch("/:id", protect(), async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Missing status" });

  try {
    const order = await updateOrderStatus(orderId, status);
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
