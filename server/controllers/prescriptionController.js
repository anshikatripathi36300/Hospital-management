/**
 * controllers/prescriptionController.js — Prescription management and pharmacy inventory integration
 */
const Prescription = require('../models/Prescription');
const Medicine     = require('../models/Medicine');
const Patient      = require('../models/Patient');

// GET /api/prescriptions — Filterable list
exports.getAllPrescriptions = async (req, res) => {
  try {
    const { patient, doctor, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Patient users can only query their own prescriptions
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

    if (req.user.role === 'doctor' && !doctor) {
      filter.doctor = req.user._id;
    } else if (doctor) {
      filter.doctor = doctor;
    }

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .populate('patient', 'name patientId phone gender dateOfBirth')
        .populate('doctor',  'name specialization department')
        .populate('dispensedBy', 'name role')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Prescription.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    prescriptions,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/prescriptions/:id
exports.getPrescriptionById = async (req, res) => {
  try {
    const rx = await Prescription.findById(req.params.id)
      .populate('patient', 'name patientId phone dateOfBirth allergies')
      .populate('doctor',  'name specialization department licenseNumber')
      .populate('dispensedBy', 'name role');

    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.json({ success: true, data: rx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/prescriptions — Doctor creates prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patient, appointment, medicines, diagnosis, notes } = req.body;

    if (!medicines || !medicines.length) {
      return res.status(400).json({ success: false, message: 'Prescription must contain at least one medicine item' });
    }

    const rx = await Prescription.create({
      patient,
      appointment,
      doctor: req.user._id,
      medicines,
      diagnosis,
      notes: notes || '',
      status: 'Pending',
    });

    await rx.populate('patient', 'name patientId phone');
    await rx.populate('doctor',  'name specialization');

    res.status(201).json({
      success: true,
      data:    rx,
      message: `Prescription ${rx.prescriptionId} issued for ${rx.patient.name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/prescriptions/:id
exports.updatePrescription = async (req, res) => {
  try {
    const rx = await Prescription.findById(req.params.id);
    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (rx.status === 'Dispensed') {
      return res.status(400).json({ success: false, message: 'Cannot modify a dispensed prescription' });
    }

    Object.assign(rx, req.body);
    await rx.save();

    res.json({ success: true, data: rx, message: 'Prescription updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/prescriptions/:id/dispense — Pharmacist dispensing with stock decrement
exports.dispensePrescription = async (req, res) => {
  try {
    const rx = await Prescription.findById(req.params.id);
    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (rx.status === 'Dispensed') {
      return res.status(400).json({ success: false, message: 'Prescription is already marked as dispensed' });
    }

    // Decrement stock for matching medicines in pharmacy inventory
    const stockUpdates = [];
    for (const item of rx.medicines) {
      const med = await Medicine.findOne({
        name: { $regex: new RegExp(`^${item.medicineName}$`, 'i') },
        isActive: true,
      });

      if (med) {
        const qtyToDeduct = item.quantity || 1;
        med.stockQuantity = Math.max(0, med.stockQuantity - qtyToDeduct);
        await med.save();
        stockUpdates.push({ medicine: med.name, remainingStock: med.stockQuantity });
      }
    }

    rx.status      = 'Dispensed';
    rx.dispensedBy = req.user._id;
    rx.dispensedAt = new Date();
    await rx.save();

    await rx.populate('patient', 'name patientId');
    await rx.populate('dispensedBy', 'name role');

    res.json({
      success: true,
      data:    rx,
      stockUpdates,
      message: `Prescription ${rx.prescriptionId} successfully dispensed`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
