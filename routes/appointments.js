const router = require('express').Router();
const Appointment = require('../models/Appointment');

// Book a new appointment
router.post('/book', async (req, res) => {
  try {
    const { patientName, name, email, phone, number, subject, department, Department, doctorName, date, time, Time } = req.body;

    const finalName = patientName || name;
    const finalDate = date;
    const finalTime = time || Time;

    if (!finalName || !email || !finalDate || !finalTime) {
      return res.status(400).json({ error: 'Name, email, date and time are required' });
    }

    const appointment = new Appointment({
      patientName: finalName,
      email,
      phone: phone || number,
      subject,
      department: department || Department,
      doctorName: doctorName || department || Department,
      date: finalDate,
      time: finalTime
    });

    await appointment.save();
    res.status(201).json({ msg: 'Appointment booked successfully', appointment });
  } catch (err) {
    console.error('Book appointment error:', err.message);
    res.status(500).json({ error: 'Something went wrong while booking. Please try again.' });
  }
});

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const all = await Appointment.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    console.error('Fetch appointments error:', err.message);
    res.status(500).json({ error: 'Could not fetch appointments' });
  }
});

module.exports = router;
