/**
 * server.js — Hospital Management System API Entry Point
 *
 * Bootstraps Express, connects MongoDB, mounts all route modules,
 * and applies security middleware (helmet, cors, morgan, rate limiting).
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

// Route imports
const authRoutes        = require('./routes/authRoutes');
const userRoutes        = require('./routes/userRoutes');
const patientRoutes     = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const labReportRoutes   = require('./routes/labReportRoutes');
const vitalsRoutes      = require('./routes/vitalsRoutes');
const medicineRoutes    = require('./routes/medicineRoutes');
const billRoutes        = require('./routes/billRoutes');
const auditLogRoutes    = require('./routes/auditLogRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// ── Security & Utility Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-reports',  labReportRoutes);
app.use('/api/vitals',       vitalsRoutes);
app.use('/api/medicines',    medicineRoutes);
app.use('/api/bills',        billRoutes);
app.use('/api/audit-logs',   auditLogRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'Hospital API is running', timestamp: new Date().toISOString() })
);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
