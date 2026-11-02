/**
 * controllers/auditLogController.js — View audit trail (admin only)
 */
const AuditLog = require('../models/AuditLog');

exports.getAllAuditLogs = async (req, res) => {
  try {
    const { user, action, module, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (user)   filter.user   = user;
    if (action) filter.action = action;
    if (module) filter.module = module;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name role email')
        .skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, data: logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

