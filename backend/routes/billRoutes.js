/**
 * routes/billRoutes.js — Invoicing & Billing API Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const {
  getAllBills,
  getBillById,
  createBill,
  recordPayment,
  getRevenueSummary,
} = require('../controllers/billController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { validate } = require('../middleware/validate');

router.use(protect);

const billValidation = [
  body('patient').notEmpty().withMessage('Patient reference ID is required'),
  body('items').isArray({ min: 1 }).withMessage('Invoice must contain at least one bill item'),
];

router.get('/revenue-summary', authorize('admin', 'accountant'), getRevenueSummary);

router.get('/', authorize('admin', 'accountant', 'patient', 'receptionist'), getAllBills);

router.post(
  '/',
  authorize('admin', 'accountant', 'receptionist'),
  validate(billValidation),
  audit('INVOICE_GENERATED', 'Billing'),
  createBill
);

router.get('/:id', getBillById);

router.put(
  '/:id/pay',
  authorize('admin', 'accountant', 'receptionist'),
  audit('PAYMENT_RECORDED', 'Billing'),
  recordPayment
);

module.exports = router;
