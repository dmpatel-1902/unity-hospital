const nodemailer = require('nodemailer');

// Reads SMTP settings from .env
// For Gmail: use an "App Password" (not your normal Gmail password).
// See README.md for step-by-step setup instructions.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendOtpEmail(toEmail, otp) {
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Unity Hospital" <${fromAddress}>`,
    to: toEmail,
    subject: 'Your Unity Hospital verification code',
    text: `Your OTP is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color:#2ba1c9;">Unity Hospital</h2>
        <p>Use the code below to verify your email address:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background:#f5f5f5; padding: 16px; text-align:center; border-radius: 6px;">${otp}</div>
        <p style="margin-top: 16px; color:#777;">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
}

module.exports = { sendOtpEmail, generateOtp, transporter };
