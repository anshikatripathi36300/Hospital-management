/**
 * DoctorAppointments.jsx — Doctor's Consultation Schedule & Queue (Part 8)
 *
 * Features:
 * - Scoped appointment roster for the attending physician
 * - Date, status, and patient search filters
 * - Live queue management (Waiting -> In-Consultation -> Completed)
 * - Clinical consultation notes logging
 * - Direct link to generate digital prescription for selected patient
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getAllAppointments,
  updateAppointmentRecord,
  cancelAppointmentRecord,
} from '../../data/demoData';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  PlusCircle,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';

export default function DoctorAppointments() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Consultation modal state
  const [consultModal, setConsultModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notes, setNotes] = useState('');

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadAppointments = useCallback(() => {
    const all = getAllAppointments();
    const docAppts = all.filter(
      (a) => a.doctorName === currentUser?.name || currentUser?.role === 'admin'
    );
    setAppointments(docAppts);
  }, [currentUser]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);


  // Filtered list
  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesDate = !dateFilter || a.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusChange = (id, newStatus) => {
    updateAppointmentRecord(id, { status: newStatus });
    loadAppointments();
    showToast(`Appointment status updated to ${newStatus}`);
  };

  const handleOpenConsult = (appt) => {
    setSelectedAppt(appt);
    setNotes(appt.notes || '');
    setConsultModal(true);
  };

  const handleSaveConsult = (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    updateAppointmentRecord(selectedAppt.id, {
      status: 'completed',
      notes,
    });
    setConsultModal(false);
    loadAppointments();
    showToast(`Consultation for ${selectedAppt.patientName} saved as completed.`);
  };

  const handleOpenCancel = (appt) => {
    setSelectedAppt(appt);
    setCancelReason('');
    setCancelModal(true);
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    cancelAppointmentRecord(selectedAppt.id, cancelReason || 'Cancelled by attending physician');
    setCancelModal(false);
    loadAppointments();
    showToast(`Appointment ${selectedAppt.id} cancelled.`);
  };

  return (
    <AppLayout title="Doctor Appointments">
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--color-primary)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Consultation Schedule</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Manage your daily patient queue, consultation progress, and clinical logs.
          </p>
        </div>
        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => navigate('/doctor/prescriptions')}
        >
          Prescribe Medication
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search patient name, UHID, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--color-text-muted)" />
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed / Waiting</option>
            <option value="in-progress">In Consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} color="var(--color-text-muted)" />
          <input
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setDateFilter('')}
              style={{ fontSize: 11 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Appointments Roster Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Time & Date</th>
                <th>Patient Details</th>
                <th>Type</th>
                <th>Status</th>
                <th>Consultation Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No appointments found matching your search filters.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {appt.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.time}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{appt.date}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          <User size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{appt.patientName}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            UHID: {appt.patientId} · {appt.reason || 'General Followup'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: '#f1f5f9',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {appt.type}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td style={{ maxWidth: 220, fontSize: 12 }}>
                      {appt.notes ? (
                        <span style={{ color: 'var(--color-text)', fontStyle: 'italic' }}>
                          "{appt.notes.length > 50 ? appt.notes.slice(0, 50) + '...' : appt.notes}"
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Pending examination</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {appt.status !== 'in-progress' && appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm"
                            style={{
                              background: '#fef3c7',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              fontSize: 11,
                              padding: '4px 8px',
                            }}
                            onClick={() => handleStatusChange(appt.id, 'in-progress')}
                          >
                            Call In
                          </button>
                        )}

                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => handleOpenConsult(appt)}
                          >
                            Consult
                          </button>
                        )}

                        {appt.status === 'completed' && (
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => handleOpenConsult(appt)}
                          >
                            View Notes
                          </button>
                        )}

                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button
                            className="btn btn-sm"
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              fontSize: 11,
                              padding: '4px 8px',
                            }}
                            onClick={() => handleOpenCancel(appt)}
                            title="Cancel Consultation"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consultation Summary Modal */}
      {consultModal && selectedAppt && (
        <Modal
          isOpen={consultModal}
          onClose={() => setConsultModal(false)}
          title={`Clinical Consultation: ${selectedAppt.patientName}`}
          subtitle={`Appt: ${selectedAppt.id} · Chamber: 302 · Date: ${selectedAppt.date}`}
        >
          <form onSubmit={handleSaveConsult} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <div><strong>Patient UHID:</strong> {selectedAppt.patientId}</div>
              <div><strong>Chief Complaint:</strong> {selectedAppt.reason || 'General Medical Consultation'}</div>
              <div><strong>Consulting Doctor:</strong> {currentUser?.name}</div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Clinical Findings & Medical Advice
              </label>
              <textarea
                className="form-control"
                rows={5}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document patient vitals, diagnosis, differential diagnosis, and recommended lifestyle adjustments..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <Button
                type="button"
                variant="outline"
                icon={PlusCircle}
                onClick={() => {
                  setConsultModal(false);
                  navigate('/doctor/prescriptions');
                }}
              >
                Draft Prescription Now
              </Button>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => setConsultModal(false)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" icon={CheckCircle2}>
                  Complete Consultation
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel Appointment Modal */}
      {cancelModal && selectedAppt && (
        <Modal
          isOpen={cancelModal}
          onClose={() => setCancelModal(false)}
          title={`Cancel Consultation: ${selectedAppt.id}`}
        >
          <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              Are you sure you wish to cancel the consultation for <strong>{selectedAppt.patientName}</strong>?
            </p>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Reason for Cancellation (Required for Patient Notification)
              </label>
              <textarea
                className="form-control"
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Doctor called into emergency surgery, clinic rescheduled..."
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="secondary" onClick={() => setCancelModal(false)}>
                Back
              </Button>
              <Button type="submit" variant="danger" icon={XCircle}>
                Confirm Cancellation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
