require("dotenv").config();
const sendOrderEmail = require("./sendEmail"); // Brevo API version

console.log("🔍 Using BREVO_API_KEY:", process.env.BREVO_API_KEY);
console.log("🔍 Using EMAIL_FROM:", process.env.EMAIL_FROM);

const testEmail = async () => {
  try {
    await sendOrderEmail(
      "monishranjan9@gmail.com", // recipient email
      "Brevo API Test",
      "This is a plain text fallback for testing Brevo API email.",
      `
        <div style="font-family: Arial, sans-serif; color:#333;">
          <h2>Hi Monish,</h2>
          <p>This is a test email sent using Brevo API.</p>
          <p>✅ Your setup is working!</p>
        </div>
      `
    );

    console.log("✅ Test email sent successfully!");
  } catch (err) {
    console.error("❌ Test email failed:", err.response?.data || err.message);
  }
};

testEmail();
