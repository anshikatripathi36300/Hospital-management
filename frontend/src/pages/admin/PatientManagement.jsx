/**
 * PatientManagement.jsx
 *
 * Admin Portal — Patient Management Module.
 * Features:
 *  - Master directory of all inpatients & outpatients with UHID
 *  - Multi-criteria search (UHID, Name, Phone, Doctor)
 *  - Clinical & admission status filters (Inpatient, Outpatient, Discharged, Inactive)
 *  - New Patient Registration Modal (creates & persists patient with UHID)
 *  - Clinical Record View Modal (Demographics, Vitals, Diagnosis, Allergies, Assigned Doctor)
 *  - Edit Patient Details Modal
 *  - Admit / Discharge workflow
 *  - Archive/Deactivate workflow with Confirmation Dialog
 *  - Pagination and CSV/Print export
 *
 * Part 5 Roadmap Implementation.
 */
import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit2,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  Bed,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  getAllPatients,
  saveCustomPatient,
  updatePatientRecord,
  archivePatientRecord,
  DEPARTMENTS,
  DOCTORS,
} from '../../data/demoData';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ADMISSION_STATUSES = ['all', 'inpatient', 'outpatient', 'discharged', 'inactive'];
const PAGE_SIZE = 6;

export default function PatientManagement() {
  const [patients, setPatients] = useState(() => getAllPatients());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [archivingPatient, setArchivingPatient] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    blood: 'O+',
    phone: '',
    email: '',
    address: '',
    department: 'General Medicine',
    assignedDoctor: 'Dr. Ravi Iyer',
    admissionStatus: 'outpatient',
    bed: 'OPD Chamber 1',
    diagnosis: '',
    allergies: 'None reported',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse',
  });
  const [formErrors, setFormErrors] = useState({});

  // Show auto-dismissing toast
  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }

  // Refresh data from storage
  function refreshList() {
    setPatients(getAllPatients());
  }

  // Filtering & Search
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        (p.uhid && p.uhid.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.assignedDoctor && p.assignedDoctor.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'inpatient' && p.admissionStatus === 'inpatient') ||
        (statusFilter === 'outpatient' && p.admissionStatus === 'outpatient') ||
        (statusFilter === 'discharged' && p.admissionStatus === 'discharged') ||
        (statusFilter === 'inactive' && p.status === 'inactive');

      const matchesDept = deptFilter === 'all' || p.department === deptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [patients, searchTerm, statusFilter, deptFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPatients.slice(start, start + PAGE_SIZE);
  }, [filteredPatients, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = patients.length;
    const inpatients = patients.filter((p) => p.admissionStatus === 'inpatient').length;
    const outpatients = patients.filter((p) => p.admissionStatus === 'outpatient').length;
    const critical = patients.filter((p) => p.bed && p.bed.includes('ICU')).length;
    const discharged = patients.filter((p) => p.admissionStatus === 'discharged').length;
    return { total, inpatients, outpatients, critical, discharged };
  }, [patients]);

  // Validate New Patient Form
  function validateNewPatient() {
    const errs = {};
    if (!newPatientForm.name.trim()) errs.name = 'Patient name is required.';
    if (!newPatientForm.age || newPatientForm.age < 1) errs.age = 'Enter a valid age.';
    if (!newPatientForm.phone.trim()) errs.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(newPatientForm.phone.replace(/[\s-]/g, ''))) {
      errs.phone = '10-digit phone number is required.';
    }
    if (!newPatientForm.emergencyName.trim()) errs.emergencyName = 'Emergency contact is required.';
    if (!newPatientForm.emergencyPhone.trim()) errs.emergencyPhone = 'Emergency phone is required.';
    return errs;
  }

  // Handle Register Patient
  function handleRegisterSubmit(e) {
    e.preventDefault();
    const errs = validateNewPatient();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const nextSeq = patients.length + 1;
    const patientId = `P-${String(nextSeq).padStart(3, '0')}`;
    const uhid = `UHID-2024-${String(1000 + nextSeq)}`;

    const newRecord = {
      id: patientId,
      uhid: uhid,
      name: newPatientForm.name,
      age: parseInt(newPatientForm.age, 10),
      gender: newPatientForm.gender,
      blood: newPatientForm.blood,
      phone: newPatientForm.phone,
      email: newPatientForm.email || `${newPatientForm.name.toLowerCase().replace(/\s+/g, '')}@demo.test`,
      address: newPatientForm.address || 'Registered via Admin Desk',
      status: 'active',
      admissionStatus: newPatientForm.admissionStatus,
      department: newPatientForm.department,
      assignedDoctor: newPatientForm.assignedDoctor,
      bed: newPatientForm.bed || 'General OPD',
      registered: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      vitals: { bp: '120/80 mmHg', pulse: '72 bpm', temp: '98.6°F', spo2: '99%', weight: '65 kg' },
      diagnosis: newPatientForm.diagnosis || 'Initial consultation scheduled',
      allergies: newPatientForm.allergies || 'None reported',
      emergencyContact: {
        name: newPatientForm.emergencyName,
        phone: newPatientForm.emergencyPhone,
        relation: newPatientForm.emergencyRelation,
      },
    };

    saveCustomPatient(newRecord);
    refreshList();
    setIsRegisterOpen(false);
    showToast(`Patient ${newRecord.name} (${newRecord.uhid}) registered successfully!`);

    // Reset Form
    setNewPatientForm({
      name: '',
      age: '',
      gender: 'Male',
      blood: 'O+',
      phone: '',
      email: '',
      address: '',
      department: 'General Medicine',
      assignedDoctor: 'Dr. Ravi Iyer',
      admissionStatus: 'outpatient',
      bed: 'OPD Chamber 1',
      diagnosis: '',
      allergies: 'None reported',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelation: 'Spouse',
    });
  }

  // Handle Edit Patient
  function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingPatient) return;

    updatePatientRecord(editingPatient.id, editingPatient);
    refreshList();
    setEditingPatient(null);
    showToast(`Patient records for ${editingPatient.name} updated.`);
  }

  // Handle Archive
  function handleConfirmArchive() {
    if (!archivingPatient) return;
    archivePatientRecord(archivingPatient.id);
    refreshList();
    setArchivingPatient(null);
    showToast(`Patient ${archivingPatient.name} has been archived/deactivated.`);
  }

  // Toggle Admission Workflow (Inpatient <-> Discharged / Outpatient)
  function handleToggleAdmission(patient) {
    const isAdmitted = patient.admissionStatus === 'inpatient';
    const nextStatus = isAdmitted ? 'discharged' : 'inpatient';
    const nextBed = isAdmitted ? 'Discharged' : 'Ward-A-01';

    updatePatientRecord(patient.id, {
      admissionStatus: nextStatus,
      bed: nextBed,
      lastVisit: new Date().toISOString().split('T')[0],
    });
    refreshList();
    showToast(`${patient.name} status updated to ${nextStatus.toUpperCase()}`);
    if (viewingPatient?.id === patient.id) {
      setViewingPatient((prev) => ({ ...prev, admissionStatus: nextStatus, bed: nextBed }));
    }
  }

  // Export CSV
  function handleExportCSV() {
    const headers = ['UHID', 'Name', 'Age', 'Gender', 'Blood', 'Phone', 'Department', 'Doctor', 'Status'];
    const rows = filteredPatients.map((p) => [
      p.uhid || p.id,
      p.name,
      p.age,
      p.gender,
      p.blood,
      p.phone,
      p.department || 'N/A',
      p.assignedDoctor || 'N/A',
      p.admissionStatus || p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Patients_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppLayout title="Patient Management">
      {/* ── Page Header & Quick Actions ─────────────────────────────────── */}
      <div className="dashboard-header-row">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
            Patient Directory &amp; Records
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Manage inpatient admissions, outpatient appointments, and master UHID health records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Directory (CSV)
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsRegisterOpen(true)}>
            Register New Patient
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          style={{
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            color: 'var(--color-success)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* ── Mini Statistics Row ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#eff6ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.total}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Patients</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bed size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.inpatients}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Inpatients (IPD)</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#eff6ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.outpatients}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Outpatients (OPD)</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.critical}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ICU / Critical</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
            <input
              type="text"
              placeholder="Search by UHID, patient name, doctor, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: 36, height: 38 }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
          </div>

          {/* Department Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Dept:
              </span>
              <select
                className="form-select"
                style={{ height: 38, padding: '0 32px 0 12px', fontSize: '12px' }}
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div className="dashboard-filter-group">
              {ADMISSION_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`dashboard-filter-btn ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Patient Data Table ─────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>UHID &amp; Patient</th>
                <th>Demographics</th>
                <th>Contact</th>
                <th>Department &amp; Doctor</th>
                <th>Ward / Bed</th>
                <th>Admission Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {p.uhid || p.id}
                      </div>
                      <div className="font-medium" style={{ fontSize: '14px' }}>
                        {p.name}
                      </div>
                    </td>

                    <td>
                      <div>
                        {p.age} yrs • {p.gender}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#b91c1c',
                          background: '#fef2f2',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {p.blood}
                      </span>
                    </td>

                    <td>
                      <div>{p.phone}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.email}</div>
                    </td>

                    <td>
                      <div className="font-medium">{p.department || 'General Medicine'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        {p.assignedDoctor || 'Assigned on Admission'}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{p.bed || 'OPD'}</span>
                    </td>

                    <td>
                      <StatusBadge status={p.admissionStatus || p.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        {/* View Clinical Record */}
                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setViewingPatient(p)}
                          title="View Complete Clinical Record"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit Record */}
                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setEditingPatient({ ...p })}
                          title="Edit Patient Details"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Archive / Deactivate */}
                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setArchivingPatient(p)}
                          title="Archive / Deactivate Patient"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No patients match your search criteria. Try modifying your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ─────────────────────────────────────────── */}
        <div className="pagination-container">
          <div>
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(currentPage * PAGE_SIZE, filteredPatients.length)} of {filteredPatients.length} patients
          </div>
          <div className="pagination-btn-group">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </Button>
            <span style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ── MODAL: Register New Patient ─────────────────────────────────── */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Hospital Patient"
        subtitle="Create an official Unique Health Identifier (UHID) and clinical record"
        maxWidth="680px"
      >
        <form onSubmit={handleRegisterSubmit}>
          <div className="form-row">
            <InputField
              id="new-patient-name"
              label="Full Name"
              required
              placeholder="e.g. Meenakshi Sundaram"
              value={newPatientForm.name}
              onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
              error={formErrors.name}
            />

            <InputField
              id="new-patient-age"
              label="Age (Years)"
              type="number"
              required
              placeholder="e.g. 38"
              value={newPatientForm.age}
              onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
              error={formErrors.age}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-patient-gender" className="form-label required">
                Gender
              </label>
              <select
                id="new-patient-gender"
                className="form-select"
                value={newPatientForm.gender}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="new-patient-blood" className="form-label required">
                Blood Group
              </label>
              <select
                id="new-patient-blood"
                className="form-select"
                value={newPatientForm.blood}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, blood: e.target.value })}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <InputField
              id="new-patient-phone"
              label="Mobile Phone (10-Digit)"
              type="tel"
              required
              placeholder="9876543210"
              value={newPatientForm.phone}
              onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
              error={formErrors.phone}
            />

            <InputField
              id="new-patient-email"
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={newPatientForm.email}
              onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-patient-dept" className="form-label required">
                Clinical Department
              </label>
              <select
                id="new-patient-dept"
                className="form-select"
                value={newPatientForm.department}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="new-patient-doc" className="form-label required">
                Assigned Physician
              </label>
              <select
                id="new-patient-doc"
                className="form-select"
                value={newPatientForm.assignedDoctor}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, assignedDoctor: e.target.value })}
              >
                {DOCTORS.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-patient-admit" className="form-label required">
                Admission Type
              </label>
              <select
                id="new-patient-admit"
                className="form-select"
                value={newPatientForm.admissionStatus}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, admissionStatus: e.target.value })}
              >
                <option value="outpatient">Outpatient (OPD)</option>
                <option value="inpatient">Inpatient (IPD Admission)</option>
              </select>
            </div>

            <InputField
              id="new-patient-bed"
              label="Assigned Chamber / Ward"
              placeholder="e.g. Ward-B-04 or OPD Chamber 2"
              value={newPatientForm.bed}
              onChange={(e) => setNewPatientForm({ ...newPatientForm, bed: e.target.value })}
            />
          </div>

          <div className="form-row">
            <InputField
              id="new-patient-emg-name"
              label="Emergency Contact Name"
              required
              placeholder="Emergency Contact Person"
              value={newPatientForm.emergencyName}
              onChange={(e) => setNewPatientForm({ ...newPatientForm, emergencyName: e.target.value })}
              error={formErrors.emergencyName}
            />

            <InputField
              id="new-patient-emg-phone"
              label="Emergency Phone"
              required
              placeholder="Emergency Phone Number"
              value={newPatientForm.emergencyPhone}
              onChange={(e) => setNewPatientForm({ ...newPatientForm, emergencyPhone: e.target.value })}
              error={formErrors.emergencyPhone}
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-patient-diag" className="form-label">
              Provisional Diagnosis / Chief Complaint
            </label>
            <input
              id="new-patient-diag"
              className="form-input"
              placeholder="e.g. Acute abdominal pain, suspected gastroenteritis"
              value={newPatientForm.diagnosis}
              onChange={(e) => setNewPatientForm({ ...newPatientForm, diagnosis: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Patient &amp; Issue UHID
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Clinical Details Drawer ───────────────────────────────── */}
      {viewingPatient && (
        <Modal
          isOpen={!!viewingPatient}
          onClose={() => setViewingPatient(null)}
          title={`Clinical Profile: ${viewingPatient.name}`}
          subtitle={`${viewingPatient.uhid || viewingPatient.id} • Registered ${viewingPatient.registered}`}
          maxWidth="640px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Button
                variant={viewingPatient.admissionStatus === 'inpatient' ? 'danger' : 'primary'}
                onClick={() => handleToggleAdmission(viewingPatient)}
              >
                {viewingPatient.admissionStatus === 'inpatient' ? 'Discharge Patient' : 'Admit to Inpatient Ward'}
              </Button>
              <Button variant="secondary" onClick={() => setViewingPatient(null)}>
                Close Record
              </Button>
            </div>
          }
        >
          {/* Patient Header */}
          <div className="patient-profile-header">
            <div className="patient-avatar-box">
              {viewingPatient.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
                {viewingPatient.name}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {viewingPatient.age} Years • {viewingPatient.gender} • Blood Group:{' '}
                <strong style={{ color: '#b91c1c' }}>{viewingPatient.blood}</strong>
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={viewingPatient.admissionStatus || viewingPatient.status} />
              </div>
            </div>
          </div>

          {/* Vitals Summary */}
          <div className="patient-section-block">
            <div className="patient-section-label">Current Clinical Vitals</div>
            <div className="patient-vitals-grid">
              <div className="vital-metric-card">
                <div className="vital-metric-label">Blood Pressure</div>
                <div className="vital-metric-val">{viewingPatient.vitals?.bp || '120/80 mmHg'}</div>
              </div>
              <div className="vital-metric-card">
                <div className="vital-metric-label">Heart Rate</div>
                <div className="vital-metric-val">{viewingPatient.vitals?.pulse || '74 bpm'}</div>
              </div>
              <div className="vital-metric-card">
                <div className="vital-metric-label">Temperature</div>
                <div className="vital-metric-val">{viewingPatient.vitals?.temp || '98.6°F'}</div>
              </div>
              <div className="vital-metric-card">
                <div className="vital-metric-label">Oxygen SpO2</div>
                <div className="vital-metric-val">{viewingPatient.vitals?.spo2 || '99%'}</div>
              </div>
              <div className="vital-metric-card">
                <div className="vital-metric-label">Body Weight</div>
                <div className="vital-metric-val">{viewingPatient.vitals?.weight || '68 kg'}</div>
              </div>
            </div>
          </div>

          {/* Clinical Case Notes */}
          <div className="patient-section-block">
            <div className="patient-section-label">Diagnosis &amp; Care Directives</div>
            <div
              style={{
                background: 'var(--color-bg)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>
                Primary Diagnosis:
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                {viewingPatient.diagnosis || 'Standard clinical review in progress.'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <div style={{ background: '#fef2f2', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                <strong style={{ color: '#991b1b' }}>Allergies:</strong>
                <p style={{ color: '#7f1d1d', marginTop: 2 }}>{viewingPatient.allergies || 'None reported'}</p>
              </div>

              <div style={{ background: '#eff6ff', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
                <strong style={{ color: '#1e40af' }}>Medical Conditions:</strong>
                <p style={{ color: '#1e3a8a', marginTop: 2 }}>{viewingPatient.conditions || 'None reported'}</p>
              </div>
            </div>
          </div>

          {/* Contact & Assignment info */}
          <div className="patient-section-block">
            <div className="patient-section-label">Hospital Assignment &amp; Contact Info</div>
            <div className="patient-info-row">
              <div className="patient-info-item">
                <span>Department</span>
                <span>{viewingPatient.department || 'General Medicine'}</span>
              </div>
              <div className="patient-info-item">
                <span>Assigned Doctor</span>
                <span>{viewingPatient.assignedDoctor || 'Dr. Ravi Iyer'}</span>
              </div>
              <div className="patient-info-item">
                <span>Primary Phone</span>
                <span>{viewingPatient.phone}</span>
              </div>
              <div className="patient-info-item">
                <span>Email</span>
                <span>{viewingPatient.email}</span>
              </div>
              <div className="patient-info-item">
                <span>Emergency Contact</span>
                <span>
                  {viewingPatient.emergencyContact?.name || viewingPatient.emergencyContactName || 'N/A'} (
                  {viewingPatient.emergencyContact?.phone || viewingPatient.emergencyContactPhone || 'N/A'})
                </span>
              </div>
              <div className="patient-info-item">
                <span>Residential Address</span>
                <span>{viewingPatient.address || 'Registered Address'}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Edit Patient Details ──────────────────────────────────── */}
      {editingPatient && (
        <Modal
          isOpen={!!editingPatient}
          onClose={() => setEditingPatient(null)}
          title={`Edit Patient: ${editingPatient.name}`}
          subtitle={`UHID: ${editingPatient.uhid || editingPatient.id}`}
          maxWidth="560px"
        >
          <form onSubmit={handleEditSubmit}>
            <InputField
              id="edit-name"
              label="Patient Full Name"
              value={editingPatient.name}
              onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
              required
            />

            <div className="form-row">
              <InputField
                id="edit-phone"
                label="Mobile Phone"
                value={editingPatient.phone}
                onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                required
              />
              <InputField
                id="edit-email"
                label="Email"
                value={editingPatient.email}
                onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-dept" className="form-label">
                  Department
                </label>
                <select
                  id="edit-dept"
                  className="form-select"
                  value={editingPatient.department || 'General Medicine'}
                  onChange={(e) => setEditingPatient({ ...editingPatient, department: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-status" className="form-label">
                  Admission Status
                </label>
                <select
                  id="edit-status"
                  className="form-select"
                  value={editingPatient.admissionStatus || 'outpatient'}
                  onChange={(e) => setEditingPatient({ ...editingPatient, admissionStatus: e.target.value })}
                >
                  <option value="outpatient">Outpatient</option>
                  <option value="inpatient">Inpatient</option>
                  <option value="discharged">Discharged</option>
                </select>
              </div>
            </div>

            <InputField
              id="edit-bed"
              label="Assigned Bed / Chamber"
              value={editingPatient.bed || ''}
              onChange={(e) => setEditingPatient({ ...editingPatient, bed: e.target.value })}
            />

            <InputField
              id="edit-address"
              label="Residential Address"
              value={editingPatient.address || ''}
              onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setEditingPatient(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── CONFIRM DIALOG: Archive / Deactivate Patient ─────────────────── */}
      <ConfirmDialog
        isOpen={!!archivingPatient}
        onClose={() => setArchivingPatient(null)}
        onConfirm={handleConfirmArchive}
        title="Archive Patient Record"
        message={`Are you sure you want to deactivate patient "${archivingPatient?.name}" (${archivingPatient?.uhid || archivingPatient?.id})? The record will be safely archived without permanent deletion, conforming to hospital compliance standards.`}
        confirmText="Archive Record"
        cancelText="Cancel"
        variant="danger"
      />
    </AppLayout>
  );
}
