/**
 * models/Bill.js — Invoice and payment tracking
 */
const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category:    { type: String, enum: ['Consultation', 'Lab Test', 'Medicine', 'Procedure', 'Room', 'Other'] },
  quantity:    { type: Number, default: 1 },
  unitPrice:   { type: Number, required: true },
  totalPrice:  { type: Number, required: true },
});

const billSchema = new mongoose.Schema({
  billId:        { type: String, unique: true },
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointment:   { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  items:         [billItemSchema],
  subtotal:      { type: Number, required: true },
  discount:      { type: Number, default: 0 },
  tax:           { type: Number, default: 0 },
  totalAmount:   { type: Number, required: true },
  paidAmount:    { type: Number, default: 0 },
  dueAmount:     { type: Number },
  paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Refunded', 'Cancelled'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Insurance', 'Cheque'] },
  insuranceClaim: {
    provider:     String,
    policyNumber: String,
    claimAmount:  Number,
    status:       { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
  },
  notes:       { type: String },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt:      { type: Date },
}, { timestamps: true });

// Auto-generate bill ID  e.g. BILL-0001
billSchema.pre('save', async function (next) {
  if (!this.billId) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billId = `BILL-${String(count + 1).padStart(4, '0')}`;
  }
  this.dueAmount = this.totalAmount - this.paidAmount;
  next();
});

module.exports = mongoose.model('Bill', billSchema);
