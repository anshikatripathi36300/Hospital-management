/**
 * routes/medicineRoutes.js — Pharmacy Medicine Inventory Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  restockMedicine,
  deleteMedicine,
  getLowStockMedicines,
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { validate } = require('../middleware/validate');

router.use(protect);

const medicineValidation = [
  body('name').trim().notEmpty().withMessage('Medicine brand name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Initial stock quantity must be 0 or higher'),
];

router.get('/low-stock', authorize('admin', 'pharmacist'), getLowStockMedicines);

router.get('/', getAllMedicines);

router.post(
  '/',
  authorize('admin', 'pharmacist'),
  validate(medicineValidation),
  audit('MEDICINE_CREATED', 'Pharmacy'),
  createMedicine
);

router.get('/:id', getMedicineById);

router.put(
  '/:id',
  authorize('admin', 'pharmacist'),
  audit('MEDICINE_UPDATED', 'Pharmacy'),
  updateMedicine
);

router.post(
  '/:id/restock',
  authorize('admin', 'pharmacist'),
  audit('MEDICINE_RESTOCKED', 'Pharmacy'),
  restockMedicine
);

router.delete(
  '/:id',
  authorize('admin'),
  audit('MEDICINE_DEACTIVATED', 'Pharmacy'),
  deleteMedicine
);

module.exports = router;
