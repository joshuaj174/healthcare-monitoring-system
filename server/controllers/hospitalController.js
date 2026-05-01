const Hospital = require('../models/Hospital');
const Alert = require('../models/Alert');
const Subscription = require('../models/Subscription');

const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('hospitalId', 'name')
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns total alert count per hospital from entire DB
// This is what powers the correct danger ratings
const getAlertCounts = async (req, res) => {
  try {
    const counts = await Alert.aggregate([
      {
        $group: {
          _id: '$hospitalId',
          count: { $sum: 1 },
        },
      },
    ]);
    // Convert to { hospitalId: count } map
    const result = {};
    counts.forEach(c => {
      if (c._id) result[c._id.toString()] = c.count;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const subscribeToHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const userId    = req.user._id;
    const userEmail = req.user.email;
    const userName  = req.user.username;

    const existing = await Subscription.findOne({ userId, hospitalId: id });
    if (existing) {
      return res.status(400).json({ message: 'Already subscribed to this hospital' });
    }

    await Subscription.create({ userId, hospitalId: id, userEmail, userName });
    res.json({ message: 'Subscribed successfully', subscribed: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unsubscribeFromHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    await Subscription.findOneAndDelete({ userId, hospitalId: id });
    res.json({ message: 'Unsubscribed successfully', subscribed: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ userId: req.user._id }).select('hospitalId');
    const hospitalIds = subs.map(s => s.hospitalId.toString());
    res.json(hospitalIds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const suggestHospital = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const hospitals = await Hospital.find({
      status: 'Normal',
      capacity: { $lt: 80 },
      medicineSupply: { $gt: 20 },
    });

    if (hospitals.length === 0) {
      return res.status(404).json({ message: 'No available hospitals found' });
    }

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const hospitalsWithDistance = hospitals.map(h => ({
      ...h._doc,
      distance: getDistance(latitude, longitude, h.latitude, h.longitude),
    }));

    hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
    res.json(hospitalsWithDistance.slice(0, 3));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  getAlerts,
  getAlertCounts,
  subscribeToHospital,
  unsubscribeFromHospital,
  getMySubscriptions,
  suggestHospital,
};