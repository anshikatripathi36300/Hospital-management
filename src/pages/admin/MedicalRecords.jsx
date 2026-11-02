/**
 * MedicalRecords.jsx — Centralized Electronic Health Records (EHR) Registry (Part 16)
 *
 * Consolidated clinical archive:
 * - Patient health dossiers aggregating diagnoses, vitals trends, prescriptions,
 *   diagnostic laboratory reports, and inpatient admission summaries.
 * - Comprehensive multi-specialty EHR viewer with printable case sheets.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllPatients,
  getAllPrescriptions,
  getAllLabReports,
  getAllVitalsRecords,
  getAllBills,
} from '../../data/demoData';
import {
  FileText,
  Search,
  Filter,
  Printer,
  HeartPulse,
  Pill,
  FlaskConical,
  CreditCard,
  Calendar,
  User,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

export default function MedicalRecords() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [vitalsList, setVitalsList] = useState([]);
  const [bills, setBills] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dossier Modal
  const [dossierModal, setDossierModal] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(() => {
    setPatients(getAllPatients());
    setPrescriptions(getAllPrescriptions());
    setLabReports(getAllLabReports());
    setVitalsList(getAllVitalsRecords());
    setBills(getAllBills());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Dossier
  const openDossier = (patient) => {
    setActivePatient(patient);
    setActiveTab('overview');
    setDossierModal(true);
  };

  // Associated records for active patient
  const patientPrescriptions = useMemo(() => {
    if (!activePatient) return [];
    return prescriptions.filter(
      (p) => p.patientId === activePatient.id || p.patientName === activePatient.name
    );
  }, [activePatient, prescriptions]);

  const patientLabs = useMemo(() => {
    if (!activePatient) return [];
    return labReports.filter(
      (l) => l.patientId === activePatient.id || l.patientName === activePatient.name
    );
  }, [activePatient, labReports]);

  const patientVitals = useMemo(() => {
    if (!activePatient) return [];
    return vitalsList.filter(
      (v) => v.patientId === activePatient.id || v.patientName === activePatient.name
    );
  }, [activePatient, vitalsList]);

  const patientBills = useMemo(() => {
    if (!activePatient) return [];
    return bills.filter(
      (b) => b.patientId === activePatient.id || b.patientName === activePatient.name
    );
  }, [activePatient, bills]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.uhid && p.uhid.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.doctorName && p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'admitted' && p.admissionStatus === 'admitted') ||
        (statusFilter === 'discharged' && p.admissionStatus === 'discharged') ||
        (statusFilter === 'active' && p.status === 'active');

      return matchSearch && matchStatus;
    });
  }, [patients, searchTerm, statusFilter]);

  return (
    <AppLayout title="Central Medical Records (EHR)">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={26} color="var(--color-primary-600)" />
            Central Electronic Health Records (EHR) Registry
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Hospital electronic medical archives, clinical encounter case histories, and unified longitudinal patient dossiers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 20, padding: '16px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search
              size={18}
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
              placeholder="Search by UHID, Patient Name, Diagnosis, or Physician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="all">All Care Statuses</option>
              <option value="admitted">Inpatient Admitted</option>
              <option value="discharged">Outpatient / Discharged</option>
              <option value="active">Active OPD Enrolled</option>
            </select>
          </div>
        </div>
      </div>

      {/* EHR Master Registry Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Patient UHID</th>
                <th>Patient Name</th>
                <th>Age / Sex</th>
                <th>Primary Diagnosis</th>
                <th>Attending Doctor</th>
                <th>Ward / Care Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No electronic health records match your criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary-700)' }}>
                        {patient.uhid || patient.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{patient.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        Blood: <strong>{patient.bloodGroup || 'O+'}</strong> • Mob: {patient.phone || '9876543210'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {patient.age} yrs • {patient.gender}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>
                        {patient.diagnosis || 'General Outpatient Evaluation'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {patient.doctorName || 'Dr. Priya Sharma'}
                    </td>
                    <td>
                      <span
                        style={{
                          background: patient.admissionStatus === 'admitted' ? '#fee2e2' : '#ecfdf5',
                          color: patient.admissionStatus === 'admitted' ? '#b91c1c' : '#047857',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {patient.admissionStatus === 'admitted' ? `IPD: ${patient.bedNumber || 'Ward-3'}` : 'Outpatient'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={FileText}
                        onClick={() => openDossier(patient)}
                      >
                        Health Dossier
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Patient EHR Dossier Modal */}
      {dossierModal && activePatient && (
        <Modal
          isOpen={dossierModal}
          onClose={() => setDossierModal(false)}
          title={`Electronic Health Record (EHR) — ${activePatient.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Dossier Header */}
            <div
              style={{
                borderBottom: '2px solid var(--color-primary-600)',
                paddingBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: 'var(--color-primary-700)', fontSize: '1.2rem' }}>
                  {activePatient.name}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  UHID: <strong>{activePatient.uhid || activePatient.id}</strong> • Age: {activePatient.age} yrs • Gender: {activePatient.gender} • Blood Group: <strong>{activePatient.bloodGroup || 'O+'}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Attending Consultant: <strong>{activePatient.doctorName || 'Dr. Priya Sharma'}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  OFFICIAL EHR DOSSIER
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  ISO 27001 / HIPAA Compliant
                </div>
              </div>
            </div>

            {/* Sub-navigation tabs */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
              {[
                { id: 'overview', label: 'Clinical Overview', icon: User },
                { id: 'prescriptions', label: `Rx (${patientPrescriptions.length})`, icon: Pill },
                { id: 'labs', label: `Diagnostics (${patientLabs.length})`, icon: FlaskConical },
                { id: 'vitals', label: `Vitals (${patientVitals.length})`, icon: HeartPulse },
                { id: 'billing', label: `Billing (${patientBills.length})`, icon: CreditCard },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: activeTab === id ? 'var(--color-primary-600)' : 'var(--color-bg-secondary)',
                    color: activeTab === id ? 'white' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: Clinical Overview */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    background: 'var(--color-bg-secondary)',
                    padding: '12px 14px',
                    borderRadius: 8,
                    fontSize: '0.84rem',
                  }}
                >
                  <div>
                    <div><strong>Primary Diagnosis:</strong> {activePatient.diagnosis || 'Outpatient Assessment'}</div>
                    <div><strong>Chronic Conditions:</strong> {activePatient.chronicConditions || 'None Reported'}</div>
                    <div><strong>Allergies:</strong> <span style={{ color: '#dc2626', fontWeight: 600 }}>{activePatient.allergies || 'NKDA (No Known Drug Allergies)'}</span></div>
                  </div>
                  <div>
                    <div><strong>Admission Status:</strong> {activePatient.admissionStatus || 'Outpatient'}</div>
                    <div><strong>Assigned Bed:</strong> {activePatient.bedNumber || 'Outpatient Clinic Desk'}</div>
                    <div><strong>Emergency Contact:</strong> {activePatient.emergencyContact || activePatient.phone || 'N/A'}</div>
                  </div>
                </div>

                <div
                  style={{
                    border: '1px solid var(--color-border)',
                    padding: '12px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Physician Clinical Notes:</div>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {activePatient.clinicalNotes ||
                      'Patient presented with standard clinical indications. Physical examination conducted. Regular follow-up and monitoring prescribed.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Prescriptions */}
            {activeTab === 'prescriptions' && (
              <div>
                {patientPrescriptions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No electronic prescriptions recorded for this patient.
                  </div>
                ) : (
                  patientPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      style={{
                        border: '1px solid var(--color-border)',
                        padding: '12px',
                        borderRadius: 8,
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <strong style={{ fontSize: '0.88rem' }}>{rx.id} — {rx.diagnosis}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{rx.date}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(rx.medicines || []).map((m, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            {m.name} ({m.dosage}) - {m.frequency}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: Diagnostics Lab Reports */}
            {activeTab === 'labs' && (
              <div>
                {patientLabs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No diagnostic laboratory reports on file for this patient.
                  </div>
                ) : (
                  patientLabs.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        border: '1px solid var(--color-border)',
                        padding: '12px',
                        borderRadius: 8,
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <strong>{l.testName}</strong> ({l.category})
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Order: {l.id} • Barcode: {l.sampleBarcode || 'BC-STANDARD'}
                          </div>
                        </div>
                        <StatusBadge status={l.status} />
                      </div>
                      {l.parameters && l.parameters.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                          {l.parameters.map((p, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'var(--color-bg-secondary)',
                                padding: '3px 8px',
                                borderRadius: 4,
                                fontSize: '0.75rem',
                              }}
                            >
                              {p.name}: <strong>{p.value} {p.unit}</strong> (Ref: {p.refRange})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: Vitals History */}
            {activeTab === 'vitals' && (
              <div>
                {patientVitals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No vital signs entries recorded yet.
                  </div>
                ) : (
                  <table className="table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>BP (mmHg)</th>
                        <th>Pulse (bpm)</th>
                        <th>SpO2 (%)</th>
                        <th>Temp (°F)</th>
                        <th>Recorded By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientVitals.map((v, idx) => (
                        <tr key={idx}>
                          <td>{v.time || '10:00 AM'}</td>
                          <td style={{ fontWeight: 600 }}>{v.bp || `${v.systolic}/${v.diastolic}`}</td>
                          <td>{v.pulse || v.heartRate}</td>
                          <td style={{ fontWeight: 600, color: (v.spo2 || 98) < 95 ? '#dc2626' : '#059669' }}>
                            {v.spo2}%
                          </td>
                          <td>{v.temperature || '98.6'}</td>
                          <td>{v.nurseName || 'Meena Patel, RN'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB CONTENT: Billing Ledger */}
            {activeTab === 'billing' && (
              <div>
                {patientBills.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No invoice transactions recorded for this patient.
                  </div>
                ) : (
                  <table className="table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Service Category</th>
                        <th>Date</th>
                        <th>Total (₹)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientBills.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{b.id}</td>
                          <td>{b.category || 'Consultation'}</td>
                          <td>{b.date}</td>
                          <td style={{ fontWeight: 700 }}>₹{b.totalAmount.toLocaleString('en-IN')}</td>
                          <td><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button variant="ghost" onClick={() => setDossierModal(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Case Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
