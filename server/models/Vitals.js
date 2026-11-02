/**
 * models/Vitals.js — Patient vital signs recorded by nurses
 */
const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  patient:         { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointment:     { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  recordedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  temperature:     { type: Number },          // °C
  bloodPressure:   { type: String },          // e.g. "120/80"
  heartRate:       { type: Number },          // bpm
  respiratoryRate: { type: Number },          // breaths/min
  oxygenSaturation:{ type: Number },          // %
  weight:          { type: Number },          // kg
  height:          { type: Number },          // cm
  bmi:             { type: Number },
  bloodSugar:      { type: Number },          // mg/dL
  notes:           { type: String },
  recordedAt:      { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Vitals', vitalsSchema);
