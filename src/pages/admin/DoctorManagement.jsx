/**
 * DoctorManagement.jsx
 *
 * Admin Portal — Doctor Management Module.
 * Features:
 *  - Medical staff registry, qualifications, license numbers
 *  - Search by doctor name, specialization, department
 *  - Filter by department and availability schedule
 *  - Register new physician modal with fee and consulting chamber
 *  - Doctor profile and weekly schedule modal
 *  - Edit physician details and chamber
 *  - Deactivate / On-leave status toggle
 *  - CSV Directory Export
 *
 * Part 6 Roadmap Implementation.
 */
import { useState, useMemo } from 'react';
import {
  Stethoscope,
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Calendar,
  Clock,
  Phone,
  Mail,
  Award,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserX,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  getAllDoctors,
  saveCustomDoctor,
  updateDoctorRecord,
  getAllDepartments,
} from '../../data/demoData';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PAGE_SIZE = 6;

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState(() => getAllDoctors());
  const departments = getAllDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deactivatingDoctor, setDeactivatingDoctor] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Register Form State
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    experience: '',
    phone: '',
    email: '',
    qualifications: '',
    licenseNumber: '',
    chamber: 'OPD Chamber 1 (Block A)',
    fee: 750,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shift: '09:00 - 14:00',
  });
  const [formErrors, setFormErrors] = useState({});

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }

  function refreshList() {
    setDoctors(getAllDoctors());
  }

  // Filter & Search
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        doc.name.toLowerCase().includes(q) ||
        doc.specialization.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        (doc.licenseNumber && doc.licenseNumber.toLowerCase().includes(q));

      const matchesDept = deptFilter === 'all' || doc.department === deptFilter;
      const matchesDay = dayFilter === 'all' || (doc.availableDays && doc.availableDays.includes(dayFilter));

      return matchesSearch && matchesDept && matchesDay;
    });
  }, [doctors, searchTerm, deptFilter, dayFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / PAGE_SIZE) || 1;
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDoctors.slice(start, start + PAGE_SIZE);
  }, [filteredDoctors, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = doctors.length;
    const active = doctors.filter((d) => d.status === 'active').length;
    const specializations = new Set(doctors.map((d) => d.specialization)).size;
    const avgFee = Math.round(doctors.reduce((sum, d) => sum + (d.fee || 600), 0) / (total || 1));
    return { total, active, specializations, avgFee };
  }, [doctors]);

  // Form Validation
  function validateNewDoctor() {
    const errs = {};
    if (!newDoctorForm.name.trim()) errs.name = 'Doctor name is required.';
    if (!newDoctorForm.specialization.trim()) errs.specialization = 'Specialization is required.';
    if (!newDoctorForm.phone.trim()) errs.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(newDoctorForm.phone.replace(/[\s-]/g, ''))) {
      errs.phone = '10-digit phone number is required.';
    }
    if (!newDoctorForm.licenseNumber.trim()) errs.licenseNumber = 'Medical license number is required.';
    if (newDoctorForm.availableDays.length === 0) errs.availableDays = 'Select at least one available day.';
    return errs;
  }

  // Register Doctor Submit
  function handleRegisterSubmit(e) {
    e.preventDefault();
    const errs = validateNewDoctor();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const nextSeq = doctors.length + 1;
    const doctorId = `D-${String(nextSeq).padStart(3, '0')}`;

    const newRecord = {
      id: doctorId,
      name: newDoctorForm.name.startsWith('Dr.') ? newDoctorForm.name : `Dr. ${newDoctorForm.name}`,
      specialization: newDoctorForm.specialization,
      department: newDoctorForm.department,
      experience: parseInt(newDoctorForm.experience || '5', 10),
      phone: newDoctorForm.phone,
      email: newDoctorForm.email || `${newDoctorForm.name.toLowerCase().replace(/[^a-z]/g, '')}@hospital.demo`,
      status: 'active',
      qualifications: newDoctorForm.qualifications || 'MBBS, MD',
      licenseNumber: newDoctorForm.licenseNumber,
      chamber: newDoctorForm.chamber,
      fee: parseInt(newDoctorForm.fee, 10) || 700,
      availableDays: newDoctorForm.availableDays,
      shift: newDoctorForm.shift,
    };

    saveCustomDoctor(newRecord);
    refreshList();
    setIsRegisterOpen(false);
    showToast(`${newRecord.name} registered successfully with ID ${newRecord.id}!`);

    // Reset
    setNewDoctorForm({
      name: '',
      specialization: 'Cardiologist',
      department: 'Cardiology',
      experience: '',
      phone: '',
      email: '',
      qualifications: '',
      licenseNumber: '',
      chamber: 'OPD Chamber 1 (Block A)',
      fee: 750,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      shift: '09:00 - 14:00',
    });
  }

  // Edit Doctor Submit
  function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingDoctor) return;
    updateDoctorRecord(editingDoctor.id, editingDoctor);
    refreshList();
    setEditingDoctor(null);
    showToast(`Profile details for ${editingDoctor.name} updated.`);
  }

  // Confirm Deactivate
  function handleConfirmDeactivate() {
    if (!deactivatingDoctor) return;
    const nextStatus = deactivatingDoctor.status === 'active' ? 'inactive' : 'active';
    updateDoctorRecord(deactivatingDoctor.id, { status: nextStatus });
    refreshList();
    setDeactivatingDoctor(null);
    showToast(`${deactivatingDoctor.name} status updated to ${nextStatus.toUpperCase()}`);
  }

  // Toggle Day Selection in Register Form
  function toggleDay(day) {
    setNewDoctorForm((prev) => {
      const exists = prev.availableDays.includes(day);
      const updated = exists ? prev.availableDays.filter((d) => d !== day) : [...prev.availableDays, day];
      return { ...prev, availableDays: updated };
    });
  }

  // Export CSV
  function handleExportCSV() {
    const headers = ['Doctor ID', 'Name', 'Specialization', 'Department', 'License', 'Phone', 'Chamber', 'Fee (INR)', 'Status'];
    const rows = filteredDoctors.map((d) => [
      d.id,
      d.name,
      d.specialization,
      d.department,
      d.licenseNumber || 'N/A',
      d.phone,
      d.chamber || 'OPD',
      d.fee || 600,
      d.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Doctors_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppLayout title="Doctor Management">
      {/* ── Page Header & Quick Actions ─────────────────────────────────── */}
      <div className="dashboard-header-row">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
            Physician Directory &amp; Schedules
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Manage medical specialist credentials, consultation fees, duty chambers, and weekly OPD schedules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Directory (CSV)
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsRegisterOpen(true)}>
            Register New Physician
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

      {/* ── KPI Stat Row ────────────────────────────────────────────────── */}
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
            <Stethoscope size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.total}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Registered Physicians</div>
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
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.active}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Active On Staff</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.specializations}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Medical Specialties</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{stats.avgFee}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Average OPD Fee</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ────────────────────────────────────────────── */}
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
              placeholder="Search by physician name, specialty, license..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Department Filter */}
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
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Day Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Day:
              </span>
              <select
                className="form-select"
                style={{ height: 38, padding: '0 32px 0 12px', fontSize: '12px' }}
                value={dayFilter}
                onChange={(e) => {
                  setDayFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Any Day</option>
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Doctors Table ───────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Physician Details</th>
                <th>Specialization &amp; Dept</th>
                <th>Credentials &amp; License</th>
                <th>Chamber &amp; OPD Fee</th>
                <th>Available Days</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDoctors.length > 0 ? (
                paginatedDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="font-semibold" style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        ID: {doc.id} • {doc.experience} yrs exp
                      </div>
                    </td>

                    <td>
                      <div className="font-medium" style={{ color: 'var(--color-primary)' }}>
                        {doc.specialization}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{doc.department}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px' }}>{doc.qualifications}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {doc.licenseNumber || 'Verified License'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px' }}>{doc.chamber || 'OPD General'}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-success)' }}>
                        ₹{doc.fee || 600} / Visit
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 160 }}>
                        {doc.availableDays?.map((d) => (
                          <span
                            key={d}
                            style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-sm)',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontWeight: 600,
                            }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={doc.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setViewingDoctor(doc)}
                          title="View Doctor Profile &amp; Roster"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setEditingDoctor({ ...doc })}
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setDeactivatingDoctor(doc)}
                          title={doc.status === 'active' ? 'Mark On-Leave / Inactive' : 'Activate Doctor'}
                          style={{ color: doc.status === 'active' ? 'var(--color-warning)' : 'var(--color-success)' }}
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No physicians match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="pagination-container">
          <div>
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(currentPage * PAGE_SIZE, filteredDoctors.length)} of {filteredDoctors.length} physicians
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

      {/* ── MODAL: Register New Physician ───────────────────────────────── */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register Medical Specialist"
        subtitle="Add a licensed physician to hospital departments and OPD consultation rosters"
        maxWidth="680px"
      >
        <form onSubmit={handleRegisterSubmit}>
          <div className="form-row">
            <InputField
              id="new-doc-name"
              label="Physician Full Name"
              required
              placeholder="e.g. Dr. Ramesh Gupta"
              value={newDoctorForm.name}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
              error={formErrors.name}
            />

            <InputField
              id="new-doc-spec"
              label="Specialization"
              required
              placeholder="e.g. Cardiothoracic Surgeon"
              value={newDoctorForm.specialization}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialization: e.target.value })}
              error={formErrors.specialization}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-doc-dept" className="form-label required">
                Department
              </label>
              <select
                id="new-doc-dept"
                className="form-select"
                value={newDoctorForm.department}
                onChange={(e) => setNewDoctorForm({ ...newDoctorForm, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              id="new-doc-exp"
              label="Years of Experience"
              type="number"
              placeholder="e.g. 10"
              value={newDoctorForm.experience}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, experience: e.target.value })}
            />
          </div>

          <div className="form-row">
            <InputField
              id="new-doc-license"
              label="Medical Council Registration / License No."
              required
              placeholder="e.g. MCI-2016-0928"
              value={newDoctorForm.licenseNumber}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, licenseNumber: e.target.value })}
              error={formErrors.licenseNumber}
            />

            <InputField
              id="new-doc-qual"
              label="Qualifications &amp; Degrees"
              placeholder="e.g. MBBS, MS, MCh Surgery"
              value={newDoctorForm.qualifications}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, qualifications: e.target.value })}
            />
          </div>

          <div className="form-row">
            <InputField
              id="new-doc-phone"
              label="Contact Mobile"
              type="tel"
              required
              placeholder="9811000000"
              value={newDoctorForm.phone}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, phone: e.target.value })}
              error={formErrors.phone}
            />

            <InputField
              id="new-doc-fee"
              label="OPD Consultation Fee (₹)"
              type="number"
              required
              value={newDoctorForm.fee}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, fee: e.target.value })}
            />
          </div>

          <div className="form-row">
            <InputField
              id="new-doc-chamber"
              label="Consultation Chamber / Bay"
              placeholder="e.g. OPD Chamber 6 (Block B)"
              value={newDoctorForm.chamber}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, chamber: e.target.value })}
            />

            <InputField
              id="new-doc-shift"
              label="Duty Shift Timing"
              placeholder="e.g. 09:00 - 14:00"
              value={newDoctorForm.shift}
              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, shift: e.target.value })}
            />
          </div>

          {/* Availability Days Checkboxes */}
          <div className="form-group">
            <label className="form-label required">Weekly OPD Consultation Days</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = newDoctorForm.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: isSelected ? 'white' : 'var(--color-text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {formErrors.availableDays && <span className="form-error">{formErrors.availableDays}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Physician
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Doctor Profile & Timetable ────────────────────────────── */}
      {viewingDoctor && (
        <Modal
          isOpen={!!viewingDoctor}
          onClose={() => setViewingDoctor(null)}
          title={`Physician Credentials: ${viewingDoctor.name}`}
          subtitle={`${viewingDoctor.id} • ${viewingDoctor.specialization}`}
          maxWidth="600px"
          footer={
            <Button variant="secondary" onClick={() => setViewingDoctor(null)}>
              Close Profile
            </Button>
          }
        >
          <div className="patient-profile-header">
            <div className="patient-avatar-box" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
              <Stethoscope size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{viewingDoctor.name}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                {viewingDoctor.specialization} — {viewingDoctor.department}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Qualifications: {viewingDoctor.qualifications} ({viewingDoctor.experience} Years Experience)
              </div>
            </div>
          </div>

          <div className="patient-section-block">
            <div className="patient-section-label">Consultation Schedule &amp; Facility</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                fontSize: 'var(--font-size-sm)',
                background: 'var(--color-bg)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                marginBottom: 14,
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Consulting Chamber:</span>
                <div style={{ fontWeight: 600 }}>{viewingDoctor.chamber || 'OPD Block A'}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Consultation Fee:</span>
                <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{viewingDoctor.fee || 600}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Daily Hours:</span>
                <div style={{ fontWeight: 500 }}>{viewingDoctor.shift || '09:00 - 14:00'}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Medical License:</span>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{viewingDoctor.licenseNumber}</div>
              </div>
            </div>

            <div className="patient-section-label">Available Days in Clinic</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DAYS_OF_WEEK.map((d) => {
                const isAvail = viewingDoctor.availableDays?.includes(d);
                return (
                  <div
                    key={d}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: isAvail ? '#dcfce7' : '#f1f5f9',
                      color: isAvail ? '#15803d' : '#94a3b8',
                      border: isAvail ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    }}
                  >
                    {d} {isAvail ? '✓' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Edit Doctor ──────────────────────────────────────────── */}
      {editingDoctor && (
        <Modal
          isOpen={!!editingDoctor}
          onClose={() => setEditingDoctor(null)}
          title={`Edit Physician: ${editingDoctor.name}`}
          maxWidth="560px"
        >
          <form onSubmit={handleEditSubmit}>
            <InputField
              id="edit-doc-name"
              label="Full Name"
              value={editingDoctor.name}
              onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
              required
            />

            <div className="form-row">
              <InputField
                id="edit-doc-spec"
                label="Specialization"
                value={editingDoctor.specialization}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                required
              />

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={editingDoctor.department}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, department: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <InputField
                id="edit-doc-chamber"
                label="Chamber Location"
                value={editingDoctor.chamber || ''}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, chamber: e.target.value })}
              />

              <InputField
                id="edit-doc-fee"
                label="Fee (₹)"
                type="number"
                value={editingDoctor.fee || 600}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, fee: parseInt(e.target.value, 10) })}
              />
            </div>

            <InputField
              id="edit-doc-phone"
              label="Contact Phone"
              value={editingDoctor.phone || ''}
              onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setEditingDoctor(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Doctor Profile
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── CONFIRM DIALOG: Deactivate / Toggle Status ──────────────────── */}
      <ConfirmDialog
        isOpen={!!deactivatingDoctor}
        onClose={() => setDeactivatingDoctor(null)}
        onConfirm={handleConfirmDeactivate}
        title="Update Physician Active Status"
        message={`Are you sure you want to change status for "${deactivatingDoctor?.name}" to ${
          deactivatingDoctor?.status === 'active' ? 'INACTIVE / ON-LEAVE' : 'ACTIVE'
        }?`}
        confirmText={deactivatingDoctor?.status === 'active' ? 'Mark Inactive' : 'Activate'}
        variant={deactivatingDoctor?.status === 'active' ? 'warning' : 'primary'}
      />
    </AppLayout>
  );
}
