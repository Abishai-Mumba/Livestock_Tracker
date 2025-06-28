const nodemailer = require("nodemailer");



// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Livestock Tracker Server" <${process.env.SMTP_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (err) {
    console.error("Error while sending email:", err);
    return null;
  }
};

const testConnection = async() => {
    try {
        const response = await transporter.verify();
        console.log("Server is ready to take our messages"); 
        return response;
    } catch (err) {
        console.error(err.message);
        return null;
    }
};

module.exports = { sendEmail, testConnection };