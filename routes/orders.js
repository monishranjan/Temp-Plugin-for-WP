const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const protect = require("../middleware/authMiddleware");
const sendOrderEmail = require("../utils/sendOrderEmail"); // Brevo API version

// =======================================================
// GET all orders (Owner: all | Vendor: only their orders)
// =======================================================
router.get("/", protect(), async (req, res) => {
  try {
    let orders = [];

    if (req.user.role === "owner") {
      orders = await Order.find().sort({ createdAt: -1 });
    } else if (req.user.role === "vendor") {
      orders = await Order.find({ "items.vendor_id": req.user.vendor_id }).sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (err) {
    console.error("❌ GET /orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================================================
// POST a new order or update existing order (Webhook)
// =======================================================
router.post("/", async (req, res) => {
  const { id, status, total, currency, payment, customer, items } = req.body;

  try {
    let order = await Order.findOne({ orderId: id });

    // ======================================
    // If existing order → update its status
    // ======================================
    if (order) {
      const oldStatus = order.status;

      if (status === oldStatus) {
        return res.json({ message: "No status change", order });
      }

      order.status = status;
      order.old_status = oldStatus;
      order.new_status = status;
      await order.save();

      console.log(`🔄 Order #${id} status updated: ${oldStatus} → ${status}`);

      // Send status update email
      if (customer?.email) {
        try {
          const html = `
            <div style="font-family: Arial, sans-serif; color:#333;">
              <h2>Hi ${customer.name || "Customer"},</h2>
              <p>Your order <strong>#${id}</strong> status has been updated:</p>
              <p><strong>From:</strong> ${oldStatus}<br/><strong>To:</strong> ${status}</p>
              <p>Thank you for shopping with <strong>Cafe HideIn</strong>!</p>
            </div>
          `;

          await sendOrderEmail(customer.email, "Order Status Updated", "", html);
          console.log(`📧 Status update email sent to ${customer.email}`);
        } catch (emailErr) {
          console.error("❌ Failed to send status update email:", emailErr.message);
        }
      }

      return res.json({ message: "Order updated successfully", order });
    }

    // ======================================
    // If new order → create a new record
    // ======================================
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
    console.log(`🆕 New order created: #${id}`);

    // Send new order confirmation email
    if (customer?.email) {
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; color:#333;">
            <h2>Hi ${customer.name || "Customer"},</h2>
            <p>Thank you for your order with <strong>Cafe HideIn</strong>! 🎉</p>
            <p><strong>Order ID:</strong> #${id}</p>
            <p><strong>Total:</strong> ₹${total} ${currency}</p>
            <p>We’ll notify you when your order status changes.</p>
            <br/>
            <p>Warm regards,<br/><strong>Cafe HideIn Team</strong></p>
          </div>
        `;

        await sendOrderEmail(customer.email, "New Order Placed", "", html);
        console.log(`📧 Order confirmation email sent to ${customer.email}`);
      } catch (emailErr) {
        console.error("❌ Failed to send new order email:", emailErr.message);
      }
    }

    res.status(201).json({ message: "Order saved", order: newOrder });
  } catch (err) {
    console.error("❌ POST /orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
