const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true }, // WooCommerce order ID
    status: { type: String, required: true }, // e.g. processing, completed, cancelled
    total: { type: Number, required: true },
    currency: { type: String },
    payment: { type: String }, // e.g. COD, PayPal, Razorpay

    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },

    items: [
      {
        product_id: Number,
        name: String,
        quantity: Number,
        subtotal: Number,
        total: Number,
        vendor: String, // vendor name like “ID: 45 | John’s Store”
        vendor_id: Number, // extracted numeric vendor ID (we’ll parse this)
      },
    ],

    // Main vendor reference (optional — if you want one vendor per order)
    vendor_id: { type: Number },
    vendor_name: { type: String },

    // Order tracking info
    type: { type: String, enum: ['new_order', 'status_change', 'initial_sync'], default: 'new_order' },
    old_status: { type: String, default: null },
    new_status: { type: String, default: null },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
