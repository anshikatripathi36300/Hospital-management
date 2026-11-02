/**
 * AppointmentManagement.jsx
 *
 * Admin Portal — Appointment Management & Scheduling Module.
 * Features:
 *  - Master consultation roster across all hospital departments
 *  - Search by patient, UHID, physician, token number
 *  - Filter by department, date period, and consultation status
 *  - Administrative booking modal with live doctor selection & fee display
 *  - Emergency walk-in slot fast-track allocation
 *  - Reschedule modal with date/time slot validation
 *  - Cancellation workflow with reason logging (preserving record integrity)
 *  - Appointment details and consultation slip view
 *  - Pagination and CSV export
 *
 * Part 7 Roadmap Implementation.
 */
import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit2,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  User,
  DollarSign,
  Building2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Zap,
  Activity,
  FileText,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  getAllAppointments,
  saveCustomAppointment,
  updateAppointmentRecord,
  cancelAppointmentRecord,
  getAllDoctors,
  getAllPatients,
  getAllDepartments,
} from '../../data/demoData';

const APPOINTMENT_TYPES = ['Consultation', 'Follow-up', 'Routine', 'Emergency'];
const STATUS_OPTIONS = ['all', 'confirmed', 'pending', 'completed', 'cancelled'];
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
];
const PAGE_SIZE = 6;

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState(() => getAllAppointments());
  const doctors = getAllDoctors();
  const patients = getAllPatients();
  const departments = getAllDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [viewingAppt, setViewingAppt] = useState(null);
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Booking Form State
  const [bookForm, setBookForm] = useState({
    patientId: patients[0]?.id || 'P-001',
    patientName: patients[0]?.name || 'Rahul Verma',
    doctorId: doctors[0]?.id || 'D-001',
    doctorName: doctors[0]?.name || 'Dr. Priya Sharma',
    department: doctors[0]?.department || 'Cardiology',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    type: 'Consultation',
    reason: '',
    fee: doctors[0]?.fee || 800,
  });
  const [formErrors, setFormErrors] = useState({});

  // Reschedule Form State
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '10:00',
  });

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }

  function refreshList() {
    setAppointments(getAllAppointments());
  }

  // Handle department change in booking form (auto-select first matching doctor)
  function handleDeptChange(deptName) {
    const matchingDocs = doctors.filter((d) => d.department === deptName);
    const chosenDoc = matchingDocs[0] || doctors[0];
    setBookForm((prev) => ({
      ...prev,
      department: deptName,
      doctorId: chosenDoc?.id || 'D-001',
      doctorName: chosenDoc?.name || '',
      fee: chosenDoc?.fee || 600,
    }));
  }

  // Handle doctor change in booking form
  function handleDoctorChange(docId) {
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setBookForm((prev) => ({
        ...prev,
        doctorId: doc.id,
        doctorName: doc.name,
        department: doc.department,
        fee: doc.fee || 600,
      }));
    }
  }

  // Handle patient change in booking form
  function handlePatientChange(pId) {
    const p = patients.find((pat) => pat.id === pId);
    if (p) {
      setBookForm((prev) => ({
        ...prev,
        patientId: p.id,
        patientName: p.name,
      }));
    }
  }

  // Filtering
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (a.reason && a.reason.toLowerCase().includes(q)) ||
        (a.patientId && a.patientId.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesDept = deptFilter === 'all' || a.department === deptFilter;
      const matchesType = typeFilter === 'all' || a.type === typeFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesType;
    });
  }, [appointments, searchTerm, statusFilter, deptFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / PAGE_SIZE) || 1;
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAppointments.slice(start, start + PAGE_SIZE);
  }, [filteredAppointments, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    return { total, confirmed, completed, pending, cancelled };
  }, [appointments]);

  // Submit Booking
  function handleBookSubmit(e) {
    e.preventDefault();
    if (!bookForm.reason.trim()) {
      setFormErrors({ reason: 'Please describe the consultation reason.' });
      return;
    }
    setFormErrors({});

    const nextSeq = appointments.length + 1;
    const apptId = `A-${String(nextSeq).padStart(3, '0')}`;

    const newAppt = {
      id: apptId,
      patientId: bookForm.patientId,
      patientName: bookForm.patientName,
      doctorId: bookForm.doctorId,
      doctorName: bookForm.doctorName,
      department: bookForm.department,
      date: bookForm.date,
      time: bookForm.time,
      type: bookForm.type,
      status: 'confirmed',
      reason: bookForm.reason,
      fee: bookForm.fee,
      tokenNumber: nextSeq,
    };

    saveCustomAppointment(newAppt);
    refreshList();
    setIsBookOpen(false);
    showToast(`Appointment ${newAppt.id} scheduled for ${newAppt.patientName}! Token #${newAppt.tokenNumber}`);

    setBookForm((prev) => ({
      ...prev,
      reason: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:30',
    }));
  }

  // Fast-track Emergency Walk-In Allocation
  function handleEmergencyWalkInSubmit(e) {
    e.preventDefault();
    const nextSeq = appointments.length + 1;
    const apptId = `A-${String(nextSeq).padStart(3, '0')}`;

    const emergencyDoc = doctors.find((d) => d.department === 'Emergency') || doctors[0];
    const newAppt = {
      id: apptId,
      patientId: bookForm.patientId,
      patientName: bookForm.patientName,
      doctorId: emergencyDoc.id,
      doctorName: emergencyDoc.name,
      department: 'Emergency',
      date: new Date().toISOString().split('T')[0],
      time: 'Immediate Walk-In',
      type: 'Emergency',
      status: 'confirmed',
      reason: 'Urgent Emergency Walk-in Triage',
      fee: 1000,
      tokenNumber: `EMG-${nextSeq}`,
    };

    saveCustomAppointment(newAppt);
    refreshList();
    setIsWalkInOpen(false);
    showToast(`Emergency walk-in slot allocated: Token #${newAppt.tokenNumber} with ${newAppt.doctorName}`);
  }

  // Reschedule Submit
  function handleRescheduleSubmit(e) {
    e.preventDefault();
    if (!reschedulingAppt || !rescheduleData.date) return;

    updateAppointmentRecord(reschedulingAppt.id, {
      date: rescheduleData.date,
      time: rescheduleData.time,
      status: 'confirmed',
    });
    refreshList();
    setReschedulingAppt(null);
    showToast(`Appointment ${reschedulingAppt.id} rescheduled to ${rescheduleData.date} at ${rescheduleData.time}`);
  }

  // Mark Status (e.g. Completed)
  function handleUpdateStatus(apptId, newStatus) {
    updateAppointmentRecord(apptId, { status: newStatus });
    refreshList();
    showToast(`Appointment status updated to ${newStatus.toUpperCase()}`);
    if (viewingAppt?.id === apptId) {
      setViewingAppt((prev) => ({ ...prev, status: newStatus }));
    }
  }

  // Cancel Appointment Submit
  function handleCancelSubmit() {
    if (!cancellingAppt) return;
    const reasonText = cancelReason.trim() || 'Patient requested cancellation';
    cancelAppointmentRecord(cancellingAppt.id, reasonText);
    refreshList();
    setCancellingAppt(null);
    setCancelReason('');
    showToast(`Appointment ${cancellingAppt.id} cancelled. Reason recorded.`);
  }

  // Export CSV
  function handleExportCSV() {
    const headers = ['Token #', 'Appt ID', 'Patient', 'UHID', 'Doctor', 'Department', 'Date', 'Time', 'Type', 'Fee', 'Status'];
    const rows = filteredAppointments.map((a) => [
      a.tokenNumber || 'N/A',
      a.id,
      a.patientName,
      a.patientId,
      a.doctorName,
      a.department,
      a.date,
      a.time,
      a.type,
      a.fee || 600,
      a.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Appointments_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppLayout title="Appointment Management">
      {/* ── Page Header & Quick Actions ─────────────────────────────────── */}
      <div className="dashboard-header-row">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
            Consultation Scheduling &amp; Appointments
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Master hospital appointment queue, doctor chamber rosters, and administrative rescheduling.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Calendar (CSV)
          </Button>
          <Button
            variant="secondary"
            icon={Zap}
            onClick={() => setIsWalkInOpen(true)}
            style={{ color: '#b91c1c', borderColor: '#fecaca', background: '#fef2f2' }}
          >
            Emergency Walk-In
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsBookOpen(true)}>
            Book Consultation
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          style={{
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            color: 'var(--color-success)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* ── KPI Stat Row ────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#eff6ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.total}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Appointments</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#eff6ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.confirmed}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Confirmed / Active</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.completed}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Completed Today</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.pending}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pending Clearance</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.cancelled}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Cancelled Log</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 380 }}>
            <input
              type="text"
              placeholder="Search by patient, UHID, doctor, reason..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: 36, height: 38 }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Department Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Dept:
              </span>
              <select
                className="form-select"
                style={{ height: 38, padding: '0 32px 0 12px', fontSize: '12px' }}
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Type:
              </span>
              <select
                className="form-select"
                style={{ height: 38, padding: '0 32px 0 12px', fontSize: '12px' }}
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Types</option>
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div className="dashboard-filter-group">
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`dashboard-filter-btn ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Appointments Table ──────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Token &amp; ID</th>
                <th>Patient Details</th>
                <th>Doctor &amp; Department</th>
                <th>Scheduled Date &amp; Slot</th>
                <th>Type &amp; Reason</th>
                <th>Fee</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.length > 0 ? (
                paginatedAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                        #{appt.tokenNumber || appt.id.replace('A-', '')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{appt.id}</div>
                    </td>

                    <td>
                      <div className="font-medium" style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                        {appt.patientName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{appt.patientId}</div>
                    </td>

                    <td>
                      <div className="font-medium">{appt.doctorName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{appt.department}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 500 }}>{appt.date}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> {appt.time}
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: appt.type === 'Emergency' ? '#fef2f2' : '#f1f5f9',
                          color: appt.type === 'Emergency' ? '#dc2626' : '#334155',
                          fontWeight: 600,
                        }}
                      >
                        {appt.type}
                      </span>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-secondary)',
                          maxWidth: 180,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: 2,
                        }}
                      >
                        {appt.reason}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-success)', fontSize: '12px' }}>
                        ₹{appt.fee || 600}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={appt.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        {/* View Slip */}
                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setViewingAppt(appt)}
                          title="View Consultation Details"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Mark Completed if confirmed */}
                        {appt.status === 'confirmed' && (
                          <button
                            type="button"
                            className="btn-icon btn-secondary"
                            onClick={() => handleUpdateStatus(appt.id, 'completed')}
                            title="Mark Completed"
                            style={{ color: 'var(--color-success)' }}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}

                        {/* Reschedule if not cancelled/completed */}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button
                            type="button"
                            className="btn-icon btn-secondary"
                            onClick={() => {
                              setReschedulingAppt(appt);
                              setRescheduleData({ date: appt.date, time: appt.time });
                            }}
                            title="Reschedule Appointment"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}

                        {/* Cancel Appointment */}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button
                            type="button"
                            className="btn-icon btn-secondary"
                            onClick={() => setCancellingAppt(appt)}
                            title="Cancel Appointment"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No appointments match the selected search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="pagination-container">
          <div>
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)} of {filteredAppointments.length} bookings
          </div>
          <div className="pagination-btn-group">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </Button>
            <span style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ── MODAL: Book Appointment ─────────────────────────────────────── */}
      <Modal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule Clinical Consultation"
        subtitle="Book an outpatient consultation slot with designated specialist"
        maxWidth="640px"
      >
        <form onSubmit={handleBookSubmit}>
          <div className="form-group">
            <label htmlFor="book-patient" className="form-label required">
              Select Registered Patient
            </label>
            <select
              id="book-patient"
              className="form-select"
              value={bookForm.patientId}
              onChange={(e) => handlePatientChange(e.target.value)}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.uhid || p.id} • {p.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="book-dept" className="form-label required">
                Medical Department
              </label>
              <select
                id="book-dept"
                className="form-select"
                value={bookForm.department}
                onChange={(e) => handleDeptChange(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="book-doc" className="form-label required">
                Consulting Physician
              </label>
              <select
                id="book-doc"
                className="form-select"
                value={bookForm.doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
              >
                {doctors
                  .filter((d) => d.department === bookForm.department || !bookForm.department)
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} (Fee: ₹{doc.fee})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <InputField
              id="book-date"
              label="Consultation Date"
              type="date"
              required
              value={bookForm.date}
              onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
            />

            <div className="form-group">
              <label htmlFor="book-slot" className="form-label required">
                Available Time Slot
              </label>
              <select
                id="book-slot"
                className="form-select"
                value={bookForm.time}
                onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} AM/PM
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="book-type" className="form-label required">
                Consultation Type
              </label>
              <select
                id="book-type"
                className="form-select"
                value={bookForm.type}
                onChange={(e) => setBookForm({ ...bookForm, type: e.target.value })}
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              id="book-fee"
              label="Standard Consultation Fee (₹)"
              type="number"
              value={bookForm.fee}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="book-reason" className="form-label required">
              Reason for Visit / Chief Symptoms
            </label>
            <input
              id="book-reason"
              className="form-input"
              placeholder="e.g. Chronic knee pain, follow-up on medication"
              value={bookForm.reason}
              onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
            />
            {formErrors.reason && <span className="form-error">{formErrors.reason}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setIsBookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Booking &amp; Issue Token
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Emergency Walk-In Fast-Track ──────────────────────────── */}
      <Modal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        title="Emergency Walk-In Allocation"
        subtitle="Immediate priority queue allocation for acute emergency triage"
        maxWidth="500px"
      >
        <form onSubmit={handleEmergencyWalkInSubmit}>
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 16,
              color: '#991b1b',
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              This assigns an immediate priority token with the Emergency Medicine Consultant on duty.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label required">Select Patient for Emergency Triage</label>
            <select
              className="form-select"
              value={bookForm.patientId}
              onChange={(e) => handlePatientChange(e.target.value)}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.uhid || p.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setIsWalkInOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" icon={Zap}>
              Issue Emergency Token
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Reschedule Appointment ───────────────────────────────── */}
      {reschedulingAppt && (
        <Modal
          isOpen={!!reschedulingAppt}
          onClose={() => setReschedulingAppt(null)}
          title={`Reschedule Booking: #${reschedulingAppt.tokenNumber || reschedulingAppt.id}`}
          subtitle={`Patient: ${reschedulingAppt.patientName} with ${reschedulingAppt.doctorName}`}
          maxWidth="500px"
        >
          <form onSubmit={handleRescheduleSubmit}>
            <InputField
              id="reschedule-date"
              label="New Appointment Date"
              type="date"
              required
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
            />

            <div className="form-group">
              <label htmlFor="reschedule-slot" className="form-label required">
                New Available Time Slot
              </label>
              <select
                id="reschedule-slot"
                className="form-select"
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} AM/PM
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setReschedulingAppt(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm Reschedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Cancel with Reason Logging ───────────────────────────── */}
      {cancellingAppt && (
        <Modal
          isOpen={!!cancellingAppt}
          onClose={() => setCancellingAppt(null)}
          title="Cancel Appointment Booking"
          subtitle={`Appointment ${cancellingAppt.id} • ${cancellingAppt.patientName}`}
          maxWidth="500px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <Button variant="secondary" onClick={() => setCancellingAppt(null)}>
                Keep Appointment
              </Button>
              <Button variant="danger" onClick={handleCancelSubmit}>
                Confirm Cancellation
              </Button>
            </div>
          }
        >
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 14 }}>
            In accordance with hospital policy, all appointment cancellations must record an official administrative reason for audit logs.
          </div>

          <div className="form-group">
            <label htmlFor="cancel-reason-input" className="form-label required">
              Reason for Cancellation
            </label>
            <textarea
              id="cancel-reason-input"
              className="form-textarea"
              rows={3}
              placeholder="e.g. Doctor called for emergency surgery, Patient requested cancellation, Unreachable..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}

      {/* ── MODAL: View Consultation Slip ───────────────────────────────── */}
      {viewingAppt && (
        <Modal
          isOpen={!!viewingAppt}
          onClose={() => setViewingAppt(null)}
          title={`Appointment Details: #${viewingAppt.tokenNumber || viewingAppt.id}`}
          subtitle={`Booking ID: ${viewingAppt.id}`}
          maxWidth="580px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
                Print Token Slip
              </Button>
              <Button variant="secondary" onClick={() => setViewingAppt(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="patient-profile-header">
            <div className="patient-avatar-box">
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                Token #{viewingAppt.tokenNumber || viewingAppt.id}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {viewingAppt.date} at {viewingAppt.time} • {viewingAppt.type}
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={viewingAppt.status} />
              </div>
            </div>
          </div>

          <div className="patient-section-block">
            <div className="patient-section-label">Patient &amp; Physician Details</div>
            <div className="patient-info-row">
              <div className="patient-info-item">
                <span>Patient Name</span>
                <span>{viewingAppt.patientName}</span>
              </div>
              <div className="patient-info-item">
                <span>Patient ID / UHID</span>
                <span>{viewingAppt.patientId}</span>
              </div>
              <div className="patient-info-item">
                <span>Assigned Physician</span>
                <span>{viewingAppt.doctorName}</span>
              </div>
              <div className="patient-info-item">
                <span>Department</span>
                <span>{viewingAppt.department}</span>
              </div>
              <div className="patient-info-item">
                <span>Consultation Fee</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                  ₹{viewingAppt.fee || 600} (Standard OPD)
                </span>
              </div>
              <div className="patient-info-item">
                <span>Chief Reason / Symptoms</span>
                <span>{viewingAppt.reason}</span>
              </div>
            </div>

            {viewingAppt.cancellationReason && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginTop: 14,
                  fontSize: 'var(--font-size-xs)',
                  color: '#991b1b',
                }}
              >
                <strong>Cancellation Audit Note:</strong>
                <p style={{ marginTop: 2 }}>{viewingAppt.cancellationReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
