require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");

// Routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
connectDB();

// ✅ Fix CORS (handles OPTIONS preflight too)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // frontend URL
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ message: "DLoklz API running ✅" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 DLoklz API running on port ${PORT}`);
});
