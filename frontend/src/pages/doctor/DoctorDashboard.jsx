/**
 * DoctorDashboard.jsx — Doctor Portal Main Dashboard (Part 8)
 *
 * Provides the attending doctor with:
 * - Dynamic KPI metrics (Today's queue, assigned patients, pending labs, active prescriptions)
 * - Live consultation queue with instant status updates (Waiting -> In-Consultation -> Completed)
 * - Quick Action buttons to prescribe, request lab tests, or view availability
 * - Clinical shortcuts & recent patient prescriptions
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
  getAllPatients,
  getAllPrescriptions,
  getAllLabReports,
} from '../../data/demoData';
import {
  Calendar,
  Users,
  ClipboardList,
  TestTube,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  PlusCircle,
  ArrowRight,
  Stethoscope,
  Activity,
} from 'lucide-react';

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [consultModal, setConsultModal] = useState(false);
  const [activeAppt, setActiveAppt] = useState(null);
  const [consultNotes, setConsultNotes] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Load data scoped to this doctor
  const loadDoctorData = useCallback(() => {
    const allAppts = getAllAppointments();
    const docAppts = allAppts.filter(
      (a) => a.doctorName === currentUser?.name || currentUser?.role === 'admin'
    );
    setAppointments(docAppts);

    const allPts = getAllPatients();
    setPatients(allPts);

    const allRx = getAllPrescriptions();
    const docRx = allRx.filter(
      (r) => r.doctorName === currentUser?.name || currentUser?.role === 'admin'
    );
    setPrescriptions(docRx);

    const allLabs = getAllLabReports();
    const docLabs = allLabs.filter(
      (l) => l.doctorName === currentUser?.name || currentUser?.role === 'admin'
    );
    setLabReports(docLabs);
  }, [currentUser]);

  useEffect(() => {
    loadDoctorData();
  }, [loadDoctorData]);


  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Status transitions
  const handleStatusChange = (apptId, newStatus) => {
    updateAppointmentRecord(apptId, { status: newStatus });
    loadDoctorData();
    showToast(`Appointment status updated to "${newStatus}"`);
  };

  const handleOpenConsultModal = (appt) => {
    setActiveAppt(appt);
    setConsultNotes(appt.notes || '');
    setConsultModal(true);
  };

  const handleSaveConsult = (e) => {
    e.preventDefault();
    if (!activeAppt) return;
    updateAppointmentRecord(activeAppt.id, {
      status: 'completed',
      notes: consultNotes,
    });
    setConsultModal(false);
    loadDoctorData();
    showToast(`Consultation for ${activeAppt.patientName} marked as completed!`);
  };

  // KPIs
  const todayStr = '2024-10-25'; // matches demo data date
  const todayQueue = appointments.filter((a) => a.date === todayStr || a.status === 'confirmed');
  const waitingCount = todayQueue.filter((a) => a.status === 'confirmed' || a.status === 'scheduled').length;
  const inProgressCount = todayQueue.filter((a) => a.status === 'in-progress').length;
  const completedTodayCount = todayQueue.filter((a) => a.status === 'completed').length;
  const pendingLabsCount = labReports.filter((l) => l.status === 'in-progress' || l.status === 'pending').length;

  return (
    <AppLayout title="Doctor Dashboard">
      {toastMsg && (
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
          {toastMsg}
        </div>
      )}

      {/* Header Profile Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
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
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {currentUser?.specialization || 'Attending Physician'}
            </span>
            <span style={{ fontSize: 13, opacity: 0.9 }}>
              Chamber: {currentUser?.department || 'Cardiology'} Suite 302
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Welcome back, {currentUser?.name}
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 'var(--font-size-sm)' }}>
            You have {waitingCount} patients waiting in queue today. Clinic status is active.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/doctor/prescriptions">
            <Button
              variant="secondary"
              icon={PlusCircle}
              style={{ background: 'white', color: '#1e3a8a', border: 'none' }}
            >
              New Prescription
            </Button>
          </Link>
          <Link to="/doctor/lab-requests">
            <Button
              variant="outline"
              icon={TestTube}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Order Lab Test
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
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
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{waitingCount}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Patients Waiting
            </div>
          </div>
        </div>

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
            <Stethoscope size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{inProgressCount}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              In Consultation
            </div>
          </div>
        </div>

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
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{completedTodayCount}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Completed Today
            </div>
          </div>
        </div>

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
            <TestTube size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{pendingLabsCount}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Pending Lab Results
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Consultation Queue & Clinical Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Today's Consultation Queue */}
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
              <Calendar size={18} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Today's Patient Queue
              </h3>
              <span
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                }}
              >
                {todayQueue.length} Total
              </span>
            </div>
            <Link
              to="/doctor/appointments"
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
              Full Roster <ArrowRight size={14} />
            </Link>
          </div>

          {todayQueue.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Calendar size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>No appointments booked for today yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todayQueue.map((appt) => (
                    <tr key={appt.id}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} color="var(--color-text-muted)" />
                          {appt.time}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{appt.patientName}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          ID: {appt.patientId} · {appt.reason || 'Routine Checkup'}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 500,
                          }}
                        >
                          {appt.type}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={appt.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {appt.status !== 'in-progress' && appt.status !== 'completed' && (
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
                              title="Call Patient In"
                            >
                              Call In
                            </button>
                          )}
                          {appt.status !== 'completed' && (
                            <button
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: 11, padding: '4px 8px' }}
                              onClick={() => handleOpenConsultModal(appt)}
                              title="Write Consultation Notes"
                            >
                              Consult
                            </button>
                          )}
                          {appt.status === 'completed' && (
                            <span
                              style={{
                                fontSize: 11,
                                color: 'var(--color-success)',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <CheckCircle2 size={14} /> Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Quick Clinical Shortcuts & Recent Prescriptions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Shortcuts */}
          <div className="card">
            <h3 style={{ margin: '0 0 14px', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
              Clinical Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/doctor/prescriptions"
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
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1d4ed8',
                  }}
                >
                  <ClipboardList size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    Prescription Generator
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    Draft digital prescription & print Rx slip
                  </div>
                </div>
                <ArrowRight size={16} color="var(--color-text-muted)" />
              </Link>

              <Link
                to="/doctor/lab-requests"
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
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#ede9fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                  }}
                >
                  <TestTube size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    Diagnostic Lab Requests
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    Order tests & review abnormal result values
                  </div>
                </div>
                <ArrowRight size={16} color="var(--color-text-muted)" />
              </Link>

              <Link
                to="/doctor/patients"
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
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16a34a',
                  }}
                >
                  <Users size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    Patient Medical History
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    Access vitals, allergies & chronic records
                  </div>
                </div>
                <ArrowRight size={16} color="var(--color-text-muted)" />
              </Link>
            </div>
          </div>

          {/* Recent Prescriptions Mini-List */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Recent Prescriptions
              </h3>
              <Link
                to="/doctor/prescriptions"
                style={{
                  fontSize: 12,
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                View all
              </Link>
            </div>
            {prescriptions.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                No recent prescriptions on file.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prescriptions.slice(0, 3).map((rx) => (
                  <div
                    key={rx.id}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{rx.patientName}</span>
                      <span style={{ color: 'var(--color-primary)' }}>{rx.id}</span>
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {rx.diagnosis} · {rx.medicines?.length || 0} meds
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consultation Summary Modal */}
      {consultModal && activeAppt && (
        <Modal
          isOpen={consultModal}
          onClose={() => setConsultModal(false)}
          title={`Consultation Summary: ${activeAppt.patientName}`}
          subtitle={`Appointment ID: ${activeAppt.id} · Scheduled Time: ${activeAppt.time}`}
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
              <div><strong>Patient ID:</strong> {activeAppt.patientId}</div>
              <div><strong>Reason for Visit:</strong> {activeAppt.reason || 'General Health Consultation'}</div>
              <div><strong>Department:</strong> {activeAppt.department}</div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Clinical Observation & Consultation Advice
              </label>
              <textarea
                className="form-control"
                rows={5}
                required
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                placeholder="Enter patient symptoms, diagnosis, physical findings, and lifestyle advice..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button variant="secondary" onClick={() => setConsultModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Complete & Save Consultation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
