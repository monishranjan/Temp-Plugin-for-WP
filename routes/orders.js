const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const protect = require("../middleware/authMiddleware");
const sendOrderEmail = require("../utils/sendEmail"); // EmailJS integration

// GET all orders (owner sees all, vendor sees only their orders)
router.get("/", protect(), async (req, res) => {
  try {
    let orders;
    if (req.user.role === "owner") {
      orders = await Order.find().sort({ createdAt: -1 });
    } else if (req.user.role === "vendor") {
      // Filter by vendor_id present in items
      orders = await Order.find({ "items.vendor_id": req.user.vendor_id }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new order or update existing order (from WordPress webhook)
router.post("/", async (req, res) => {
  const { id, status, total, currency, payment, customer, items } = req.body;

  try {
    let order = await Order.findOne({ orderId: id });

    // If order exists, update status and notify customer
    if (order) {
      const oldStatus = order.status;
      if (status !== oldStatus) {
        order.status = status;
        order.old_status = oldStatus;
        order.new_status = status;
        await order.save();

        if (customer?.email) {
          await sendOrderEmail(
            customer.email,
            "Order Status Updated",
            `Hi ${customer.name || "Customer"},\n\nYour order #${id} status has been updated from "${oldStatus}" to "${status}".`
          );
        }
      }

      return res.json({ message: "Order updated successfully", order });
    }

    // If new order
    const newOrder = new Order({
      orderId: id,
      status,
      total,
      currency,
      payment,
      customer,
      items,
      type: "new_order",
      new_status: status,
    });

    await newOrder.save();

    // Send email for new order
    if (customer?.email) {
      await sendOrderEmail(
        customer.email,
        "New Order Placed",
        `Hi ${customer.name || "Customer"},\n\nYour order #${id} has been successfully placed. We'll notify you when its status changes.`
      );
    }

    res.status(201).json({ message: "Order saved", order: newOrder });
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
