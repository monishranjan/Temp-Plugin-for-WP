const nodemailer = require("nodemailer");

const sendOrderEmail = async (to, subject, text, html = null) => {
  try {
    // Configure Brevo SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,       // smtp-relay.brevo.com
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,                     // false for 587
      auth: {
        user: process.env.SMTP_USER,     // your Brevo email
        pass: process.env.SMTP_PASS,     // your SMTP key
      },
    });

    // Prepare email options
    const mailOptions = {
      from: `"Dloklz Store" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      ...(html && { html }), // if html is provided, include it
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = sendOrderEmail;
