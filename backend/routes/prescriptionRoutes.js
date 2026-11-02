/**
 * routes/prescriptionRoutes.js — Prescription API Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  dispensePrescription,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { validate } = require('../middleware/validate');

router.use(protect);

const rxValidation = [
  body('patient').notEmpty().withMessage('Patient reference ID is required'),
  body('diagnosis').notEmpty().withMessage('Clinical diagnosis is required'),
  body('medicines').isArray({ min: 1 }).withMessage('At least one medicine item is required'),
  body('medicines.*.medicineName').notEmpty().withMessage('Medicine name is required'),
  body('medicines.*.dosage').notEmpty().withMessage('Dosage is required'),
  body('medicines.*.frequency').notEmpty().withMessage('Frequency is required'),
  body('medicines.*.duration').notEmpty().withMessage('Duration is required'),
];

router.get('/', getAllPrescriptions);

router.post(
  '/',
  authorize('admin', 'doctor'),
  validate(rxValidation),
  audit('PRESCRIPTION_CREATED', 'Prescription'),
  createPrescription
);

router.get('/:id', getPrescriptionById);

router.put(
  '/:id',
  authorize('admin', 'doctor'),
  audit('PRESCRIPTION_UPDATED', 'Prescription'),
  updatePrescription
);

router.put(
  '/:id/dispense',
  authorize('admin', 'pharmacist'),
  audit('PRESCRIPTION_DISPENSED', 'Pharmacy'),
  dispensePrescription
);

module.exports = router;
