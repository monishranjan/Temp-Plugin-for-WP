const dotenv = require("dotenv");
const twilio = require("twilio");

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendTestSMS() {
  try {
    const message = await client.messages.create({
      body: "✅ Test SMS from dloklz-api (Twilio integration successful!)",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: "+91XXXXXXXXXX" // replace with your number
    });

    console.log("Message sent successfully!");
    console.log("SID:", message.sid);
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
  }
}

sendTestSMS();
