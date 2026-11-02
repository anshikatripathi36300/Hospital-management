/**
 * models/Patient.js — Patient demographic and medical profile
 */
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId:   { type: String, unique: true },
  name:        { type: String, required: true, trim: true },
  email:       { type: String, lowercase: true, trim: true },
  phone:       { type: String, required: true },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup:  { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  address: {
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
  },
  emergencyContact: {
    name:     String,
    phone:    String,
    relation: String,
  },
  insuranceInfo: {
    provider:     String,
    policyNumber: String,
    expiryDate:   Date,
  },
  medicalHistory:    [{ condition: String, diagnosedAt: Date, notes: String }],
  allergies:         [String],
  chronicConditions: [String],
  assignedDoctor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:          { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate patient ID  e.g. PAT-0001
patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
