// Run this once to populate the database with the doctors shown on the website:
//   node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
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

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);

    console.log(`Seeded ${doctors.length} doctors successfully.`);
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

seed();
