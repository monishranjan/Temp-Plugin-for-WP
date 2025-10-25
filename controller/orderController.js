const Order = require("../models/Order");
const sendOrderEmail = require("../utils/sendEmail");
const { generateOrderEmailHTML } = require("../utils/emailTemplates");
const axios = require("axios");

const WC_URL = "https://dloklz.com/wp-json/custom-api/v1/update-order-status";
const WC_KEY = process.env.CONSUMER_KEY;
const WC_SECRET = process.env.CONSUMER_SECRET;

/**
 * ✅ Create or update an order safely and sync with WooCommerce
 * @param {Object} orderData - Order payload
 * @param {Boolean} skipWCSync - prevent sending updates back to WooCommerce (useful for webhook triggers)
 */
async function createOrUpdateOrder(orderData, skipWCSync = false) {
  try {
    // 🧩 Upsert order using static method
    const order = await Order.upsertOrder(orderData);

    const isNew = orderData.type === "new_order" || orderData.type === "initial_sync";

    // ✉️ Send emails
    if (order.customer?.email) {
      const html = generateOrderEmailHTML(order.customer, order);
      const subject = isNew
        ? `Order Created #${order.orderId}`
        : `Order Update #${order.orderId}`;
      await sendOrderEmail(order.customer.email, subject, "", html);
      console.log(`📧 Email sent to ${order.customer.email} (${subject})`);
    }

    // ⚙️ Sync with WooCommerce unless skipped
    if (!skipWCSync) {
      try {
        const payload = {
          order_id: order.orderId,
          status: order.status,
          total: order.total,
          currency: order.currency,
          customer: order.customer,
          items: order.items,
        };

        await axios.post(WC_URL, payload, {
          auth: { username: WC_KEY, password: WC_SECRET },
        });

        console.log(`✅ WooCommerce Order #${order.orderId} synced: ${order.status}`);
      } catch (wcErr) {
        console.error(
          "❌ WooCommerce sync failed:",
          wcErr.response?.data || wcErr.message
        );
      }
    } else {
      console.log(`🔁 Skipping WooCommerce sync for Order #${order.orderId}`);
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
      return await Order.find({ "items.vendor_id": user.vendor_id }).sort({
        createdAt: -1,
      });
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
