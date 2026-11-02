/**
 * routes/auditLogRoutes.js
 */
const express = require('express');
const router  = express.Router();
const { getAllAuditLogs } = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin'), getAllAuditLogs);

module.exports = router;

