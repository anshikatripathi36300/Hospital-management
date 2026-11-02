/**
 * models/AuditLog.js — System audit trail for sensitive actions
 */
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:  { type: String },
  userRole:  { type: String },
  action:    { type: String, required: true },  // e.g. 'LOGIN', 'CREATE_PATIENT'
  module:    { type: String },                   // e.g. 'Auth', 'Patient'
  targetId:  { type: String },                   // ID of affected resource
  details:   { type: String },
  status:    { type: String, enum: ['Success', 'Failed'], default: 'Success' },
  ipAddress: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
