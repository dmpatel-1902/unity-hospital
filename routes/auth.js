const router = require('express').Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const { sendOtpEmail, generateOtp } = require('../utils/mailer');

const OTP_VALID_MINUTES = 10;

// STEP 1: Register -> create unverified user + send OTP to email
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && existing.isVerified) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    if (existing && !existing.isVerified) {
      // User signed up before but never verified - update their details and resend OTP
      existing.name = name;
      existing.password = hash;
      await existing.save();
    } else {
      const user = new User({ name, email: normalizedEmail, password: hash, isVerified: false });
      await user.save();
    }

    const otp = generateOtp();
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });
    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'register',
      expiresAt: new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000)
    });

    // Try sending OTP email — if it fails, still register the user but report the email error
    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (mailErr) {
      console.error('OTP email send failed:', mailErr.message);
      return res.status(201).json({
        msg: 'Account created but we could not send the OTP email. Please use "Resend OTP" on the next page.',
        email: normalizedEmail,
        emailError: true
      });
    }

    res.status(201).json({ msg: 'OTP sent to your email. Please verify to complete registration.', email: normalizedEmail });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Something went wrong while registering. Please try again.' });
  }
});

// STEP 2: Verify OTP -> activate the account
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const record = await Otp.findOne({ email: normalizedEmail, purpose: 'register' }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== String(otp)) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
    }

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'No pending registration found for this email.' });
    }

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });

    res.json({ msg: 'Email verified successfully!', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('OTP verify error:', err.message);
    res.status(500).json({ error: 'Something went wrong while verifying. Please try again.' });
  }
});

// Resend OTP (registration step)
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found for this email. Please register first.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'This account is already verified. Please log in.' });
    }

    const otp = generateOtp();
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });
    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'register',
      expiresAt: new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000)
    });

    await sendOtpEmail(normalizedEmail, otp);

    res.json({ msg: 'A new OTP has been sent to your email.' });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).json({ error: 'Could not resend OTP. Please try again.' });
  }
});

// Login (blocked until email is verified)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email with the OTP before logging in.', needsVerification: true, email: user.email });
    }

    res.json({ msg: 'Login success', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Something went wrong while logging in. Please try again.' });
  }
});

module.exports = router;
