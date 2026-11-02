/**
 * routes/appointmentRoutes.js — Appointment API Routes
 */
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getTodayAppointments,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { validate } = require('../middleware/validate');

router.use(protect);

// Booking validation
const bookingValidation = [
  body('patient').notEmpty().withMessage('Patient reference ID is required'),
  body('doctor').notEmpty().withMessage('Doctor reference ID is required'),
  body('scheduledDate').notEmpty().isISO8601().withMessage('Valid scheduled date (YYYY-MM-DD) is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time slot (e.g. 09:30 AM) is required'),
];

router.get('/today', getTodayAppointments);

router.get('/', getAllAppointments);

router.post(
  '/',
  authorize('admin', 'doctor', 'receptionist', 'patient'),
  validate(bookingValidation),
  audit('APPOINTMENT_BOOKED', 'Appointment'),
  createAppointment
);

router.get('/:id', getAppointmentById);

router.put(
  '/:id',
  authorize('admin', 'doctor', 'receptionist'),
  audit('APPOINTMENT_UPDATED', 'Appointment'),
  updateAppointment
);

router.put(
  '/:id/status',
  authorize('admin', 'doctor', 'receptionist', 'nurse'),
  audit('APPOINTMENT_STATUS_CHANGED', 'Appointment'),
  updateAppointmentStatus
);

router.put(
  '/:id/cancel',
  authorize('admin', 'doctor', 'receptionist', 'patient'),
  audit('APPOINTMENT_CANCELLED', 'Appointment'),
  cancelAppointment
);

module.exports = router;
