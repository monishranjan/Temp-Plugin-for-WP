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
      enum: ["new_order", "status_change", "initial_sync", "webhook_update"],
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
 * Handles old_status correctly on updates
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

  // Set old_status only on updates, not on creation
  if (!this.isNew && this.isModified("status") && !this.old_status) {
    this.old_status = this.get("status");
  }

  next();
});

/**
 * 🔍 Static method: upsertOrder
 * Safely updates existing orders or creates new ones
 */
orderSchema.statics.upsertOrder = async function (orderData) {
  const { orderId, type, status } = orderData;
  if (!orderId) throw new Error("orderId is required");

  let order = await this.findOne({ orderId });
  if (order) {
    // Update only necessary fields
    order.status = status || order.status;
    order.old_status = order.old_status || order.status;
    order.new_status = status || order.new_status;
    order.type = type || order.type;
    order.total = orderData.total ?? order.total;
    order.currency = orderData.currency ?? order.currency;
    order.payment = orderData.payment ?? order.payment;
    order.customer = orderData.customer ?? order.customer;
    order.items = orderData.items ?? order.items;

    await order.save();
  } else {
    order = await this.create(orderData);
  }

  return order;
};

module.exports = mongoose.model("Order", orderSchema);
