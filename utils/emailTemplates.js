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

module.exports = { generateOrderEmailHTML };
