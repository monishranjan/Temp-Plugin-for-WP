const Order = require("../models/Order");
const sendOrderEmail = require("../utils/sendEmail");
const { generateOrderEmailHTML } = require("../utils/emailTemplates");

/**
 * ✅ Create or update an order safely
 * @param {Object} orderData - Order payload
 * @returns {Object} { order, isNew } - Order document and whether it was newly created
 */
async function createOrUpdateOrder(orderData) {
  try {
    // Check if order already exists
    let order = await Order.findOne({ orderId: orderData.orderId });
    let isNew = false;

    if (!order) {
      // Create new order
      order = new Order({
        ...orderData,
        type: "new_order",
        status: orderData.status || "pending",
        new_status: orderData.status || "pending",
      });
      await order.save();
      isNew = true;

      console.log(`🆕 Order #${order.orderId} created successfully.`);

      // Send "Order Created" email
      if (order.customer?.email) {
        const html = generateOrderEmailHTML(order.customer, order);
        const subject = `Order Created #${order.orderId}`;
        await sendOrderEmail(order.customer.email, subject, "", html);
        console.log(`📧 Confirmation email sent to ${order.customer.email}`);
      }
    } else {
      // Update existing order if status has changed
      const oldStatus = order.status;
      const newStatus = orderData.status || oldStatus;

      if (oldStatus !== newStatus) {
        order.status = newStatus;
        order.old_status = oldStatus;
        order.new_status = newStatus;
        order.type = "status_update";
        await order.save();

        console.log(`🔄 Order #${order.orderId} status updated: ${oldStatus} → ${newStatus}`);

        // Send "Order Update" email
        if (order.customer?.email) {
          const html = generateOrderEmailHTML(order.customer, order);
          const subject = `Order Update #${order.orderId}`;
          await sendOrderEmail(order.customer.email, subject, "", html);
          console.log(`📧 Status update email sent to ${order.customer.email}`);
        }
      } else {
        console.log(`ℹ️ Order #${order.orderId} already has status '${oldStatus}'. No update sent.`);
      }
    }

    return { order, isNew };
  } catch (err) {
    console.error("❌ Error creating/updating order:", err);
    throw err;
  }
}

/**
 * ✅ Fetch orders (owner sees all, vendor sees only their own)
 */
async function getOrders(user) {
  try {
    if (user.role === "owner") {
      return await Order.find().sort({ createdAt: -1 });
    } else if (user.role === "vendor") {
      return await Order.find({ "items.vendor_id": user.vendor_id }).sort({ createdAt: -1 });
    } else {
      return [];
    }
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    throw err;
  }
}

module.exports = {
  createOrUpdateOrder,
  getOrders,
};
