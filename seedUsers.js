require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./utils/db");

const seedUsers = async () => {
  try {
    await connectDB();

    // Delete existing users
    await User.deleteMany();

    // Create sample users
    const users = [
      { name: "Admin Owner", email: "owner@dloklz.com", password: "123456", role: "owner" },
      { name: "Vendor One", email: "vendor1@dloklz.com", password: "123456", role: "vendor" },
      { name: "Vendor Two", email: "vendor2@dloklz.com", password: "123456", role: "vendor" },
    ];

    for (const u of users) {
      const user = new User(u);
      await user.save();
    }

    console.log("✅ Users seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedUsers();
