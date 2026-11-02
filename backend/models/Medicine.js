/**
 * models/Medicine.js — Pharmacy medicine inventory
 */
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name:                 { type: String, required: true, trim: true },
  genericName:          { type: String },
  category:             { type: String, required: true },
  manufacturer:         { type: String },
  batchNumber:          { type: String },
  expiryDate:           { type: Date },
  stockQuantity:        { type: Number, required: true, default: 0 },
  unitPrice:            { type: Number, required: true },
  reorderLevel:         { type: Number, default: 50 },
  unit:                 { type: String, default: 'Tablet' },
  description:          { type: String },
  requiresPrescription: { type: Boolean, default: true },
  isActive:             { type: Boolean, default: true },
  addedBy:              { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: stock status label
medicineSchema.virtual('stockStatus').get(function () {
  if (this.stockQuantity === 0) return 'Out of Stock';
  if (this.stockQuantity <= this.reorderLevel) return 'Low Stock';
  return 'In Stock';
});

medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
