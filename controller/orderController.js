const Order = require("../models/Order");
const sendOrderEmail = require("../utils/sendEmail");
const { generateOrderEmailHTML } = require("../utils/emailTemplates");
const axios = require("axios");

// WooCommerce custom API endpoint
const WC_URL = "https://dloklz.com/wp-json/custom-api/v1/update-order-status";
const WC_KEY = process.env.CONSUMER_KEY;
const WC_SECRET = process.env.CONSUMER_SECRET;

/**
 * ✅ Create or update an order safely and sync with WooCommerce
 * @param {Object} orderData - Order payload
 * @returns {Object} { order, isNew } - Order document and whether it was newly created
 */
async function createOrUpdateOrder(orderData) {
  try {
    // Check if order exists
    let order = await Order.findOne({ orderId: orderData.orderId });
    let isNew = false;

    if (!order) {
      // Create new order in Mongo
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
        order.type = "status_change";
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

    // 🔄 Sync with WooCommerce via custom API
    try {
      await axios.post(
        WC_URL,
        { order_id: order.orderId, status: order.status },
        {
          auth: {
            username: WC_KEY,
            password: WC_SECRET,
          },
        }
      );
      console.log(`✅ WooCommerce Order #${order.orderId} status synced: ${order.status}`);
    } catch (wcErr) {
      console.error("❌ WooCommerce sync failed:", wcErr.response?.data || wcErr.message);
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
