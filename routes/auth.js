const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ✅ POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔍 Validate request
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 🔍 Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔑 Check password using bcrypt (or custom method)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔐 Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Send back token and role
    return res.status(200).json({ token, role: user.role });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Server error, please try again later." });
  }
});

module.exports = router;
