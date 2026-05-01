const User         = require('../models/User');
const Hospital     = require('../models/Hospital');
const Subscription = require('../models/Subscription');
const Alert        = require('../models/Alert');

// Get all users with their subscription details
const getAllUsers = async (req, res) => {
  try {
    // Find ALL users except admins — including those without a role field
    const users = await User.find({
      $or: [
        { role: 'user' },
        { role: { $exists: false } },  // ← catches old users with no role field
        { role: null },
      ],
    })
      .select('-password')
      .sort({ createdAt: -1 });

    const usersWithSubs = await Promise.all(
      users.map(async (user) => {
        const subs = await Subscription.find({ userId: user._id })
          .populate('hospitalId', 'name region status capacity');
        return {
          _id:           user._id,
          username:      user.username,
          email:         user.email,
          createdAt:     user.createdAt,
          subscriptionCount: subs.length,
          subscriptions: subs.map(s => s.hospitalId).filter(Boolean),
        };
      })
    );

    res.json(usersWithSubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Add a new hospital
const addHospital = async (req, res) => {
  try {
    const {
      name, region, status, capacity,
      latitude, longitude, medicineSupply,
    } = req.body;

    if (!name || !region || !latitude || !longitude) {
      return res.status(400).json({ message: 'Name, region, latitude and longitude are required' });
    }

    const hospital = await Hospital.create({
      name,
      region,
      status:         status         || 'Normal',
      capacity:       capacity        || 50,
      latitude:       parseFloat(latitude),
      longitude:      parseFloat(longitude),
      medicineSupply: medicineSupply  || 50,
    });

    res.status(201).json({ message: 'Hospital added successfully', hospital });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a hospital
const deleteHospital = async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    await Subscription.deleteMany({ hospitalId: req.params.id });
    res.json({ message: 'Hospital deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dashboard stats for admin
const getAdminStats = async (req, res) => {
  try {
    const totalHospitals  = await Hospital.countDocuments();
    const criticalCount   = await Hospital.countDocuments({ status: 'Critical' });
    const totalUsers      = await User.countDocuments({ role: 'user' });
    const totalAlerts     = await Alert.countDocuments();
    const totalSubs       = await Subscription.countDocuments();

    res.json({
      totalHospitals,
      criticalCount,
      totalUsers,
      totalAlerts,
      totalSubs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, addHospital, deleteHospital, getAdminStats };