/**
 * ReceptionistAppointments.jsx — Front Desk Appointment Desk (Part 10)
 *
 * Features:
 * - Master appointment roster for the reception desk
 * - Administrative booking modal with live doctor fee & chamber lookup
 * - Arriving patient check-in action (marks as 'waiting' in lobby)
 * - Self-service rescheduling and cancellation modal with audit logs
 * - Printable OPD Token & Appointment Voucher
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  getAllAppointments,
  saveCustomAppointment,
  updateAppointmentRecord,
  cancelAppointmentRecord,
  getAllPatients,
  getAllDoctors,
  getAllDepartments,
} from '../../data/demoData';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  PlusCircle,
  Printer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

const RECEPTION_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '02:30 PM',
  '03:15 PM',
  '04:00 PM',
  '04:45 PM',
  '05:30 PM',
];

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [bookModal, setBookModal] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [slipModal, setSlipModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [toast, setToast] = useState('');

  // Booking Form State
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookSlot, setBookSlot] = useState(RECEPTION_SLOTS[0]);
  const [bookType, setBookType] = useState('Consultation');
  const [bookReason, setBookReason] = useState('General Consultation');

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState(RECEPTION_SLOTS[0]);

  // Cancel Form State
  const [cancelReason, setCancelReason] = useState('Patient requested cancellation at reception desk');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    const allAppts = getAllAppointments();
    setAppointments(allAppts);

    const allPts = getAllPatients();
    setPatients(allPts);

    const allDocs = getAllDoctors();
    setDoctors(allDocs);

    const allDepts = getAllDepartments();
    setDepartments(allDepts);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Arrived / Check In
  const handleCheckIn = (apptId) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateAppointmentRecord(apptId, {
      status: 'waiting',
      checkInTime: timeStr,
    });
    loadData();
    showToast(`Patient checked in at ${timeStr}. Status updated to Waiting.`);
  };

  // Open Booking Modal
  const handleOpenBookModal = () => {
    if (patients.length > 0) setPatientId(patients[0].id);
    if (doctors.length > 0) setDoctorId(doctors[0].id);
    setBookDate(new Date().toISOString().split('T')[0]);
    setBookSlot(RECEPTION_SLOTS[0]);
    setBookType('Consultation');
    setBookReason('General Consultation');
    setBookModal(true);
  };

  const handleSaveBooking = (e) => {
    e.preventDefault();
    const targetPatient = patients.find((p) => p.id === patientId);
    const targetDoctor = doctors.find((d) => d.id === doctorId);
    if (!targetPatient || !targetDoctor) return;

    const nextTokenNum = appointments.length + 1;
    const newAppt = {
      id: `APT-${Date.now().toString().slice(-6)}`,
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      doctorId: targetDoctor.id,
      doctorName: targetDoctor.name,
      department: targetDoctor.department,
      date: bookDate,
      time: bookSlot,
      type: bookType,
      status: 'confirmed',
      reason: bookReason,
      fee: targetDoctor.consultationFee || 600,
      chamber: targetDoctor.chamber || 'Room 302',
      tokenNumber: nextTokenNum,
    };

    saveCustomAppointment(newAppt);
    loadData();
    setBookModal(false);
    showToast(`Appointment ${newAppt.id} booked (Token #${nextTokenNum}).`);
    setSelectedAppt(newAppt);
    setSlipModal(true);
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (appt) => {
    setSelectedAppt(appt);
    setRescheduleDate(appt.date);
    setRescheduleSlot(appt.time);
    setRescheduleModal(true);
  };

  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!selectedAppt || !rescheduleDate || !rescheduleSlot) return;
    updateAppointmentRecord(selectedAppt.id, {
      date: rescheduleDate,
      time: rescheduleSlot,
    });
    setRescheduleModal(false);
    loadData();
    showToast(`Appointment ${selectedAppt.id} rescheduled to ${rescheduleDate} at ${rescheduleSlot}.`);
  };

  // Open Cancel Modal
  const handleOpenCancel = (appt) => {
    setSelectedAppt(appt);
    setCancelReason('Patient requested cancellation at reception desk');
    setCancelModal(true);
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    cancelAppointmentRecord(selectedAppt.id, cancelReason);
    setCancelModal(false);
    loadData();
    showToast(`Appointment ${selectedAppt.id} cancelled.`);
  };

  const handleOpenSlip = (appt) => {
    setSelectedAppt(appt);
    setSlipModal(true);
  };

  // Filtered Appointments
  const filtered = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      a.patientName.toLowerCase().includes(term) ||
      a.patientId.toLowerCase().includes(term) ||
      a.doctorName.toLowerCase().includes(term) ||
      a.id.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesDept = deptFilter === 'all' || a.department === deptFilter;
    const matchesDate = !dateFilter || a.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDept && matchesDate;
  });

  return (
    <AppLayout title="Appointments Desk">
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Front Desk Appointments</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Book walk-in consultations, handle patient check-ins, reschedule slots, and print token slips.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={handleOpenBookModal}>
          Book New Appointment
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
            placeholder="Search patient name, UHID, doctor, or ID..."
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
            <option value="confirmed">Confirmed</option>
            <option value="waiting">Waiting in Lobby</option>
            <option value="in-progress">In Consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <select
          className="form-control"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{ minWidth: 150 }}
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="form-control"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        {dateFilter && (
          <button
            className="btn btn-sm btn-outline"
            style={{ fontSize: 11 }}
            onClick={() => setDateFilter('')}
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Appointments Master Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Token #</th>
                <th>Appt ID</th>
                <th>Patient Details</th>
                <th>Doctor & Chamber</th>
                <th>Schedule</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Desk Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No appointments match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((appt, idx) => (
                  <tr key={appt.id}>
                    <td>
                      <span className={`token-badge ${appt.status === 'waiting' ? 'token-badge-waiting' : appt.status === 'in-progress' ? 'token-badge-serving' : ''}`}>
                        #{appt.tokenNumber || idx + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                      {appt.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        UHID: {appt.patientId} · {appt.type}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.doctorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {appt.department} · {appt.chamber || 'Room 302'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.time}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{appt.date}</div>
                    </td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {appt.status !== 'waiting' && appt.status !== 'in-progress' && appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => handleCheckIn(appt.id)}
                            title="Mark Patient Arrived at Lobby"
                          >
                            Check In
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => handleOpenSlip(appt)}
                          title="Print Token Slip"
                        >
                          <Printer size={13} />
                        </button>

                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <>
                            <button
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: 11, padding: '4px 8px' }}
                              onClick={() => handleOpenReschedule(appt)}
                              title="Reschedule Slot"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              style={{ fontSize: 11, padding: '4px 8px' }}
                              onClick={() => handleOpenCancel(appt)}
                              title="Cancel Consultation"
                            >
                              <XCircle size={13} />
                            </button>
                          </>
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

      {/* Modal: Book Front-Desk Appointment */}
      {bookModal && (
        <Modal
          isOpen={bookModal}
          onClose={() => setBookModal(false)}
          title="Book Front-Desk OPD Appointment"
          subtitle="Generate consultation token and register in doctor queue"
        >
          <form onSubmit={handleSaveBooking} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Select Registered Patient
              </label>
              <select
                className="form-control"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.uhid}) — {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Consulting Physician & Chamber
              </label>
              <select
                className="form-control"
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.department} ({d.chamber || 'Room 302'}) · Fee: ₹{d.consultationFee || 600}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Time Slot
                </label>
                <select
                  className="form-control"
                  value={bookSlot}
                  onChange={(e) => setBookSlot(e.target.value)}
                >
                  {RECEPTION_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Consultation Type
                </label>
                <select
                  className="form-control"
                  value={bookType}
                  onChange={(e) => setBookType(e.target.value)}
                >
                  <option value="Consultation">OPD Consultation</option>
                  <option value="Follow-up">Follow-up Review</option>
                  <option value="Routine">Routine Checkup</option>
                  <option value="Emergency">Emergency Fast-Track</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Symptoms / Reason
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setBookModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Issue Token & Confirm
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Reschedule Appointment */}
      {rescheduleModal && selectedAppt && (
        <Modal
          isOpen={rescheduleModal}
          onClose={() => setRescheduleModal(false)}
          title={`Reschedule Consultation: ${selectedAppt.id}`}
          subtitle={`Patient: ${selectedAppt.patientName} · Doctor: ${selectedAppt.doctorName}`}
        >
          <form onSubmit={handleSaveReschedule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                New Date
              </label>
              <input
                type="date"
                className="form-control"
                required
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                New Time Slot
              </label>
              <select
                className="form-control"
                value={rescheduleSlot}
                onChange={(e) => setRescheduleSlot(e.target.value)}
              >
                {RECEPTION_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setRescheduleModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Save Reschedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Cancel Appointment */}
      {cancelModal && selectedAppt && (
        <Modal
          isOpen={cancelModal}
          onClose={() => setCancelModal(false)}
          title={`Cancel Appointment — ${selectedAppt.id}`}
        >
          <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Audit Reason for Cancellation
              </label>
              <textarea
                className="form-control"
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
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

      {/* Modal: Print Token Slip */}
      {slipModal && selectedAppt && (
        <Modal
          isOpen={slipModal}
          onClose={() => setSlipModal(false)}
          title={`OPD Token Voucher — ${selectedAppt.id}`}
        >
          <div className="printable-area">
            <div
              style={{
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
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
                    OPD Token & Consultation Slip
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Token Number</div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: 'var(--color-primary)',
                    }}
                  >
                    #{selectedAppt.tokenNumber || 1}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 'var(--font-size-sm)' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Patient</span>
                  <div style={{ fontWeight: 700 }}>{selectedAppt.patientName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>UHID: {selectedAppt.patientId}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Consulting Physician</span>
                  <div style={{ fontWeight: 700 }}>{selectedAppt.doctorName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{selectedAppt.department}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Schedule</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{selectedAppt.date} at {selectedAppt.time}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Chamber Location</span>
                  <div style={{ fontWeight: 700 }}>{selectedAppt.chamber || 'Room 302'}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Consultation Fee</span>
                  <div style={{ fontWeight: 800, color: '#16a34a' }}>₹{selectedAppt.fee || 600}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Status</span>
                  <div>
                    <StatusBadge status={selectedAppt.status} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #cbd5e1', fontSize: 11, color: '#64748b', textAlign: 'center' }}>
                Please proceed to the 3rd floor waiting lobby. Your token number will be called when the doctor is ready.
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setSlipModal(false)}>
              Close
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Print Token Slip
            </Button>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
