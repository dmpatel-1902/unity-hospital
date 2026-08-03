const router = require('express').Router();
const Contact = require('../models/Contact');

// Save a contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, number, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const contact = new Contact({ name, email, phone: phone || number, subject, message });
    await contact.save();
    res.status(201).json({ msg: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact save error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
