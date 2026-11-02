/**
 * controllers/labReportController.js — Laboratory testing lifecycle & results publishing
 */
const LabReport = require('../models/LabReport');
const Patient   = require('../models/Patient');

// GET /api/lab-reports — List with filters
exports.getAllLabReports = async (req, res) => {
  try {
    const { patient, doctor, status, priority, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Patient users can only view their own lab reports
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

    if (doctor)   filter.doctor        = doctor;
    if (status)   filter.overallStatus = status;
    if (priority) filter.priority      = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      LabReport.find(filter)
        .populate('patient', 'name patientId bloodGroup gender phone')
        .populate('doctor',  'name specialization department')
        .populate('processedBy', 'name role')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      LabReport.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    reports,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/lab-reports/:id
exports.getLabReportById = async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id)
      .populate('patient', 'name patientId phone bloodGroup dateOfBirth')
      .populate('doctor',  'name specialization department')
      .populate('processedBy', 'name role');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/lab-reports — Order a lab test (Doctor or Admin)
exports.createLabReport = async (req, res) => {
  try {
    const { patient, appointment, testType, priority, notes, testResults } = req.body;

    const report = await LabReport.create({
      patient,
      appointment,
      doctor: req.user._id,
      testType,
      priority: priority || 'Routine',
      notes: notes || '',
      testResults: testResults || [],
      overallStatus: 'Pending',
    });

    await report.populate('patient', 'name patientId');
    await report.populate('doctor',  'name specialization');

    res.status(201).json({
      success: true,
      data:    report,
      message: `Lab order ${report.reportId} created for ${report.testType}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/lab-reports/:id/status — Update sample collection / processing state
exports.updateLabReportStatus = async (req, res) => {
  try {
    const { overallStatus } = req.body;
    const report = await LabReport.findByIdAndUpdate(
      req.params.id,
      { overallStatus },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }

    res.json({ success: true, data: report, message: `Report status updated to ${overallStatus}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/lab-reports/:id/results — Lab tech records results & findings
exports.completeLabReport = async (req, res) => {
  try {
    const { testResults, findings, notes } = req.body;
    const report = await LabReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }

    report.overallStatus = 'Completed';
    if (testResults) report.testResults = testResults;
    if (findings)    report.findings    = findings;
    if (notes)       report.notes       = notes;
    report.processedBy = req.user._id;
    report.completedAt = new Date();
    await report.save();

    await report.populate('patient', 'name patientId');
    await report.populate('processedBy', 'name role');

    res.json({
      success: true,
      data:    report,
      message: `Lab report ${report.reportId} completed and results published`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
