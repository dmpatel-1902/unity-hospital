const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  qualification: { type: String, default: '' },
  contact: { type: String, default: '' },
  image: { type: String, default: 'assets/img/team/1.jpg' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
