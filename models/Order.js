const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true, index: true }, // Unique WooCommerce Order ID
    status: { type: String, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    payment: { type: String },

    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
    },

    items: [
      {
        product_id: { type: Number, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        subtotal: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        vendor: { type: String },
        vendor_id: { type: Number },
      },
    ],

    vendor_id: { type: Number },
    vendor_name: { type: String },

    type: {
      type: String,
      enum: ["new_order", "status_change", "initial_sync"],
      default: "new_order",
    },
    old_status: { type: String, default: null },
    new_status: { type: String, default: null },
  },
  { timestamps: true }
);

/**
 * 🧠 Pre-save hook
 * Automatically extract vendor_id from vendor string if missing
 */
orderSchema.pre("save", function (next) {
  if (Array.isArray(this.items)) {
    this.items.forEach((item) => {
      if (!item.vendor_id && item.vendor) {
        const match = item.vendor.match(/ID:\s*(\d+)/);
        if (match) item.vendor_id = parseInt(match[1], 10);
      }
    });
  }

  // Automatically fill old_status on first update
  if (this.isModified("status") && !this.old_status) {
    this.old_status = this.status;
  }

  next();
});

/**
 * 🔍 Static method: upsertOrder
 * Prevents duplicate orders on updates
 */
orderSchema.statics.upsertOrder = async function (orderData) {
  const { orderId } = orderData;
  if (!orderId) throw new Error("orderId is required");

  let order = await this.findOne({ orderId });
  if (order) {
    // Update existing order instead of creating a new one
    Object.assign(order, orderData);
    await order.save();
  } else {
    order = await this.create(orderData);
  }
  return order;
};

module.exports = mongoose.model("Order", orderSchema);
