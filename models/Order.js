const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true },
    status: { type: String, required: true },
    total: { type: Number, required: true },
    currency: { type: String },
    payment: { type: String },

    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
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
        vendor: String,
        vendor_id: Number,
      },
    ],

    vendor_id: Number,
    vendor_name: String,

    type: { type: String, enum: ['new_order', 'status_change', 'initial_sync'], default: 'new_order' },
    old_status: { type: String, default: null },
    new_status: { type: String, default: null },

  },
  { timestamps: true }
);

// Auto-extract numeric vendor_id from vendor string
orderSchema.pre('save', function(next) {
  this.items.forEach(item => {
    if (!item.vendor_id && item.vendor) {
      const match = item.vendor.match(/ID:\s*(\d+)/);
      if (match) item.vendor_id = parseInt(match[1], 10);
    }
  });
  next();
});

// Index for faster lookup
orderSchema.index({ orderId: 1 }, { unique: true });

module.exports = mongoose.model("Order", orderSchema);
