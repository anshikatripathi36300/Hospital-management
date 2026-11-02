/**
 * controllers/vitalsController.js — Nursing vitals & physiological monitoring
 */
const Vitals = require('../models/Vitals');
const Patient = require('../models/Patient');

// Helper to flag abnormal vitals for clinical alerts
const evaluateVitalsAlert = (v) => {
  const alerts = [];
  if (v.temperature && v.temperature > 38.0) alerts.push('Fever (> 38°C)');
  if (v.oxygenSaturation && v.oxygenSaturation < 95) alerts.push('Low Oxygen Saturation (< 95%)');
  if (v.heartRate && (v.heartRate < 55 || v.heartRate > 110)) alerts.push(`Abnormal Heart Rate (${v.heartRate} bpm)`);
  if (v.bloodPressure) {
    const parts = v.bloodPressure.split('/');
    if (parts.length === 2) {
      const systolic = parseInt(parts[0], 10);
      const diastolic = parseInt(parts[1], 10);
      if (systolic >= 140 || diastolic >= 90) alerts.push('Hypertension Flag (>= 140/90)');
      if (systolic < 90) alerts.push('Hypotension Flag (< 90)');
    }
  }
  return alerts;
};

// GET /api/vitals — All vitals history with pagination
exports.getAllVitals = async (req, res) => {
  try {
    const { patient, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (patient) filter.patient = patient;

    const skip = (Number(page) - 1) * Number(limit);
    const [vitals, total] = await Promise.all([
      Vitals.find(filter)
        .populate('patient', 'name patientId bloodGroup gender dateOfBirth')
        .populate('recordedBy', 'name role department')
        .skip(skip)
        .limit(Number(limit))
        .sort({ recordedAt: -1 }),
      Vitals.countDocuments(filter),
    ]);

    const enriched = vitals.map(v => {
      const item = v.toObject();
      item.clinicalAlerts = evaluateVitalsAlert(v);
      return item;
    });

    res.json({
      success: true,
      data:    enriched,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/vitals/patient/:patientId — Complete vitals timeline for a specific patient
exports.getVitalsByPatient = async (req, res) => {
  try {
    const vitals = await Vitals.find({ patient: req.params.patientId })
      .populate('recordedBy', 'name role')
      .sort({ recordedAt: -1 });

    const enriched = vitals.map(v => {
      const item = v.toObject();
      item.clinicalAlerts = evaluateVitalsAlert(v);
      return item;
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/vitals/patient/:patientId/latest — Most recent recorded vitals
exports.getLatestVitals = async (req, res) => {
  try {
    const v = await Vitals.findOne({ patient: req.params.patientId })
      .populate('recordedBy', 'name role')
      .sort({ recordedAt: -1 });

    if (!v) {
      return res.json({ success: true, data: null, message: 'No vitals recorded yet' });
    }

    const item = v.toObject();
    item.clinicalAlerts = evaluateVitalsAlert(v);

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/vitals — Record vitals by nurse or doctor
exports.createVitals = async (req, res) => {
  try {
    const { patient, temperature, bloodPressure, heartRate, respiratoryRate, oxygenSaturation, weight, height, bloodSugar, notes, appointment } = req.body;

    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Calculate BMI
    let bmi;
    if (weight && height) {
      const heightInMeters = Number(height) / 100;
      if (heightInMeters > 0) {
        bmi = parseFloat((Number(weight) / (heightInMeters * heightInMeters)).toFixed(1));
      }
    }

    const vitalsRecord = await Vitals.create({
      patient,
      appointment,
      recordedBy: req.user._id,
      temperature: temperature ? Number(temperature) : undefined,
      bloodPressure,
      heartRate: heartRate ? Number(heartRate) : undefined,
      respiratoryRate: respiratoryRate ? Number(respiratoryRate) : undefined,
      oxygenSaturation: oxygenSaturation ? Number(oxygenSaturation) : undefined,
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      bmi,
      bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
      notes: notes || '',
      recordedAt: new Date(),
    });

    await vitalsRecord.populate('patient', 'name patientId');
    await vitalsRecord.populate('recordedBy', 'name role');

    const result = vitalsRecord.toObject();
    result.clinicalAlerts = evaluateVitalsAlert(vitalsRecord);

    res.status(201).json({
      success: true,
      data:    result,
      message: `Vitals recorded for ${vitalsRecord.patient.name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
