const Order = require("../models/Order");
const sendOrderEmail = require("../utils/sendEmail");
const { generateOrderEmailHTML } = require("../utils/emailTemplate");

/**
 * Create a new order and send confirmation email
 */
async function createOrder(orderData) {
  try {
    const order = new Order({
      ...orderData,
      type: "new_order",
      new_status: orderData.status,
    });
    await order.save();

    console.log(`🆕 Order #${order.orderId} created successfully.`);

    // Send confirmation email
    if (order.customer?.email) {
      const html = generateOrderEmailHTML(order.customer, order);
      await sendOrderEmail(order.customer.email, "New Order Placed", "", html);
      console.log(`📧 Confirmation email sent to ${order.customer.email}`);
    }

    return order;
  } catch (err) {
    console.error("❌ Error creating order:", err);
    throw err;
  }
}

/**
 * Update order status and send email notification
 */
async function updateOrderStatus(orderId, newStatus) {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error("Order not found");

    const oldStatus = order.status;
    if (oldStatus === newStatus) return order; // No change

    order.status = newStatus;
    order.old_status = oldStatus;
    order.new_status = newStatus;
    await order.save();

    console.log(`🔄 Order #${orderId} status updated: ${oldStatus} → ${newStatus}`);

    // Send status update email
    if (order.customer?.email) {
      const html = generateOrderEmailHTML(order.customer, order);
      await sendOrderEmail(order.customer.email, "Order Status Updated", "", html);
      console.log(`📧 Status update email sent to ${order.customer.email}`);
    }

    return order;
  } catch (err) {
    console.error(`❌ Failed to update order #${orderId}:`, err.message);
    throw err;
  }
}

/**
 * Get orders (Owner: all, Vendor: their own)
 */
async function getOrders(user) {
  if (user.role === "owner") {
    return await Order.find().sort({ createdAt: -1 });
  } else if (user.role === "vendor") {
    return await Order.find({ "items.vendor_id": user.vendor_id }).sort({ createdAt: -1 });
  } else {
    return [];
  }
}

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrders,
};
