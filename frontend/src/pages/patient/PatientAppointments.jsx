/**
 * PatientAppointments.jsx — Patient's Consultation Roster & Management (Part 9)
 *
 * Features:
 * - Scoped list of upcoming and historical appointments
 * - Filter by Upcoming, Completed, and Cancelled
 * - Self-service rescheduling modal
 * - Appointment cancellation with refund / hospital policy reminder
 * - Printable confirmation voucher
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  Printer,
  XCircle,
  RotateCcw,
  CheckCircle2,
  PlusCircle,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

const RESCHEDULE_SLOTS = [
  '09:30 AM',
  '10:30 AM',
  '11:45 AM',
  '02:30 PM',
  '04:15 PM',
  '05:30 PM',
];

export default function PatientAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('upcoming');

  // Modals
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [slipModal, setSlipModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Reschedule state
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(RESCHEDULE_SLOTS[0]);

  // Cancel state
  const [cancelReason, setCancelReason] = useState('Personal emergency');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadAppointments = useCallback(() => {
    const patId = currentUser?.patientId || 'P-001';
    const all = getAllAppointments();
    const mine = all.filter(
      (a) => a.patientId === patId || a.patientName === currentUser?.name
    );
    setAppointments(mine);
  }, [currentUser]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);


  // Tab filtering
  const filtered = appointments.filter((a) => {
    if (tab === 'upcoming') return a.status === 'confirmed' || a.status === 'scheduled' || a.status === 'in-progress';
    if (tab === 'completed') return a.status === 'completed';
    if (tab === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  const handleOpenReschedule = (appt) => {
    setSelectedAppt(appt);
    setNewDate(appt.date);
    setNewSlot(appt.time);
    setRescheduleModal(true);
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (!selectedAppt || !newDate || !newSlot) return;
    updateAppointmentRecord(selectedAppt.id, {
      date: newDate,
      time: newSlot,
    });
    setRescheduleModal(false);
    loadAppointments();
    showToast(`Appointment ${selectedAppt.id} successfully rescheduled to ${newDate} at ${newSlot}`);
  };

  const handleOpenCancel = (appt) => {
    setSelectedAppt(appt);
    setCancelReason('Patient requested cancellation');
    setCancelModal(true);
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    cancelAppointmentRecord(selectedAppt.id, cancelReason);
    setCancelModal(false);
    loadAppointments();
    showToast(`Appointment ${selectedAppt.id} has been cancelled.`);
  };

  const handleOpenSlip = (appt) => {
    setSelectedAppt(appt);
    setSlipModal(true);
  };

  return (
    <AppLayout title="My Appointments">
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Appointments</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            View your consultation history, reschedule upcoming slots, and print confirmation slips.
          </p>
        </div>
        <Link to="/patient/book-appointment">
          <Button variant="primary" icon={PlusCircle}>
            Book New Consultation
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 8,
        }}
      >
        {[
          { key: 'upcoming', label: 'Upcoming Consultations' },
          { key: 'completed', label: 'Completed Visits' },
          { key: 'cancelled', label: 'Cancelled' },
          { key: 'all', label: 'All Records' },
        ].map((t) => (
          <button
            key={t.key}
            className="btn btn-sm"
            style={{
              background: tab === t.key ? 'var(--color-primary)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Appointments Cards List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Calendar size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ margin: '0 0 14px' }}>No appointments found in this category.</p>
          <Link to="/patient/book-appointment">
            <Button variant="primary" icon={PlusCircle}>
              Book Consultation Now
            </Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((appt) => (
            <div
              key={appt.id}
              className="card"
              style={{
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 13 }}>
                    {appt.id}
                  </span>
                  <StatusBadge status={appt.status} />
                  <span
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {appt.type}
                  </span>
                </div>

                <h3 style={{ margin: '6px 0 2px', fontSize: '1.15rem', fontWeight: 800 }}>
                  {appt.doctorName}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {appt.department} Department · {appt.chamber || 'Room 302'}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginTop: 10,
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={15} color="var(--color-primary)" />
                    {appt.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} color="var(--color-primary)" />
                    {appt.time}
                  </div>
                </div>

                {appt.notes && (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#475569',
                      marginTop: 8,
                      background: '#f8fafc',
                      padding: '6px 10px',
                      borderRadius: 4,
                      fontStyle: 'italic',
                    }}
                  >
                    Doctor Advice: "{appt.notes}"
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => handleOpenSlip(appt)}
                >
                  Slip
                </Button>

                {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => handleOpenReschedule(appt)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleOpenCancel(appt)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && selectedAppt && (
        <Modal
          isOpen={rescheduleModal}
          onClose={() => setRescheduleModal(false)}
          title={`Reschedule Consultation: ${selectedAppt.id}`}
          subtitle={`Attending Doctor: ${selectedAppt.doctorName}`}
        >
          <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Select New Consultation Date
              </label>
              <input
                type="date"
                className="form-control"
                required
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Select Preferred Time Slot
              </label>
              <select
                className="form-control"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
              >
                {RESCHEDULE_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setRescheduleModal(false)}>
                Back
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Confirm Reschedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel Appointment Modal */}
      {cancelModal && selectedAppt && (
        <Modal
          isOpen={cancelModal}
          onClose={() => setCancelModal(false)}
          title={`Cancel Consultation — ${selectedAppt.id}`}
        >
          <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                color: '#991b1b',
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                gap: 10,
              }}
            >
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Cancellation Notice:</strong> Free cancellation is permitted up to 2 hours before the scheduled time. Any prepaid consultation fees will be refunded to your original payment method.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Reason for Cancellation
              </label>
              <select
                className="form-control"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Personal emergency">Personal emergency</option>
                <option value="Symptoms improved">Symptoms improved / Feeling better</option>
                <option value="Scheduling conflict">Scheduling conflict</option>
                <option value="Visited another clinic">Consulted another physician</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="secondary" onClick={() => setCancelModal(false)}>
                Keep Appointment
              </Button>
              <Button type="submit" variant="danger" icon={XCircle}>
                Confirm Cancellation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View & Print Slip Modal */}
      {slipModal && selectedAppt && (
        <Modal
          isOpen={slipModal}
          onClose={() => setSlipModal(false)}
          title={`Appointment Voucher — ${selectedAppt.id}`}
        >
          <div className="printable-area">
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid var(--color-primary)',
                  paddingBottom: 14,
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 800 }}>
                    METROPOLITAN HOSPITAL
                  </h3>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    OPD Appointment Confirmation Slip
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b' }}>{selectedAppt.id}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Date: {selectedAppt.date}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 'var(--font-size-sm)' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Patient Name</span>
                  <div style={{ fontWeight: 700 }}>{selectedAppt.patientName}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Attending Doctor</span>
                  <div style={{ fontWeight: 700 }}>{selectedAppt.doctorName}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Department</span>
                  <div>{selectedAppt.department}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Scheduled Time</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{selectedAppt.time}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Location</span>
                  <div>{selectedAppt.chamber || 'Room 302, 3rd Floor'}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Status</span>
                  <div>
                    <StatusBadge status={selectedAppt.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setSlipModal(false)}>
              Close
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Print Voucher
            </Button>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
