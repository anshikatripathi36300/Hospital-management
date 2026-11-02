/**
 * PatientDashboard.jsx — Patient Portal Main Dashboard (Part 9)
 *
 * Provides the patient with:
 * - Personalized welcome with Digital UHID Health Card
 * - Next upcoming consultation countdown & chamber details
 * - Active medication reminders (Morning / Noon / Night schedule)
 * - Quick KPI cards (Appointments, Records, Prescriptions, Outstanding Bills)
 * - One-click shortcut to Book an Appointment
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllAppointments,
  getAllPrescriptions,
  getAllLabReports,
  getAllBills,
  getAllPatients,
} from '../../data/demoData';
import {
  Calendar,
  FileText,
  CreditCard,
  ClipboardList,
  Clock,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Pill,
  User,
  PlusCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function PatientDashboard() {
  const { currentUser } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [bills, setBills] = useState([]);
  const [patientRecord, setPatientRecord] = useState(null);

  useEffect(() => {
    const patId = currentUser?.patientId || 'P-001';

    // Scoped appointments
    const allAppts = getAllAppointments();
    const myAppts = allAppts.filter(
      (a) => a.patientId === patId || a.patientName === currentUser?.name
    );
    setAppointments(myAppts);

    // Scoped prescriptions
    const allRx = getAllPrescriptions();
    const myRx = allRx.filter(
      (r) => r.patientId === patId || r.patientName === currentUser?.name
    );
    setPrescriptions(myRx);

    // Scoped lab reports
    const allLabs = getAllLabReports();
    const myLabs = allLabs.filter(
      (l) => l.patientId === patId || l.patientName === currentUser?.name
    );
    setLabReports(myLabs);

    // Scoped bills
    const allBills = getAllBills();
    const myBills = allBills.filter(
      (b) => b.patientId === patId || b.patientName === currentUser?.name
    );
    setBills(myBills);

    // Clinical record
    const allPatients = getAllPatients();
    const match = allPatients.find(
      (p) => p.id === patId || p.email === currentUser?.email
    );
    setPatientRecord(match || allPatients[0]);
  }, [currentUser]);

  // Next upcoming appointment
  const upcomingAppts = appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'completed');
  const nextAppt = upcomingAppts[0];

  // Active prescriptions & medications
  const activeRx = prescriptions.find((r) => r.status === 'active') || prescriptions[0];
  const pendingBills = bills.filter((b) => b.status === 'pending');
  const totalPendingAmount = pendingBills.reduce((acc, b) => acc + (b.totalAmount - (b.paidAmount || 0)), 0);

  return (
    <AppLayout title="Patient Dashboard">
      {/* Personalized Welcome Banner with Digital Health Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          color: 'white',
          marginBottom: 24,
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
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
              }}
            >
              UHID: {patientRecord?.uhid || 'UHID-2024-1001'}
            </span>
            <span style={{ fontSize: 13, opacity: 0.9 }}>
              Blood Group: <strong>{patientRecord?.blood || 'B+'}</strong>
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Welcome, {currentUser?.name || patientRecord?.name}
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 'var(--font-size-sm)' }}>
            Hospital Medical Record System — Manage your care, appointments, prescriptions and lab results.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/patient/book-appointment">
            <Button
              variant="secondary"
              icon={PlusCircle}
              style={{ background: 'white', color: '#0f766e', border: 'none', fontWeight: 700 }}
            >
              Book Consultation
            </Button>
          </Link>
          <Link to="/patient/records">
            <Button
              variant="outline"
              icon={FileText}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Health Records
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
        <Link to="/patient/appointments" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8',
              }}
            >
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{upcomingAppts.length}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Upcoming Visits
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/prescriptions" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <ClipboardList size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{prescriptions.length}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Prescriptions
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/lab-reports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                background: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{labReports.length}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Lab Test Reports
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/bills" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                background: pendingBills.length > 0 ? '#fee2e2' : '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: pendingBills.length > 0 ? '#b91c1c' : '#16a34a',
              }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                {pendingBills.length > 0 ? `₹${totalPendingAmount}` : '₹0'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {pendingBills.length > 0 ? 'Pending Invoices' : 'All Dues Cleared'}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Next Appointment & Active Medications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Next Upcoming Consultation Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                  Next Scheduled Consultation
                </h3>
              </div>
              {nextAppt && <StatusBadge status={nextAppt.status} />}
            </div>

            {nextAppt ? (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                      {nextAppt.doctorName}
                    </h4>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                      {nextAppt.department} Department · {nextAppt.type}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12,
                    }}
                  >
                    {nextAppt.time}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid #e2e8f0',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={16} color="var(--color-text-muted)" />
                    <span><strong>Date:</strong> {nextAppt.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={16} color="var(--color-text-muted)" />
                    <span><strong>Chamber:</strong> Room 302, 3rd Floor</span>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <Link to="/patient/appointments" style={{ textDecoration: 'none', flex: 1 }}>
                    <Button variant="outline" style={{ width: '100%' }}>
                      Manage / Reschedule
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Calendar size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ margin: '0 0 14px' }}>You have no upcoming consultations scheduled.</p>
                <Link to="/patient/book-appointment">
                  <Button variant="primary" icon={PlusCircle}>
                    Book an Appointment
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
              Quick Health Shortcuts
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <Link
                to="/patient/book-appointment"
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
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Book Doctor</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Pick time slot</div>
                </div>
              </Link>

              <Link
                to="/patient/records"
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
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartPulse size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Vitals & Records</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>View health history</div>
                </div>
              </Link>

              <Link
                to="/patient/bills"
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
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Pay Bills</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Online payment</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Active Medications & Vitals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Active Prescriptions Schedule */}
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill size={18} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                  Active Medications Schedule
                </h3>
              </div>
              <Link
                to="/patient/prescriptions"
                style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
              >
                View All
              </Link>
            </div>

            {activeRx && activeRx.medicines && activeRx.medicines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeRx.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 'var(--font-size-sm)' }}>
                        {med.name}
                      </span>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {med.frequency}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      {med.dosage} · {med.duration} · {med.instructions}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                No active medication regimens recorded.
              </p>
            )}
          </div>

          {/* Vitals Summary Card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <HeartPulse size={18} color="#dc2626" />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Latest Recorded Vitals
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Blood Pressure</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
                  {patientRecord?.vitals?.bp || '120/80 mmHg'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Pulse Rate</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
                  {patientRecord?.vitals?.pulse || '74 bpm'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Body Temp</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
                  {patientRecord?.vitals?.temp || '98.6°F'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Oxygen (SpO2)</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>
                  {patientRecord?.vitals?.spo2 || '99%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
