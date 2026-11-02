/**
 * PatientPrescriptions.jsx — Patient Prescriptions & Medication Reminders (Part 9)
 *
 * Features:
 * - Active medication dosing schedule (Morning / Noon / Night)
 * - Complete prescription history archive organized by consultation date
 * - Digital prescription slip viewer with verified doctor signature
 * - One-click print / download voucher
 */
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { getAllPrescriptions } from '../../data/demoData';
import {
  ClipboardList,
  Pill,
  Clock,
  Printer,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react';

export default function PatientPrescriptions() {
  const { currentUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedRx, setSelectedRx] = useState(null);
  const [slipModal, setSlipModal] = useState(false);

  useEffect(() => {
    const patId = currentUser?.patientId || 'P-001';
    const all = getAllPrescriptions();
    const myRx = all.filter(
      (r) => r.patientId === patId || r.patientName === currentUser?.name
    );
    setPrescriptions(myRx);
  }, [currentUser]);

  const activeRx = prescriptions.filter((r) => r.status === 'active');

  const handleOpenSlip = (rx) => {
    setSelectedRx(rx);
    setSlipModal(true);
  };

  return (
    <AppLayout title="My Prescriptions">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Prescriptions & Medicines</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Active medication schedules, dosing instructions, and official prescription vouchers.
          </p>
        </div>
      </div>

      {/* Active Medications Schedule Banner */}
      {activeRx.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Pill size={20} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
              Current Active Medications Schedule
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 14,
            }}
          >
            {activeRx.flatMap((rx) =>
              rx.medicines?.map((m, idx) => (
                <div
                  key={`${rx.id}-${idx}`}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 800, color: '#1e293b' }}>
                        {m.name}
                      </h4>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {m.dosage} · Duration: {m.duration}
                      </div>
                    </div>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {m.frequency}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid #e2e8f0',
                      fontSize: 11,
                      color: '#475569',
                    }}
                  >
                    <strong>Instruction:</strong> {m.instructions}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Prescriptions History Archive */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            fontWeight: 700,
          }}
        >
          Prescription History Archive
        </div>

        {prescriptions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <ClipboardList size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No prescriptions on record for your profile.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Rx ID</th>
                  <th>Date Issued</th>
                  <th>Attending Doctor</th>
                  <th>Clinical Diagnosis</th>
                  <th>Medications</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                      {rx.id}
                    </td>
                    <td>{rx.date}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rx.doctorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{rx.department}</div>
                    </td>
                    <td style={{ maxWidth: 220, fontSize: 12 }}>
                      {rx.diagnosis}
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {rx.medicines?.length || 0} Meds Prescribed
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={rx.status || 'active'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleOpenSlip(rx)}
                      >
                        <Printer size={13} /> View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View & Print Slip Modal */}
      {slipModal && selectedRx && (
        <Modal
          isOpen={slipModal}
          onClose={() => setSlipModal(false)}
          title={`Prescription Voucher — ${selectedRx.id}`}
        >
          <div className="printable-area">
            <div className="prescription-slip">
              {/* Slip Header */}
              <div className="prescription-header">
                <div>
                  <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: 800 }}>
                    METROPOLITAN GENERAL HOSPITAL
                  </h2>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    NABH Accredited Multi-Speciality Tertiary Care Hospital
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    100 Feet Road, Indiranagar, Bengaluru · Helpline: (080) 4567-8900
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                    {selectedRx.doctorName}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569' }}>
                    MD, DM ({selectedRx.department})
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    Reg No: KMC-882910-B
                  </div>
                </div>
              </div>

              {/* Patient Meta Block */}
              <div className="prescription-meta-grid">
                <div>
                  <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Patient Name</span>
                  <div style={{ fontWeight: 700 }}>{selectedRx.patientName}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>UHID / ID</span>
                  <div style={{ fontWeight: 700 }}>{selectedRx.patientId}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Age / Gender</span>
                  <div>{selectedRx.patientAge} yrs / {selectedRx.patientGender}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Date Issued</span>
                  <div>{selectedRx.date}</div>
                </div>
              </div>

              {/* Diagnosis */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Diagnosis / Clinical Assessment:
                </span>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {selectedRx.diagnosis}
                </div>
              </div>

              {/* Rx Symbol */}
              <div className="rx-symbol">℞</div>

              {/* Medicines Table */}
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine & Strength</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRx.medicines?.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#1e293b' }}>{m.name}</td>
                      <td>{m.dosage}</td>
                      <td>
                        <span style={{ fontWeight: 600, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                          {m.frequency}
                        </span>
                      </td>
                      <td>{m.duration}</td>
                      <td style={{ fontSize: 12, color: '#475569' }}>{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Advice */}
              {selectedRx.generalAdvice && (
                <div style={{ marginTop: 16, background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Physician Advice & Regimen:
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                    {selectedRx.generalAdvice}
                  </div>
                </div>
              )}

              {/* Follow-up & Doctor Sign */}
              <div className="prescription-footer">
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Next Review / Follow-up:</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedRx.followUpDate}</div>
                </div>
                <div className="doctor-sign-block">
                  <div className="doctor-sign-line" />
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{selectedRx.doctorName}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Digitally Verified Signature</div>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setSlipModal(false)}>
              Close
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Print Prescription Slip
            </Button>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
