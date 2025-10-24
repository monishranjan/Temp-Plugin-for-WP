/**
 * ✅ Middleware to validate incoming order creation requests
 */
const validateOrder = (req, res, next) => {
  try {
    const { id, status, total, currency, payment, customer, items } = req.body;

    // Basic field checks
    if (!id) return res.status(400).json({ message: "Missing 'id' field (orderId)" });
    if (!status) return res.status(400).json({ message: "Missing 'status' field" });
    if (total == null) return res.status(400).json({ message: "Missing 'total' field" });
    if (!currency) return res.status(400).json({ message: "Missing 'currency' field" });
    if (!payment) return res.status(400).json({ message: "Missing 'payment' field" });
    if (!customer) return res.status(400).json({ message: "Missing 'customer' object" });
    if (!items) return res.status(400).json({ message: "Missing 'items' array" });

    // Customer info check
    const requiredCustomerFields = ["name", "email", "phone", "address"];
    const missingCustomerFields = requiredCustomerFields.filter(
      (field) => !customer[field]
    );
    if (missingCustomerFields.length > 0) {
      return res.status(400).json({
        message: `Incomplete customer information: missing ${missingCustomerFields.join(", ")}`,
      });
    }

    // Items validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items cannot be empty" });
    }

    // Check each item for essential fields (optional but recommended)
    for (const [i, item] of items.entries()) {
      if (!item.name || !item.price || !item.quantity) {
        return res.status(400).json({
          message: `Invalid item at index ${i}: missing 'name', 'price', or 'quantity'`,
        });
      }
    }

    next();
  } catch (err) {
    console.error("❌ Order validation error:", err);
    res.status(500).json({ message: "Internal validation error" });
  }
};

module.exports = validateOrder;
