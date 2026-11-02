/**
 * models/Prescription.js — Doctor prescriptions with medicine list
 */
const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage:       { type: String, required: true },       // e.g. "500mg"
  frequency:    { type: String, required: true },       // e.g. "Twice daily"
  duration:     { type: String, required: true },       // e.g. "7 days"
  instructions: { type: String },
  quantity:     { type: Number, default: 1 },
});

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, unique: true },
  patient:        { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment:    { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medicines:      [medicineItemSchema],
  diagnosis:      { type: String, required: true },
  notes:          { type: String },
  status:         { type: String, enum: ['Pending', 'Dispensed', 'Partial', 'Cancelled'], default: 'Pending' },
  dispensedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dispensedAt:    { type: Date },
}, { timestamps: true });

// Auto-generate prescription ID  e.g. RX-0001
prescriptionSchema.pre('save', async function (next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
