/**
 * controllers/patientController.js — Patient CRUD, search, history, and stats
 */
const Patient = require('../models/Patient');

// GET /api/patients — Paginated list with multi-parameter filter & search
exports.getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, bloodGroup, gender, assignedDoctor, status } = req.query;
    const filter = {};

    // By default only return active patients unless explicit
    if (status === 'all') {
      // no filter on isActive
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else {
      filter.isActive = true;
    }

    if (search) {
      filter.$or = [
        { name:      { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { phone:     { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }
    if (bloodGroup)     filter.bloodGroup     = bloodGroup;
    if (gender)         filter.gender         = gender;
    if (assignedDoctor) filter.assignedDoctor = assignedDoctor;

    const skip = (Number(page) - 1) * Number(limit);
    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate('assignedDoctor', 'name specialization department phone')
        .populate('registeredBy', 'name role')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Patient.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    patients,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/patients/:id — Detailed patient profile
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor', 'name specialization department phone email')
      .populate('registeredBy',   'name role');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/patients — Register a new patient
exports.createPatient = async (req, res) => {
  try {
    // Check if phone or email already registered
    const existing = await Patient.findOne({
      $or: [
        { phone: req.body.phone },
        ...(req.body.email ? [{ email: req.body.email.toLowerCase() }] : []),
      ],
      isActive: true,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `An active patient already exists with phone ${req.body.phone} (${existing.patientId})`,
      });
    }

    const patient = await Patient.create({
      ...req.body,
      registeredBy: req.user._id,
    });

    await patient.populate('assignedDoctor', 'name specialization');
    res.status(201).json({
      success: true,
      data:    patient,
      message: `Patient ${patient.name} (${patient.patientId}) registered successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/patients/:id — Update demographic or clinical details
exports.updatePatient = async (req, res) => {
  try {
    // Prevent overriding patientId or registeredBy
    delete req.body.patientId;
    delete req.body.registeredBy;

    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedDoctor', 'name specialization department');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({
      success: true,
      data:    patient,
      message: 'Patient profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/patients/:id/medical-history — Add condition to medical history
exports.addMedicalHistory = async (req, res) => {
  try {
    const { condition, notes, diagnosedAt } = req.body;
    if (!condition) {
      return res.status(400).json({ success: false, message: 'Condition name is required' });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.medicalHistory.push({
      condition,
      notes: notes || '',
      diagnosedAt: diagnosedAt ? new Date(diagnosedAt) : new Date(),
    });

    await patient.save();
    res.json({
      success: true,
      data: patient.medicalHistory,
      message: 'Medical history entry recorded',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/patients/:id — Soft-delete / deactivate patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({
      success: true,
      message: `Patient ${patient.patientId} has been archived/deactivated`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/patients/stats — Summary metrics
exports.getPatientStats = async (req, res) => {
  try {
    const [total, byGender, byBloodGroup] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Patient.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      Patient.aggregate([
        { $match: { isActive: true, bloodGroup: { $exists: true, $ne: null } } },
        { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byGender: byGender.map(g => ({ gender: g._id || 'Unspecified', count: g.count })),
        byBloodGroup: byBloodGroup.map(b => ({ bloodGroup: b._id, count: b.count })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
