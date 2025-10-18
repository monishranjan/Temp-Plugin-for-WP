const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const protect = require("../middleware/authMiddleware");
const sendOrderEmail = require("../utils/sendEmail"); // Brevo API version

// ==========================
// Helper: Generate HTML Email
// ==========================
const generateOrderEmailHTML = (customer, order) => {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.subtotal}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.total}</td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
      <h2 style="color: #4CAF50;">Hi ${customer.name || "Customer"},</h2>
      <p>Thank you for your order with <strong>Dloklz Store</strong>! 🎉</p>
      <p><strong>Order ID:</strong> #${order.orderId}</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd;">Item</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Grand Total:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>₹${order.total}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top: 20px;">We’ll notify you when your order status changes.</p>
      <p>Warm regards,<br/><strong>Dloklz Team</strong></p>
    </div>
  `;
};

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
            <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto;">
              <h2>Hi ${customer.name || "Customer"},</h2>
              <p>Your order <strong>#${id}</strong> status has been updated:</p>
              <p><strong>From:</strong> ${oldStatus}<br/><strong>To:</strong> ${status}</p>
              ${generateOrderEmailHTML(customer, order)}
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
        const html = generateOrderEmailHTML(customer, newOrder);
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
