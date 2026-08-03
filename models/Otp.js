const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  purpose: { type: String, default: 'register' }, // register | login | reset
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// Automatically delete expired OTP documents from MongoDB
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', OtpSchema);
