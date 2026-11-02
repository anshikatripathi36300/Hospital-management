/**
 * controllers/dashboardController.js — Aggregated stats for dashboards
 */
const User        = require('../models/User');
const Patient     = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill        = require('../models/Bill');
const LabReport   = require('../models/LabReport');
const Medicine    = require('../models/Medicine');

// GET /api/dashboard/admin
exports.getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today); startOfDay.setHours(0,0,0,0);
    const endOfDay   = new Date(today); endOfDay.setHours(23,59,59,999);

    const [
      totalPatients,
      totalDoctors,
      totalStaff,
      totalAppointments,
      todayAppointments,
      pendingBills,
      lowStockMedicines,
      pendingLabReports,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: { $in: ['nurse','receptionist','lab_technician','pharmacist','accountant'] }, isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ scheduledDate: { $gte: startOfDay, $lte: endOfDay } }),
      Bill.countDocuments({ paymentStatus: { $in: ['Pending','Partial'] } }),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ['$stockQuantity','$reorderLevel'] } }),
      LabReport.countDocuments({ overallStatus: { $in: ['Pending','Processing'] } }),
    ]);

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await Bill.aggregate([
      { $match: { paymentStatus: { $in: ['Paid','Partial'] }, createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$paidAmount' },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalStaff,
        totalAppointments,
        todayAppointments,
        pendingBills,
        lowStockMedicines,
        pendingLabReports,
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/doctor/:doctorId
exports.getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.params.doctorId || req.user._id;
    const today    = new Date();
    const startOfDay = new Date(today); startOfDay.setHours(0,0,0,0);
    const endOfDay   = new Date(today); endOfDay.setHours(23,59,59,999);

    const [todayAppts, totalPatients, pendingAppts] = await Promise.all([
      Appointment.find({
        doctor: doctorId,
        scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      }).populate('patient', 'name patientId phone').sort({ scheduledTime: 1 }),
      Patient.countDocuments({ assignedDoctor: doctorId, isActive: true }),
      Appointment.countDocuments({ doctor: doctorId, status: { $in: ['Scheduled','Confirmed'] } }),
    ]);

    res.json({ success: true, data: { todayAppts, totalPatients, pendingAppts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

