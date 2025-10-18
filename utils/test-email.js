require("dotenv").config();
const sendOrderEmail = require("./sendEmail");

console.log("🔍 Using SMTP_USER:", process.env.SMTP_USER);
console.log("🔍 Using SMTP_HOST:", process.env.SMTP_HOST);

sendOrderEmail("monishranjan9@gmail.com", "Brevo SMTP Test", "Testing email from Brevo SMTP!")
  .then(() => console.log("✅ Test complete"))
  .catch((err) => console.error("❌ Test failed:", err));
