/**
 * routes/patientRoutes.js — Patient Management API Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  addMedicalHistory,
  deletePatient,
  getPatientStats,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { validate } = require('../middleware/validate');

// All patient endpoints require authentication
router.use(protect);

// Validation rules
const patientValidation = [
  body('name').trim().notEmpty().withMessage('Patient full name is required'),
  body('phone').trim().notEmpty().withMessage('Valid phone number is required'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender value'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
];

// Endpoints
router.get('/stats', authorize('admin', 'doctor', 'receptionist'), getPatientStats);

router.get('/', authorize('admin', 'doctor', 'nurse', 'receptionist'), getAllPatients);

router.post(
  '/',
  authorize('admin', 'receptionist'),
  validate(patientValidation),
  audit('PATIENT_REGISTERED', 'Patient'),
  createPatient
);

router.get('/:id', authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), getPatientById);

router.put(
  '/:id',
  authorize('admin', 'receptionist', 'doctor'),
  audit('PATIENT_UPDATED', 'Patient'),
  updatePatient
);

router.post(
  '/:id/medical-history',
  authorize('admin', 'doctor'),
  audit('MEDICAL_HISTORY_ADDED', 'Patient'),
  addMedicalHistory
);

router.delete(
  '/:id',
  authorize('admin'),
  audit('PATIENT_ARCHIVED', 'Patient'),
  deletePatient
);

module.exports = router;
