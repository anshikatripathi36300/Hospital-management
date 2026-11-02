/**
 * ReceptionistDashboard.jsx — Receptionist Front Desk Control Center (Part 10)
 *
 * Provides the receptionist with:
 * - Real-time metrics: Today's Appointments, Lobby Waiting Queue, Checked-In Tokens, Doctors On Duty
 * - Quick Action Buttons: Patient Intake, Walk-in Booking, Fast Check-In, Doctor Chambers
 * - Live OPD Queue Table with instant Check-In, Call Token, and consultation indicators
 * - Visual live chamber feed showing doctors currently consulting
 */
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getAllAppointments,
  updateAppointmentRecord,
  getAllPatients,
  getAllDoctors,
  saveCustomAppointment,
} from '../../data/demoData';
import {
  Calendar,
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  UserPlus,
  Stethoscope,
  PlusCircle,
  ArrowRight,
  Search,
  Bell,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

export default function ReceptionistDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [toast, setToast] = useState('');

  // Quick Walk-in Modal
  const [walkInModal, setWalkInModal] = useState(false);
  const [walkInPatientId, setWalkInPatientId] = useState('');
  const [walkInDoctorId, setWalkInDoctorId] = useState('');
  const [walkInReason, setWalkInReason] = useState('Urgent OPD Walk-in');

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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle patient check-in at front desk
  const handleCheckIn = (apptId) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateAppointmentRecord(apptId, {
      status: 'waiting',
      checkInTime: timeStr,
    });
    loadData();
    showToast(`Patient checked in at ${timeStr}. Token added to waiting queue.`);
  };

  // Open walk-in modal
  const handleOpenWalkIn = () => {
    if (patients.length > 0) setWalkInPatientId(patients[0].id);
    if (doctors.length > 0) setWalkInDoctorId(doctors[0].id);
    setWalkInReason('Urgent OPD Walk-in');
    setWalkInModal(true);
  };

  const handleSaveWalkIn = (e) => {
    e.preventDefault();
    const targetPatient = patients.find((p) => p.id === walkInPatientId);
    const targetDoctor = doctors.find((d) => d.id === walkInDoctorId);
    if (!targetPatient || !targetDoctor) return;

    const nextTokenNum = appointments.length + 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAppt = {
      id: `APT-${Date.now().toString().slice(-6)}`,
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      doctorId: targetDoctor.id,
      doctorName: targetDoctor.name,
      department: targetDoctor.department,
      date: new Date().toISOString().split('T')[0],
      time: timeStr,
      type: 'Walk-In Emergency',
      status: 'waiting',
      reason: walkInReason,
      fee: targetDoctor.consultationFee || 600,
      chamber: targetDoctor.chamber || 'Room 302',
      tokenNumber: nextTokenNum,
      checkInTime: timeStr,
    };

    saveCustomAppointment(newAppt);
    loadData();
    setWalkInModal(false);
    showToast(`Walk-In Token #${nextTokenNum} issued for ${targetPatient.name}`);
  };

  // Metrics
  const todayStr = '2024-10-28';
  const todayAppts = appointments.filter((a) => a.date === todayStr || a.status === 'confirmed' || a.status === 'waiting');
  const waitingCount = appointments.filter((a) => a.status === 'waiting').length;
  const inConsultCount = appointments.filter((a) => a.status === 'in-progress').length;
  const activeDoctors = doctors.filter((d) => d.status === 'active' || d.status === 'available');

  return (
    <AppLayout title="Receptionist Dashboard">
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

      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0e7490 0%, #0284c7 100%)',
          color: 'white',
          marginBottom: 24,
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Main Lobby Front Desk · Desk 01
            </span>
            <span style={{ fontSize: 13, opacity: 0.9 }}>
              Shift: Morning (08:00 - 16:00)
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Welcome, {currentUser?.name || 'Anjali Nair'}
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 'var(--font-size-sm)' }}>
            Patient intake, appointment booking, OPD tokens, and physician schedule inquiries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/receptionist/register-patient">
            <Button
              variant="secondary"
              icon={UserPlus}
              style={{ background: 'white', color: '#0e7490', border: 'none', fontWeight: 700 }}
            >
              Register Patient
            </Button>
          </Link>
          <Button
            variant="outline"
            icon={PlusCircle}
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            onClick={handleOpenWalkIn}
          >
            Walk-in OPD Token
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Link to="/receptionist/appointments" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8',
              }}
            >
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{todayAppts.length}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Today's Appointments
              </div>
            </div>
          </div>
        </Link>

        <Link to="/receptionist/queue" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{waitingCount}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                In Waiting Lobby
              </div>
            </div>
          </div>
        </Link>

        <Link to="/receptionist/queue" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <Stethoscope size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{inConsultCount}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                In Consultation
              </div>
            </div>
          </div>
        </Link>

        <Link to="/receptionist/schedules" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{activeDoctors.length}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Doctors On Duty Today
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Front Desk Appointments / Check-in Feed & Doctor Chambers */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Front Desk Live Queue & Check-in Desk */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--color-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Live Front Desk Check-In Desk
              </h3>
            </div>
            <Link
              to="/receptionist/queue"
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              Full Queue Screen <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Name</th>
                  <th>Consulting Doctor</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Desk Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 7).map((appt, idx) => (
                  <tr key={appt.id}>
                    <td>
                      <span className={`token-badge ${appt.status === 'waiting' ? 'token-badge-waiting' : appt.status === 'in-progress' ? 'token-badge-serving' : ''}`}>
                        #{appt.tokenNumber || idx + 1}
                      </span>
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
                        {appt.department} · {appt.chamber || 'Chamber 302'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{appt.time}</td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {appt.status !== 'waiting' && appt.status !== 'in-progress' && appt.status !== 'completed' && appt.status !== 'cancelled' ? (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => handleCheckIn(appt.id)}
                        >
                          Check In
                        </button>
                      ) : appt.status === 'waiting' ? (
                        <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>
                          In Lobby ({appt.checkInTime || 'Waiting'})
                        </span>
                      ) : appt.status === 'in-progress' ? (
                        <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>
                          In Chamber
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {appt.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Doctor Chamber Status Quick Glance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Shortcuts */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
              Front Desk Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/receptionist/register-patient"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>New Patient Intake</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Instant UHID issuance & OP card</div>
                </div>
                <ArrowRight size={16} color="var(--color-text-muted)" />
              </Link>

              <Link
                to="/receptionist/queue"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Live OPD Token Board</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Call next tokens & room display</div>
                </div>
                <ArrowRight size={16} color="var(--color-text-muted)" />
              </Link>

              <Link
                to="/receptionist/schedules"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Doctor Chambers & Roster</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Chamber numbers & available quotas</div>
                </div>
                <ArrowRight size={16} color="var(--color-text-muted)" />
              </Link>
            </div>
          </div>

          {/* Consulting Chambers Mini-Widget */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Active Doctor Chambers
              </h3>
              <Link to="/receptionist/schedules" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                All Chambers
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {doctors.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 10,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{doc.name}</div>
                    <div style={{ color: '#64748b' }}>{doc.department} · {doc.chamber || 'Room 302'}</div>
                  </div>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  >
                    In Chamber
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Walk-In Fast Booking Modal */}
      {walkInModal && (
        <Modal
          isOpen={walkInModal}
          onClose={() => setWalkInModal(false)}
          title="Issue Walk-In OPD Token"
          subtitle="Direct front-desk patient queue entry for emergency or walk-in consultation"
        >
          <form onSubmit={handleSaveWalkIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Select Patient
              </label>
              <select
                className="form-control"
                required
                value={walkInPatientId}
                onChange={(e) => setWalkInPatientId(e.target.value)}
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
                Assign Consulting Doctor & Chamber
              </label>
              <select
                className="form-control"
                required
                value={walkInDoctorId}
                onChange={(e) => setWalkInDoctorId(e.target.value)}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.department} ({d.chamber || 'Room 302'}) · Fee: ₹{d.consultationFee || 600}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Visit Reason & Chief Complaints
              </label>
              <input
                type="text"
                className="form-control"
                required
                value={walkInReason}
                onChange={(e) => setWalkInReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setWalkInModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Generate Token & Check In
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
