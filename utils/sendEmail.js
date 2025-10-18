const nodemailer = require("nodemailer");

const sendOrderEmail = async (to, subject, text, html = null) => {
  console.log(`📧 Preparing to send email to ${to} with subject "${subject}"`);

  try {
    // Load port from environment (defaulting to Brevo standard 587)
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = port === 465; // SSL only for 465

    // Create reusable transporter object using Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER, // Your Brevo SMTP login (email)
        pass: process.env.SMTP_PASS, // Your Brevo SMTP key
      },
      tls: {
        rejectUnauthorized: false, // ignore local cert issues (useful for dev)
      },
    });

    // Verify connection configuration
    await transporter.verify();
    console.log("✅ SMTP transporter verified and ready!");

    // Define email options
    const mailOptions = {
      from: `"Dloklz Store" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      ...(html ? { html } : {}), // adds html only if provided
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);

    if (error.response) {
      console.error("SMTP Response:", error.response);
    }

    if (error.code === "EAUTH") {
      console.error("⚠️ Authentication failed — please check your Brevo SMTP key and user.");
    }

    if (error.code === "ETIMEDOUT") {
      console.error("⚠️ Connection timed out — your server might be blocking port 587 or 465.");
    }

    throw error;
  }
};

module.exports = sendOrderEmail;
