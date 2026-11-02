/**
 * controllers/billController.js — Invoicing, Payment Lifecycle & Financial Analytics
 */
const Bill    = require('../models/Bill');
const Patient = require('../models/Patient');

// GET /api/bills — Filterable invoices with role-based scoping
exports.getAllBills = async (req, res) => {
  try {
    const { patient, paymentStatus, page = 1, limit = 20, startDate, endDate } = req.query;
    const filter = {};

    // Patient users can only view their own bills
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

    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(new Date(endDate).setHours(23,59,59,999));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .populate('patient', 'name patientId phone email')
        .populate('appointment', 'appointmentId scheduledDate type')
        .populate('generatedBy', 'name role')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Bill.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    bills,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bills/:id — Full invoice details
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patient', 'name patientId phone address email')
      .populate('appointment', 'appointmentId scheduledDate type')
      .populate('generatedBy', 'name role');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/bills — Generate invoice with server-side math validation
exports.createBill = async (req, res) => {
  try {
    const { patient, appointment, items, discount = 0, taxRate = 0, notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Invoice must contain at least one line item' });
    }

    // Server-side calculation
    let calculatedSubtotal = 0;
    const validatedItems = items.map(item => {
      const qty = Number(item.quantity) || 1;
      const unit = Number(item.unitPrice) || 0;
      const total = qty * unit;
      calculatedSubtotal += total;
      return {
        description: item.description,
        category:    item.category || 'Consultation',
        quantity:    qty,
        unitPrice:   unit,
        totalPrice:  total,
      };
    });

    const tax = parseFloat(((calculatedSubtotal * Number(taxRate)) / 100).toFixed(2));
    const totalAmount = Math.max(0, calculatedSubtotal + tax - Number(discount));

    const bill = await Bill.create({
      patient,
      appointment,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discount: Number(discount),
      tax,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      paymentStatus: 'Pending',
      notes: notes || '',
      generatedBy: req.user._id,
    });

    await bill.populate('patient', 'name patientId');
    await bill.populate('generatedBy', 'name role');

    res.status(201).json({
      success: true,
      data:    bill,
      message: `Invoice ${bill.billId} generated for ₹${bill.totalAmount.toLocaleString()}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/bills/:id/pay — Record payment transaction
exports.recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, insuranceClaim } = req.body;
    const paymentNum = Number(amount);

    if (!paymentNum || paymentNum <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (bill.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already fully settled' });
    }

    bill.paidAmount   += paymentNum;
    bill.paymentMethod = paymentMethod || bill.paymentMethod || 'Cash';
    bill.dueAmount     = Math.max(0, bill.totalAmount - bill.paidAmount);

    if (insuranceClaim) {
      bill.insuranceClaim = insuranceClaim;
    }

    if (bill.paidAmount >= bill.totalAmount) {
      bill.paymentStatus = 'Paid';
      bill.paidAt        = new Date();
    } else {
      bill.paymentStatus = 'Partial';
    }

    await bill.save();
    await bill.populate('patient', 'name patientId');

    res.json({
      success: true,
      data:    bill,
      message: `Payment of ₹${paymentNum.toLocaleString()} processed for ${bill.billId}. Remaining balance: ₹${bill.dueAmount.toLocaleString()}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bills/revenue-summary — Daily, monthly, yearly financial KPI breakdown
exports.getRevenueSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay   = new Date(today); startOfDay.setHours(0,0,0,0);
    const endOfDay     = new Date(today); endOfDay.setHours(23,59,59,999);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear  = new Date(today.getFullYear(), 0, 1);

    const [daily, monthly, yearly, pending, breakdown] = await Promise.all([
      Bill.aggregate([
        { $match: { paidAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      Bill.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      Bill.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      Bill.aggregate([
        { $match: { paymentStatus: { $in: ['Pending', 'Partial'] } } },
        { $group: { _id: null, total: { $sum: '$dueAmount' } } },
      ]),
      Bill.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.category', total: { $sum: '$items.totalPrice' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        daily:     daily[0]?.total   || 0,
        monthly:   monthly[0]?.total || 0,
        yearly:    yearly[0]?.total  || 0,
        pending:   pending[0]?.total || 0,
        categoryBreakdown: breakdown.map(b => ({ category: b._id || 'Other', amount: b.total })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
