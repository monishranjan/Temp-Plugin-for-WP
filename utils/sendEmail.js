const axios = require("axios");

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

async function sendOrderEmail(to, subject, message) {
  if (!to) return console.log("⚠️ No recipient email provided, skipping.");

  try {
    const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        to_email: to,
        subject,
        message,
      },
    });

    console.log(`✅ Email sent to ${to}: ${response.status}`);
  } catch (err) {
    console.error("❌ EmailJS send error:", err.response?.data || err.message);
  }
}

module.exports = sendOrderEmail;
