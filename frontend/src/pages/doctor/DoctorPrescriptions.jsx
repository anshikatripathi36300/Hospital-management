/**
 * DoctorPrescriptions.jsx — Digital Prescription Generator & Archive (Part 8)
 *
 * Features:
 * - Archive of prescriptions issued by the attending physician
 * - Multi-medicine prescription builder with dosage, frequency, and instructions
 * - Quick-pick pills from standard medication library
 * - Patient selector with auto-fill demographics
 * - Printable and downloadable official medical prescription slip
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllPrescriptions,
  saveCustomPrescription,
  getAllPatients,
  COMMON_MEDICATIONS,
} from '../../data/demoData';
import {
  ClipboardList,
  PlusCircle,
  Search,
  Printer,
  Trash2,
  CheckCircle2,
  User,
  Calendar,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DoctorPrescriptions() {
  const { currentUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [viewSlipModal, setViewSlipModal] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [toast, setToast] = useState('');

  // Form State
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1 tab', frequency: '1-0-0', duration: '7 Days', instructions: 'After meals' },
  ]);
  const [generalAdvice, setGeneralAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    const allRx = getAllPrescriptions();
    const docRx = allRx.filter(
      (r) => r.doctorName === currentUser?.name || currentUser?.role === 'admin'
    );
    setPrescriptions(docRx);

    const allPts = getAllPatients();
    setPatients(allPts);
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // Open Create Modal
  const handleOpenCreateModal = () => {
    if (patients.length > 0) {
      setPatientId(patients[0].id);
    }
    setDiagnosis('');
    setMedicines([
      { name: '', dosage: '1 tab', frequency: '1-0-0', duration: '7 Days', instructions: 'After meals' },
    ]);
    setGeneralAdvice('');
    setFollowUpDate('');
    setCreateModal(true);
  };

  // Medicine Row Controls
  const handleAddMedicineRow = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '1 tab', frequency: '1-0-0', duration: '7 Days', instructions: 'After meals' },
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleUpdateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleQuickPickMed = (med) => {
    setMedicines([
      ...medicines,
      {
        name: med.name,
        dosage: med.defaultDosage,
        frequency: med.defaultFreq,
        duration: med.defaultDuration,
        instructions: med.instructions,
      },
    ]);
  };

  // Submit Prescription
  const handleSavePrescription = (e) => {
    e.preventDefault();
    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) return;

    // Filter valid medicines
    const validMeds = medicines.filter((m) => m.name.trim() !== '');
    if (validMeds.length === 0) {
      alert('Please enter at least one medication name.');
      return;
    }

    const newRx = {
      id: `RX-${Date.now().toString().slice(-6)}`,
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      patientAge: targetPatient.age,
      patientGender: targetPatient.gender,
      doctorId: currentUser?.id || 'DOC-001',
      doctorName: currentUser?.name || 'Dr. Priya Sharma',
      department: currentUser?.department || 'Cardiology',
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      medicines: validMeds,
      generalAdvice,
      followUpDate: followUpDate || 'As advised',
      status: 'active',
    };

    saveCustomPrescription(newRx);
    loadData();
    setCreateModal(false);
    showToast(`Prescription ${newRx.id} created successfully!`);
    setSelectedRx(newRx);
    setViewSlipModal(true);
  };

  const filtered = prescriptions.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(term) ||
      r.id.toLowerCase().includes(term) ||
      (r.diagnosis && r.diagnosis.toLowerCase().includes(term))
    );
  });

  return (
    <AppLayout title="Prescriptions">
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Prescription Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Draft digital prescriptions with structured dosages and export official slips.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={handleOpenCreateModal}>
          Draft New Prescription
        </Button>
      </div>

      {/* Search Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
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
            placeholder="Search by patient name, prescription ID, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Rx ID</th>
                <th>Date</th>
                <th>Patient Details</th>
                <th>Diagnosis</th>
                <th>Medications</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No prescriptions found on record.
                  </td>
                </tr>
              ) : (
                filtered.map((rx) => (
                  <tr key={rx.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {rx.id}
                    </td>
                    <td>{rx.date}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rx.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        UHID: {rx.patientId} · {rx.patientAge} yrs ({rx.patientGender})
                      </div>
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
                        {rx.medicines?.length || 0} Prescribed
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={rx.status || 'active'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => {
                          setSelectedRx(rx);
                          setViewSlipModal(true);
                        }}
                      >
                        <Printer size={13} /> View Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Prescription */}
      {createModal && (
        <Modal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          title="Draft Digital Prescription"
          subtitle="Generate an official hospital prescription with structured dosages"
        >
          <form onSubmit={handleSavePrescription} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient & Diagnosis Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Select Patient
                </label>
                <select
                  className="form-control"
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.uhid})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Clinical Diagnosis
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Essential Hypertension & Mild Bronchitis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
            </div>

            {/* Quick-Pick Medication Chips */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                <Sparkles size={14} color="var(--color-primary)" /> Quick-Add Common Medications:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COMMON_MEDICATIONS.slice(0, 7).map((med) => (
                  <button
                    key={med.name}
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999 }}
                    onClick={() => handleQuickPickMed(med)}
                  >
                    + {med.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Medications List Builder */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                  Medications & Dosages ({medicines.length})
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={PlusCircle}
                  onClick={handleAddMedicineRow}
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  Add Row
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {medicines.map((m, idx) => (
                  <div key={idx} className="medicine-builder-row">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Medicine Name (e.g. Amlodipine 5mg)"
                      value={m.name}
                      required
                      onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Dosage (1 tab)"
                      value={m.dosage}
                      onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                    />
                    <select
                      className="form-control"
                      value={m.frequency}
                      onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                    >
                      <option value="1-0-0">1-0-0 (Morning)</option>
                      <option value="0-0-1">0-0-1 (Night)</option>
                      <option value="1-0-1">1-0-1 (Twice daily)</option>
                      <option value="1-1-1">1-1-1 (Thrice daily)</option>
                      <option value="SOS">SOS (As needed)</option>
                    </select>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Duration"
                      value={m.duration}
                      onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Food instructions (e.g. After meals)"
                      value={m.instructions}
                      onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        padding: 6,
                      }}
                      onClick={() => handleRemoveMedicineRow(idx)}
                      disabled={medicines.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* General Advice & Followup */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  General Advice & Dietary Instructions
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Low salt diet, drink 2L water, complete antibiotic course..."
                  value={generalAdvice}
                  onChange={(e) => setGeneralAdvice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Follow-up Review Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Save & Issue Prescription
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View & Print Prescription Slip */}
      {viewSlipModal && selectedRx && (
        <Modal
          isOpen={viewSlipModal}
          onClose={() => setViewSlipModal(false)}
          title={`Digital Prescription — ${selectedRx.id}`}
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

          {/* Modal Action Buttons */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setViewSlipModal(false)}>
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
