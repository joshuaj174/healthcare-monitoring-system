const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  userEmail:   { type: String, required: true },
  userName:    { type: String },
}, { timestamps: true });

// One user can only subscribe to a hospital once
subscriptionSchema.index({ userId: 1, hospitalId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);