/**
 * PatientRecords.jsx — Personal Health Record & Medical History (Part 9)
 *
 * Features:
 * - Patient digital health card with UHID, blood group, and emergency contact
 * - Recorded vital signs with healthy reference standards
 * - Allergies, contraindications, and chronic conditions
 * - Complete clinical consultation summary timeline
 * - Printable personal health record certificate
 */
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { getAllPatients, getAllAppointments, getAllPrescriptions } from '../../data/demoData';
import {
  FileText,
  HeartPulse,
  Activity,
  ShieldAlert,
  Printer,
  User,
  Calendar,
  AlertTriangle,
  Stethoscope,
  Phone,
  Droplet,
} from 'lucide-react';

export default function PatientRecords() {
  const { currentUser } = useAuth();
  const [patientRecord, setPatientRecord] = useState(null);
  const [pastConsultations, setPastConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const patId = currentUser?.patientId || 'P-001';
    const allPts = getAllPatients();
    const match = allPts.find((p) => p.id === patId || p.email === currentUser?.email);
    setPatientRecord(match || allPts[0]);

    const allAppts = getAllAppointments();
    const myAppts = allAppts.filter(
      (a) => a.patientId === patId || a.patientName === currentUser?.name
    );
    setPastConsultations(myAppts);

    const allRx = getAllPrescriptions();
    const myRx = allRx.filter(
      (r) => r.patientId === patId || r.patientName === currentUser?.name
    );
    setPrescriptions(myRx);
  }, [currentUser]);

  return (
    <AppLayout title="Medical Records">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Personal Health Records</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Authorized clinical files, recorded vitals, and diagnostic medical summary.
          </p>
        </div>
        <Button
          variant="outline"
          icon={Printer}
          onClick={() => window.print()}
        >
          Print Health Summary
        </Button>
      </div>

      <div className="printable-area">
        {/* Digital UHID Health Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            padding: 24,
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
                Hospital Digital Health Card
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 0' }}>
                {patientRecord?.name || currentUser?.name}
              </h2>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                UHID: <strong>{patientRecord?.uhid || 'UHID-2024-1001'}</strong> · Age: {patientRecord?.age || 45} yrs · {patientRecord?.gender || 'Male'}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85 }}>Blood Group</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
                {patientRecord?.blood || 'B+'}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.2)',
              fontSize: 13,
            }}
          >
            <div>
              <span style={{ opacity: 0.75, fontSize: 11 }}>Registered Phone</span>
              <div style={{ fontWeight: 600 }}>{patientRecord?.phone || '9876543210'}</div>
            </div>
            <div>
              <span style={{ opacity: 0.75, fontSize: 11 }}>Emergency Contact</span>
              <div style={{ fontWeight: 600 }}>
                {patientRecord?.emergencyContact?.name || 'Karthik Devi'} ({patientRecord?.emergencyContact?.relation || 'Spouse'})
              </div>
            </div>
            <div>
              <span style={{ opacity: 0.75, fontSize: 11 }}>Attending Consultant</span>
              <div style={{ fontWeight: 600 }}>
                {patientRecord?.assignedDoctor || 'Dr. Priya Sharma'}
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Parameters Grid: Vitals & Allergy Warnings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Vitals Summary Card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <HeartPulse size={18} color="#dc2626" />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Recorded Vital Signs
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Blood Pressure</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>
                  {patientRecord?.vitals?.bp || '120/80 mmHg'}
                </div>
                <div style={{ fontSize: 10, color: '#16a34a', marginTop: 2 }}>Normal &lt; 130/85</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Pulse Rate</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>
                  {patientRecord?.vitals?.pulse || '74 bpm'}
                </div>
                <div style={{ fontSize: 10, color: '#16a34a', marginTop: 2 }}>60 - 100 bpm</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Body Temperature</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>
                  {patientRecord?.vitals?.temp || '98.6°F'}
                </div>
                <div style={{ fontSize: 10, color: '#16a34a', marginTop: 2 }}>Afebrile</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>SpO2 Saturation</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>
                  {patientRecord?.vitals?.spo2 || '99%'}
                </div>
                <div style={{ fontSize: 10, color: '#16a34a', marginTop: 2 }}>Normal &gt; 95%</div>
              </div>
            </div>
          </div>

          {/* Allergies & Chronic Conditions */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <ShieldAlert size={18} color="#b91c1c" />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Allergies & Medical Alerts
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  padding: '10px 14px',
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
                  Recorded Allergies:
                </div>
                <div style={{ fontWeight: 700, color: '#b91c1c', marginTop: 2, fontSize: 13 }}>
                  {patientRecord?.allergies || 'Penicillin, Dust mite'}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '10px 14px',
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Primary Clinical Diagnosis:
                </div>
                <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2, fontSize: 13 }}>
                  {patientRecord?.diagnosis || 'Essential Hypertension Stage 1'}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '10px 14px',
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Co-existing Conditions:
                </div>
                <div style={{ color: '#334155', marginTop: 2, fontSize: 13 }}>
                  {patientRecord?.conditions || 'Mild Gastritis'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation History Timeline */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
            Consultation History & Doctor Advice
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pastConsultations.map((c) => (
              <div
                key={c.id}
                style={{
                  borderLeft: '3px solid var(--color-primary)',
                  paddingLeft: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{c.doctorName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.date}</div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {c.department} · {c.type}
                </div>
                {c.notes && (
                  <div
                    style={{
                      marginTop: 4,
                      background: '#f8fafc',
                      padding: 10,
                      borderRadius: 4,
                      fontSize: 12,
                      fontStyle: 'italic',
                      color: '#334155',
                    }}
                  >
                    "{c.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
