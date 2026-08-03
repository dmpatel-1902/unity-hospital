const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend (all the HTML/CSS/JS/images) as static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB connection error:', err.message));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/contact', require('./routes/contact'));

// ⚠️ TEMPORARY: one-time seed route — remove after seeding doctors
app.get('/api/run-seed', async (req, res) => {
  try {
    const Doctor = require('./models/Doctor');
    const doctors = [
      { name: 'Dr. Harshil Patel', specialization: 'Child care', qualification: 'Consultant', image: 'assets/img/team/1.jpg' },
      { name: 'Dr. Sahil Achhava', specialization: 'Neurology', qualification: 'MBBS', image: 'assets/img/team/2.jpg' },
      { name: 'Dr. Dhruv Shah', specialization: 'General Surgery', qualification: 'MBBS, MS, DNB', image: 'assets/img/team/3.jpg' },
      { name: 'Dr. Vijeta Kumari', specialization: 'Health Checkup', qualification: 'MBBS', image: 'assets/img/team/4.jpg' },
      { name: 'Dr. Yagnesh Patel', specialization: 'Dermatology', qualification: 'MD', image: 'assets/img/team/5.jpg' },
      { name: 'Dr. Namita Bhoj', specialization: 'Eye Specialist', qualification: 'MBBS, MS, MD', image: 'assets/img/team/6.jpg' },
      { name: 'Dr. Jeel Patel', specialization: 'CCU & ICU', qualification: 'MBBS', image: 'assets/img/team/7.jpg' },
      { name: 'Dr. Harman', specialization: 'Health Checkup', qualification: 'MBBS', image: 'assets/img/team/8.jpg' }
    ];
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);
    res.json({ success: true, message: `Seeded ${doctors.length} doctors successfully!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback: send index.html for any unmatched route (keeps direct links like /about.html working too)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
