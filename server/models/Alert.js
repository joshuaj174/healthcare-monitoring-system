const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  message:    { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  type:       { type: String, enum: ['capacity', 'medicine', 'status'], default: 'capacity' },
  timestamp:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Alert', alertSchema);