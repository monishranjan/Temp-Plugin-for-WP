const sendOrderEmail = require('./utils/sendEmail');

async function createOrder(orderData) {
  const order = new Order(orderData);
  await order.save();

  const message = `
    Hi ${order.customer.name},

    Your order #${order.orderId} has been placed successfully!
    Status: ${order.status}
    Total: ₹${order.total}
    Payment Method: ${order.payment}

    Thank you for shopping with us!
  `;

  await sendOrderEmail(order.customer.email, "New Order Confirmation", message);
}
