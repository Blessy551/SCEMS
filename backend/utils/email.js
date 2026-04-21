const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendEmail = async (to, subject, htmlBody, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail({
        from: `"SCEMS VNRVJIET" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlBody
      });
      return true;
    } catch (err) {
      console.error(`Email attempt ${attempt} failed:`, err.message);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
      }
    }
  }
  return false;
};

module.exports = { sendEmail };
