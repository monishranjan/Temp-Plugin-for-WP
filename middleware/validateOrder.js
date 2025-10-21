// middleware/validateOrder.js

const validateOrder = (req, res, next) => {
  const { id, status, total, currency, payment, customer, items } = req.body;

  if (!id || !status || !total || !currency || !payment || !customer || !items) {
    return res.status(400).json({ message: "Missing required order fields" });
  }

  if (!customer.name || !customer.email || !customer.phone || !customer.address) {
    return res.status(400).json({ message: "Incomplete customer information" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order items cannot be empty" });
  }

  next();
};

module.exports = validateOrder;
