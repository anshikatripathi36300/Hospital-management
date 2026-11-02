/**
 * routes/vitalsRoutes.js — Patient Vitals Monitoring Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const {
  getAllVitals,
  getVitalsByPatient,
  getLatestVitals,
  createVitals,
} = require('../controllers/vitalsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { validate } = require('../middleware/validate');

router.use(protect);

const vitalsValidation = [
  body('patient').notEmpty().withMessage('Patient reference ID is required'),
];

router.get('/', authorize('admin', 'doctor', 'nurse'), getAllVitals);

router.post(
  '/',
  authorize('admin', 'nurse', 'doctor'),
  validate(vitalsValidation),
  audit('VITALS_RECORDED', 'Clinical'),
  createVitals
);

router.get('/patient/:patientId', authorize('admin', 'doctor', 'nurse', 'patient'), getVitalsByPatient);

router.get('/patient/:patientId/latest', authorize('admin', 'doctor', 'nurse', 'patient'), getLatestVitals);

module.exports = router;
