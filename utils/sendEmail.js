const axios = require("axios");

/**
 * Send an email using Brevo Transactional Email API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - Optional HTML content
 */
const sendOrderEmail = async (to, subject, text, html = null) => {
  console.log(`📧 Sending email to ${to} via Brevo API | Subject: "${subject}"`);

  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) throw new Error("Missing BREVO_API_KEY in environment variables");

    const fromEmail = process.env.EMAIL_FROM || "9984de001@smtp-brevo.com";

    const payload = {
      sender: { name: "Dloklz Store", email: fromEmail },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html || `<p>${text.replace(/\n/g, "<br>")}</p>`,
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully via Brevo API", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to send email via Brevo API:", error.response?.data || error.message);
    throw new Error("Email sending failed via Brevo API");
  }
};

module.exports = sendOrderEmail;
