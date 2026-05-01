const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Normal', 'Critical'], default: 'Normal' },
  capacity: { type: Number, default: 50 },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  region: { type: String, default: 'Unknown' },
  medicineSupply: { type: Number, default: 70 },
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);