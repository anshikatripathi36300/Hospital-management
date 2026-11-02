/**
 * models/Appointment.js — Appointment scheduling and status tracking
 */
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId:   { type: String, unique: true },
  patient:         { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledDate:   { type: Date, required: true },
  scheduledTime:   { type: String, required: true },
  duration:        { type: Number, default: 30 }, // minutes
  type:            { type: String, enum: ['General', 'Follow-up', 'Emergency', 'Consultation', 'Procedure'], default: 'General' },
  status:          { type: String, enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'], default: 'Scheduled' },
  reason:          { type: String },
  notes:           { type: String },
  symptoms:        [String],
  diagnosis:       { type: String },
  followUpRequired:{ type: Boolean, default: false },
  followUpDate:    { type: Date },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledReason: { type: String },
}, { timestamps: true });

// Auto-generate appointment ID  e.g. APT-0001
appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
