const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',                   protect, getHospitals);
router.get('/alerts',             protect, getAlerts);
router.get('/alert-counts',       protect, getAlertCounts);
router.get('/my-subscriptions',   protect, getMySubscriptions);
router.post('/suggest',           protect, suggestHospital);
router.get('/:id',                protect, getHospitalById);
router.post('/',                  protect, createHospital);
router.put('/:id',                protect, updateHospital);
router.post('/:id/subscribe',     protect, subscribeToHospital);
router.delete('/:id/unsubscribe', protect, unsubscribeFromHospital);

module.exports = router;