/**
 * middleware/auditMiddleware.js
 *
 * Automatically creates an AuditLog record after sensitive write operations.
 * Attach as middleware on POST/PUT/DELETE routes that need tracing.
 *
 * Usage:  router.post('/patients', protect, audit('CREATE_PATIENT', 'Patient'), createPatient)
 */
const AuditLog = require('../models/AuditLog');

exports.audit = (action, module = 'General') => {
  return async (req, res, next) => {
    // Store original json method so we can intercept it
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      // Only log on success responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          await AuditLog.create({
            user:      req.user._id,
            userName:  req.user.name,
            userRole:  req.user.role,
            action,
            module,
            targetId:  body?.data?._id?.toString() || req.params?.id || '',
            details:   `${action} performed by ${req.user.name}`,
            status:    'Success',
            ipAddress: req.ip,
          });
        } catch (_) {
          // Audit log failure must not crash the response
        }
      }
      return originalJson(body);
    };
    next();
  };
};
