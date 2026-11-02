/**
 * models/LabReport.js — Laboratory test requests and results
 */
const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testName:       { type: String, required: true },
  value:          { type: String },
  unit:           { type: String },
  referenceRange: { type: String },
  status:         { type: String, enum: ['Normal', 'Abnormal', 'Critical'], default: 'Normal' },
});

const labReportSchema = new mongoose.Schema({
  reportId:      { type: String, unique: true },
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointment:   { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  testType:      { type: String, required: true }, // e.g. 'Blood Test', 'Urine Test'
  testResults:   [testResultSchema],
  overallStatus: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' },
  priority:      { type: String, enum: ['Routine', 'Urgent', 'STAT'], default: 'Routine' },
  notes:         { type: String },
  findings:      { type: String },
  processedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collectedAt:   { type: Date, default: Date.now },
  completedAt:   { type: Date },
}, { timestamps: true });

// Auto-generate lab report ID  e.g. LAB-0001
labReportSchema.pre('save', async function (next) {
  if (!this.reportId) {
    const count = await mongoose.model('LabReport').countDocuments();
    this.reportId = `LAB-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('LabReport', labReportSchema);
