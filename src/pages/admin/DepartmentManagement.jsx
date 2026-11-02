/**
 * DepartmentManagement.jsx
 *
 * Admin Portal — Department Management Module.
 * Features:
 *  - Clinical and administrative department directory
 *  - Department Head (HOD) appointments
 *  - Staff, physician count and inpatient bed allocation oversight
 *  - Add department modal with bed capacity and ward facilities
 *  - Edit department details and Head of Department assignment
 *  - Department detailed summary modal
 *  - CSV Directory Export
 *
 * Part 6 Roadmap Implementation.
 */
import { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Users,
  Stethoscope,
  Bed,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  MapPin,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Modal from '../../components/common/Modal';
import {
  getAllDepartments,
  saveCustomDepartment,
  updateDepartmentRecord,
  getAllDoctors,
} from '../../data/demoData';

const PAGE_SIZE = 6;

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState(() => getAllDepartments());
  const doctors = getAllDoctors();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingDept, setViewingDept] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [newDeptForm, setNewDeptForm] = useState({
    name: '',
    head: doctors[0]?.name || 'Dr. Priya Sharma',
    doctors: 3,
    patients: 20,
    beds: 24,
    block: 'Block A, 2nd Floor',
    extension: '2104',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }

  function refreshList() {
    setDepartments(getAllDepartments());
  }

  // Filter
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const q = searchTerm.toLowerCase().trim();
      return (
        q === '' ||
        d.name.toLowerCase().includes(q) ||
        (d.head && d.head.toLowerCase().includes(q)) ||
        (d.block && d.block.toLowerCase().includes(q))
      );
    });
  }, [departments, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredDepartments.length / PAGE_SIZE) || 1;
  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDepartments.slice(start, start + PAGE_SIZE);
  }, [filteredDepartments, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const totalDoctors = departments.reduce((acc, d) => acc + (d.doctors || 0), 0);
    const totalPatients = departments.reduce((acc, d) => acc + (d.patients || 0), 0);
    const totalBeds = departments.reduce((acc, d) => acc + (d.beds || 24), 0);
    return { totalDepts, totalDoctors, totalPatients, totalBeds };
  }, [departments]);

  // Form Validation
  function validateDept() {
    const errs = {};
    if (!newDeptForm.name.trim()) errs.name = 'Department name is required.';
    if (!newDeptForm.head.trim()) errs.head = 'Department head is required.';
    return errs;
  }

  // Submit Add Department
  function handleAddSubmit(e) {
    e.preventDefault();
    const errs = validateDept();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const nextId = `d${String(departments.length + 1).padStart(2, '0')}`;
    const newRecord = {
      id: nextId,
      name: newDeptForm.name,
      head: newDeptForm.head,
      doctors: parseInt(newDeptForm.doctors || '3', 10),
      patients: parseInt(newDeptForm.patients || '15', 10),
      beds: parseInt(newDeptForm.beds || '20', 10),
      block: newDeptForm.block || 'Main Hospital Block',
      extension: newDeptForm.extension || '2100',
      description: newDeptForm.description || 'Clinical care and diagnostic unit',
    };

    saveCustomDepartment(newRecord);
    refreshList();
    setIsAddOpen(false);
    showToast(`Department ${newRecord.name} added successfully!`);

    setNewDeptForm({
      name: '',
      head: doctors[0]?.name || 'Dr. Priya Sharma',
      doctors: 3,
      patients: 20,
      beds: 24,
      block: 'Block A, 2nd Floor',
      extension: '2104',
      description: '',
    });
  }

  // Submit Edit Department
  function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingDept) return;
    updateDepartmentRecord(editingDept.id, editingDept);
    refreshList();
    setEditingDept(null);
    showToast(`Department ${editingDept.name} updated.`);
  }

  // Export CSV
  function handleExportCSV() {
    const headers = ['Department ID', 'Name', 'Head of Department', 'Doctors', 'Active Patients', 'Total Beds', 'Block / Floor'];
    const rows = filteredDepartments.map((d) => [
      d.id,
      d.name,
      d.head,
      d.doctors || 0,
      d.patients || 0,
      d.beds || 24,
      d.block || 'Main Wing',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Departments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppLayout title="Department Management">
      {/* ── Page Header & Quick Actions ─────────────────────────────────── */}
      <div className="dashboard-header-row">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
            Hospital Clinical &amp; Ward Departments
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Manage clinical department units, designated Department Heads (HOD), ward capacity, and bed allocations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Directory (CSV)
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
            Add Department
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
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.totalDepts}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Specialist Departments</div>
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
            <Stethoscope size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.totalDoctors}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Assigned Physicians</div>
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
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.totalPatients}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Current Census</div>
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
            <Bed size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.totalBeds}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Allocated Inpatient Beds</div>
          </div>
        </div>
      </div>

      {/* ── Search Bar ──────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
        <div style={{ position: 'relative', maxWidth: 450 }}>
          <input
            type="text"
            placeholder="Search departments by name, head of department, or block..."
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
      </div>

      {/* ── Departments Table ───────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Head of Department (HOD)</th>
                <th>Physicians on Staff</th>
                <th>Active Inpatients</th>
                <th>Bed Allocation</th>
                <th>Facility Block</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDepartments.length > 0 ? (
                paginatedDepartments.map((dept) => (
                  <tr key={dept.id}>
                    <td>
                      <div className="font-semibold" style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                        {dept.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Code: {dept.id}</div>
                    </td>

                    <td>
                      <div className="font-medium" style={{ color: 'var(--color-primary)' }}>
                        {dept.head}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Designated HOD</div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600 }}>{dept.doctors}</span> Specialists
                    </td>

                    <td>
                      <span style={{ fontWeight: 600 }}>{dept.patients}</span> Patients
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: '#f0fdf4',
                          color: '#16a34a',
                          fontWeight: 600,
                        }}
                      >
                        {dept.beds || 24} Beds
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px' }}>{dept.block || 'Main Hospital Wing'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Ext: {dept.extension || '2100'}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setViewingDept(dept)}
                          title="View Department Overview"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setEditingDept({ ...dept })}
                          title="Edit Department"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No departments match your search term.
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
            {Math.min(currentPage * PAGE_SIZE, filteredDepartments.length)} of {filteredDepartments.length} departments
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

      {/* ── MODAL: Add Department ───────────────────────────────────────── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Hospital Department"
        subtitle="Configure department unit, designated Head of Department, and ward bed capacity"
        maxWidth="600px"
      >
        <form onSubmit={handleAddSubmit}>
          <InputField
            id="new-dept-name"
            label="Department Name"
            required
            placeholder="e.g. Oncology &amp; Chemotherapy"
            value={newDeptForm.name}
            onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
            error={formErrors.name}
          />

          <div className="form-group">
            <label htmlFor="new-dept-head" className="form-label required">
              Head of Department (HOD)
            </label>
            <select
              id="new-dept-head"
              className="form-select"
              value={newDeptForm.head}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, head: e.target.value })}
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <InputField
              id="new-dept-beds"
              label="Allocated Inpatient Beds"
              type="number"
              placeholder="e.g. 25"
              value={newDeptForm.beds}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, beds: e.target.value })}
            />

            <InputField
              id="new-dept-docs"
              label="Initial Doctors Count"
              type="number"
              placeholder="e.g. 4"
              value={newDeptForm.doctors}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, doctors: e.target.value })}
            />
          </div>

          <div className="form-row">
            <InputField
              id="new-dept-block"
              label="Location / Block &amp; Floor"
              placeholder="e.g. Block C, 3rd Floor"
              value={newDeptForm.block}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, block: e.target.value })}
            />

            <InputField
              id="new-dept-ext"
              label="Intercom Extension"
              placeholder="e.g. 2108"
              value={newDeptForm.extension}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, extension: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-dept-desc" className="form-label">
              Description &amp; Key Facilities
            </label>
            <textarea
              id="new-dept-desc"
              className="form-textarea"
              rows={2}
              placeholder="Describe clinical services, specialized medical equipment, or intensive units..."
              value={newDeptForm.description}
              onChange={(e) => setNewDeptForm({ ...newDeptForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: View Department Overview ─────────────────────────────── */}
      {viewingDept && (
        <Modal
          isOpen={!!viewingDept}
          onClose={() => setViewingDept(null)}
          title={`Department: ${viewingDept.name}`}
          subtitle={`Department Code: ${viewingDept.id}`}
          maxWidth="560px"
          footer={
            <Button variant="secondary" onClick={() => setViewingDept(null)}>
              Close Overview
            </Button>
          }
        >
          <div className="patient-profile-header">
            <div className="patient-avatar-box">
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{viewingDept.name}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                HOD: {viewingDept.head}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Location: {viewingDept.block || 'Main Hospital Wing'} (Ext: {viewingDept.extension || '2100'})
              </div>
            </div>
          </div>

          <div className="patient-section-block">
            <div className="patient-section-label">Unit Capacity &amp; Resource Allocation</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {viewingDept.doctors || 4}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Specialist Doctors</div>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {viewingDept.patients || 30}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Active Inpatients</div>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d97706' }}>
                  {viewingDept.beds || 24}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Beds</div>
              </div>
            </div>

            <div className="patient-section-label">Facilities &amp; Directives</div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {viewingDept.description ||
                'Full clinical outpatient consultations, inpatient management, diagnostic referrals, and emergency on-call triage.'}
            </p>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Edit Department ──────────────────────────────────────── */}
      {editingDept && (
        <Modal
          isOpen={!!editingDept}
          onClose={() => setEditingDept(null)}
          title={`Edit Department: ${editingDept.name}`}
          maxWidth="560px"
        >
          <form onSubmit={handleEditSubmit}>
            <InputField
              id="edit-dept-name"
              label="Department Name"
              value={editingDept.name}
              onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
              required
            />

            <div className="form-group">
              <label className="form-label">Head of Department (HOD)</label>
              <select
                className="form-select"
                value={editingDept.head}
                onChange={(e) => setEditingDept({ ...editingDept, head: e.target.value })}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <InputField
                id="edit-dept-beds"
                label="Allocated Beds"
                type="number"
                value={editingDept.beds || 24}
                onChange={(e) => setEditingDept({ ...editingDept, beds: parseInt(e.target.value, 10) })}
              />

              <InputField
                id="edit-dept-docs"
                label="Doctors Count"
                type="number"
                value={editingDept.doctors || 4}
                onChange={(e) => setEditingDept({ ...editingDept, doctors: parseInt(e.target.value, 10) })}
              />
            </div>

            <InputField
              id="edit-dept-block"
              label="Location / Floor"
              value={editingDept.block || ''}
              onChange={(e) => setEditingDept({ ...editingDept, block: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setEditingDept(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Department
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
