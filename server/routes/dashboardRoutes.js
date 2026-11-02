/**
 * routes/dashboardRoutes.js
 */
const express = require('express');
const router  = express.Router();
const { getAdminStats, getDoctorStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin',          authorize('admin'), getAdminStats);
router.get('/doctor',         authorize('admin', 'doctor'), getDoctorStats);
router.get('/doctor/:doctorId', authorize('admin', 'doctor'), getDoctorStats);

module.exports = router;

