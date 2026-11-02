/**
 * controllers/appointmentController.js — Appointment scheduling, queue management & consultation lifecycle
 */
const Appointment = require('../models/Appointment');
const Patient     = require('../models/Patient');

// GET /api/appointments — Paginated & filterable appointment list
exports.getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, doctor, patient, date, type } = req.query;
    const filter = {};

    // Patient users can only view their own linked patient appointments
    if (req.user.role === 'patient') {
      const patientRecord = await Patient.findOne({ email: req.user.email });
      if (patientRecord) {
        filter.patient = patientRecord._id;
      } else {
        return res.json({ success: true, data: [], total: 0, page: 1, pages: 0 });
      }
    } else {
      if (patient) filter.patient = patient;
    }

    // Doctor users default to filtering their own unless an admin/receptionist requests
    if (req.user.role === 'doctor' && !doctor) {
      filter.doctor = req.user._id;
    } else if (doctor) {
      filter.doctor = doctor;
    }

    if (status) filter.status = status;
    if (type)   filter.type   = type;

    if (date) {
      const d = new Date(date);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end   = new Date(d); end.setHours(23, 59, 59, 999);
      filter.scheduledDate = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patient', 'name patientId phone bloodGroup gender dateOfBirth')
        .populate('doctor',  'name specialization department phone')
        .populate('createdBy', 'name role')
        .skip(skip)
        .limit(Number(limit))
        .sort({ scheduledDate: -1, scheduledTime: 1 }),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    appointments,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/:id — Single appointment details
exports.getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('patient', 'name patientId phone dateOfBirth bloodGroup gender allergies medicalHistory address')
      .populate('doctor',  'name specialization department phone email')
      .populate('createdBy', 'name role');

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/appointments — Book / schedule an appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient, doctor, scheduledDate, scheduledTime, type, reason, symptoms } = req.body;

    // Check conflict: Same doctor, same date, same time slot (excluding cancelled/no-show)
    const targetDate = new Date(scheduledDate);
    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay   = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

    const conflict = await Appointment.findOne({
      doctor,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      scheduledTime,
      status: { $nin: ['Cancelled', 'No Show'] },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Dr. is already booked at ${scheduledTime} on this date. Please choose another slot.`,
      });
    }

    const appt = await Appointment.create({
      patient,
      doctor,
      scheduledDate: targetDate,
      scheduledTime,
      type: type || 'General',
      reason: reason || '',
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      status: 'Scheduled',
      createdBy: req.user._id,
    });

    await appt.populate('patient', 'name patientId phone');
    await appt.populate('doctor',  'name specialization department');

    res.status(201).json({
      success: true,
      data:    appt,
      message: `Appointment ${appt.appointmentId} confirmed for ${appt.patient.name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/appointments/:id — Update appointment or consultation notes
exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name patientId phone')
      .populate('doctor',  'name specialization department');

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      data:    appt,
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/appointments/:id/status — Update workflow status (Check-in, In Progress, Completed)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, diagnosis, notes, followUpRequired, followUpDate } = req.body;
    const validStatuses = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const updateFields = { status };
    if (diagnosis) updateFields.diagnosis = diagnosis;
    if (notes)     updateFields.notes = notes;
    if (followUpRequired !== undefined) updateFields.followUpRequired = followUpRequired;
    if (followUpDate) updateFields.followUpDate = new Date(followUpDate);

    const appt = await Appointment.findByIdAndUpdate(req.params.id, updateFields, { new: true })
      .populate('patient', 'name patientId')
      .populate('doctor',  'name specialization');

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      data:    appt,
      message: `Appointment status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/appointments/:id/cancel — Cancel with reason
exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appt.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed appointments cannot be cancelled' });
    }

    appt.status = 'Cancelled';
    appt.cancelledReason = req.body.reason || 'Cancelled by user/reception desk';
    await appt.save();

    res.json({
      success: true,
      data:    appt,
      message: `Appointment ${appt.appointmentId} has been cancelled`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/today — Today's appointment queue for front desk & doctors
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end   = new Date(today); end.setHours(23, 59, 59, 999);

    const filter = { scheduledDate: { $gte: start, $lte: end } };

    // If doctor role, scope to this doctor
    if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name patientId phone gender dateOfBirth bloodGroup')
      .populate('doctor',  'name specialization department')
      .sort({ scheduledTime: 1 });

    res.json({
      success: true,
      total:   appointments.length,
      data:    appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
