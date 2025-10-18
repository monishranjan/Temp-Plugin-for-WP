const nodemailer = require("nodemailer");

const sendOrderEmail = async (to, subject, text, html = null) => {
  console.log(`📧 Attempting to send email to ${to} | Subject: "${subject}"`);

  try {
    // Ensure all required env variables exist
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("Missing SMTP credentials in environment variables");
    }

    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = port === 465; // true for 465, false for others (TLS)

    // Create reusable transporter object using SMTP (e.g., Brevo / Gmail / etc.)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // useful for local / testing
      },
    });

    // Verify connection only in development mode (to save time in prod)
    if (process.env.NODE_ENV !== "production") {
      try {
        await transporter.verify();
        console.log("✅ SMTP transporter verified successfully");
      } catch (verifyErr) {
        console.warn("⚠️ SMTP verification failed (continuing anyway):", verifyErr.message);
      }
    }

    // Define email content
    const mailOptions = {
      from: `"Dloklz Store" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text.replace(/\n/g, "<br>")}</p>`, // fallback HTML
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} | Message ID: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);

    // Handle specific common errors for clarity
    switch (error.code) {
      case "EAUTH":
        console.error("⚠️ Authentication failed — check your SMTP_USER and SMTP_PASS.");
        break;
      case "ECONNECTION":
        console.error("⚠️ Could not connect to SMTP server. Check host/port or firewall rules.");
        break;
      case "ETIMEDOUT":
        console.error("⚠️ Connection timed out — verify network or try port 587/465.");
        break;
      default:
        console.error("⚠️ Unknown email error:", error);
    }

    // Don't crash the app — just log and rethrow
    throw new Error("Email sending failed");
  }
};

module.exports = sendOrderEmail;
