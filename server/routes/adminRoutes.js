const express = require('express');
const router  = express.Router();
const { getAllUsers, addHospital, deleteHospital, getAdminStats } = require('../controllers/adminController');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/stats',            protect, adminOnly, getAdminStats);
router.get('/users',            protect, adminOnly, getAllUsers);
router.post('/hospitals',       protect, adminOnly, addHospital);
router.delete('/hospitals/:id', protect, adminOnly, deleteHospital);

module.exports = router;