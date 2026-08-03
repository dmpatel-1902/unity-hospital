const router = require('express').Router();
const Doctor = require('../models/Doctor');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: 1 });
    res.json(doctors);
  } catch (err) {
    console.error('Fetch doctors error:', err.message);
    res.status(500).json({ error: 'Could not fetch doctors' });
  }
});

// Add a new doctor
router.post('/add', async (req, res) => {
  try {
    const { name, specialization, qualification, contact, image } = req.body;

    if (!name || !specialization) {
      return res.status(400).json({ error: 'Name and specialization are required' });
    }

    const doctor = new Doctor({ name, specialization, qualification, contact, image });
    await doctor.save();
    res.status(201).json({ msg: 'Doctor added', doctor });
  } catch (err) {
    console.error('Add doctor error:', err.message);
    res.status(500).json({ error: 'Could not add doctor' });
  }
});

module.exports = router;
