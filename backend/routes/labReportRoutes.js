/**
 * routes/labReportRoutes.js — Laboratory Test & Results API Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const {
  getAllLabReports,
  getLabReportById,
  createLabReport,
  updateLabReportStatus,
  completeLabReport,
} = require('../controllers/labReportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { validate } = require('../middleware/validate');

router.use(protect);

const labValidation = [
  body('patient').notEmpty().withMessage('Patient reference ID is required'),
  body('testType').notEmpty().withMessage('Test type/panel name is required'),
];

router.get('/', getAllLabReports);

router.post(
  '/',
  authorize('admin', 'doctor', 'lab_technician'),
  validate(labValidation),
  audit('LAB_TEST_ORDERED', 'Laboratory'),
  createLabReport
);

router.get('/:id', getLabReportById);

router.put(
  '/:id/status',
  authorize('admin', 'lab_technician'),
  audit('LAB_STATUS_UPDATED', 'Laboratory'),
  updateLabReportStatus
);

router.put(
  '/:id/complete',
  authorize('admin', 'lab_technician'),
  audit('LAB_RESULTS_PUBLISHED', 'Laboratory'),
  completeLabReport
);

module.exports = router;
