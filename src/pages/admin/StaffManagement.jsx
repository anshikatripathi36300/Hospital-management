/**
 * StaffManagement.jsx
 *
 * Admin Portal — Staff Management Module.
 * Features:
 *  - Directory of hospital human resources: Nurses, Receptionists, Lab Technicians, Pharmacists, Accountants
 *  - Role & Shift-based filtering and search
 *  - Register new staff member modal
 *  - Edit staff details and duty shift modal
 *  - Status toggle (Active / On-Leave / Inactive) with confirmation
 *  - CSV Directory Export
 *
 * Part 6 Roadmap Implementation.
 */
import { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Clock,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  HeartPulse,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  getAllStaff,
  saveCustomStaff,
  updateStaffRecord,
  getAllDepartments,
} from '../../data/demoData';

const STAFF_ROLES = ['Nurse', 'Receptionist', 'Lab Technician', 'Pharmacist', 'Accountant', 'Support Staff'];
const SHIFTS = [
  'Morning (07:00 - 15:00)',
  'Regular (09:00 - 17:00)',
  'Evening (14:00 - 22:00)',
  'Night (22:00 - 07:00)',
  'Rotational',
];
const PAGE_SIZE = 6;

export default function StaffManagement() {
  const [staffList, setStaffList] = useState(() => getAllStaff());
  const departments = getAllDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deactivatingStaff, setDeactivatingStaff] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: 'Nurse',
    department: 'General Ward',
    shift: 'Morning (07:00 - 15:00)',
    phone: '',
    email: '',
    qualification: '',
    joinedDate: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState({});

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }

  function refreshList() {
    setStaffList(getAllStaff());
  }

  // Filtering
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.phone.includes(q);

      const matchesRole = roleFilter === 'all' || s.role === roleFilter;
      const matchesShift = shiftFilter === 'all' || (s.shift && s.shift.includes(shiftFilter));

      return matchesSearch && matchesRole && matchesShift;
    });
  }, [staffList, searchTerm, roleFilter, shiftFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / PAGE_SIZE) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStaff.slice(start, start + PAGE_SIZE);
  }, [filteredStaff, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => s.status === 'active').length;
    const nurses = staffList.filter((s) => s.role === 'Nurse').length;
    const adminSupport = total - nurses;
    return { total, active, nurses, adminSupport };
  }, [staffList]);

  // Form Validation
  function validateStaff() {
    const errs = {};
    if (!newStaffForm.name.trim()) errs.name = 'Staff name is required.';
    if (!newStaffForm.phone.trim()) errs.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(newStaffForm.phone.replace(/[\s-]/g, ''))) {
      errs.phone = '10-digit phone number is required.';
    }
    return errs;
  }

  // Handle Add Staff
  function handleRegisterSubmit(e) {
    e.preventDefault();
    const errs = validateStaff();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const nextSeq = staffList.length + 1;
    const staffId = `ST-${String(nextSeq).padStart(3, '0')}`;

    const newRecord = {
      id: staffId,
      name: newStaffForm.name,
      role: newStaffForm.role,
      department: newStaffForm.department,
      shift: newStaffForm.shift,
      phone: newStaffForm.phone,
      email: newStaffForm.email || `${newStaffForm.name.toLowerCase().replace(/[^a-z]/g, '')}@hospital.demo`,
      status: 'active',
      qualification: newStaffForm.qualification || 'Certified Professional',
      joinedDate: newStaffForm.joinedDate,
    };

    saveCustomStaff(newRecord);
    refreshList();
    setIsRegisterOpen(false);
    showToast(`Staff member ${newRecord.name} registered with ID ${newRecord.id}!`);

    setNewStaffForm({
      name: '',
      role: 'Nurse',
      department: 'General Ward',
      shift: 'Morning (07:00 - 15:00)',
      phone: '',
      email: '',
      qualification: '',
      joinedDate: new Date().toISOString().split('T')[0],
    });
  }

  // Handle Edit Staff
  function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingStaff) return;
    updateStaffRecord(editingStaff.id, editingStaff);
    refreshList();
    setEditingStaff(null);
    showToast(`Details for ${editingStaff.name} updated.`);
  }

  // Confirm Status Toggle
  function handleConfirmDeactivate() {
    if (!deactivatingStaff) return;
    const nextStatus = deactivatingStaff.status === 'active' ? 'inactive' : 'active';
    updateStaffRecord(deactivatingStaff.id, { status: nextStatus });
    refreshList();
    setDeactivatingStaff(null);
    showToast(`${deactivatingStaff.name} marked as ${nextStatus.toUpperCase()}`);
  }

  // Export CSV
  function handleExportCSV() {
    const headers = ['Staff ID', 'Name', 'Role', 'Department', 'Shift', 'Phone', 'Email', 'Status'];
    const rows = filteredStaff.map((s) => [
      s.id,
      s.name,
      s.role,
      s.department,
      s.shift,
      s.phone,
      s.email,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Staff_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AppLayout title="Staff Management">
      {/* ── Page Header & Quick Actions ─────────────────────────────────── */}
      <div className="dashboard-header-row">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
            Hospital Human Resources &amp; Staff Directory
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Manage nursing officers, reception desks, lab technicians, pharmacy staff, and duty shift allocations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Directory (CSV)
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsRegisterOpen(true)}>
            Add Staff Member
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
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.total}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Hospital Staff</div>
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
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Active on Roster</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: '#fdf2f8',
              color: '#db2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartPulse size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.nurses}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Nursing Officers</div>
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
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.adminSupport}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Tech &amp; Operations Staff</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
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
              placeholder="Search staff by name, ID, role, department..."
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
            {/* Role Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Role:
              </span>
              <select
                className="form-select"
                style={{ height: 38, padding: '0 32px 0 12px', fontSize: '12px' }}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Roles</option>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Shift:
              </span>
              <select
                className="form-select"
                style={{ height: 38, padding: '0 32px 0 12px', fontSize: '12px' }}
                value={shiftFilter}
                onChange={(e) => {
                  setShiftFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Regular">Regular</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Staff Table ─────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Details</th>
                <th>Role &amp; Department</th>
                <th>Duty Shift Timing</th>
                <th>Contact Phone</th>
                <th>Credentials / Qual</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.length > 0 ? (
                paginatedStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div className="font-semibold" style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                        {staff.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        ID: {staff.id} • Joined {staff.joinedDate || '2022'}
                      </div>
                    </td>

                    <td>
                      <div className="font-medium" style={{ color: 'var(--color-primary)' }}>
                        {staff.role}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{staff.department}</div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: '#f1f5f9',
                          color: '#334155',
                          fontWeight: 500,
                        }}
                      >
                        <Clock size={11} />
                        {staff.shift}
                      </span>
                    </td>

                    <td>
                      <div>{staff.phone}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{staff.email}</div>
                    </td>

                    <td>
                      <span style={{ fontSize: '12px' }}>{staff.qualification || 'Certified Staff'}</span>
                    </td>

                    <td>
                      <StatusBadge status={staff.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setEditingStaff({ ...staff })}
                          title="Edit Details &amp; Shift"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon btn-secondary"
                          onClick={() => setDeactivatingStaff(staff)}
                          title={staff.status === 'active' ? 'Mark Inactive' : 'Activate Staff'}
                          style={{ color: staff.status === 'active' ? 'var(--color-warning)' : 'var(--color-success)' }}
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
                    No staff members match the selected filters.
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
            {Math.min(currentPage * PAGE_SIZE, filteredStaff.length)} of {filteredStaff.length} employees
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

      {/* ── MODAL: Add Staff Member ─────────────────────────────────────── */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Add Hospital Staff Member"
        subtitle="Register nursing, front desk, pharmacy, or laboratory personnel"
        maxWidth="600px"
      >
        <form onSubmit={handleRegisterSubmit}>
          <InputField
            id="new-staff-name"
            label="Full Name"
            required
            placeholder="e.g. Shalini Deshpande"
            value={newStaffForm.name}
            onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
            error={formErrors.name}
          />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-staff-role" className="form-label required">
                Hospital Role
              </label>
              <select
                id="new-staff-role"
                className="form-select"
                value={newStaffForm.role}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="new-staff-dept" className="form-label required">
                Assigned Department / Unit
              </label>
              <select
                id="new-staff-dept"
                className="form-select"
                value={newStaffForm.department}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
                <option value="Front Desk">Front Desk</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Billing & Accounts">Billing &amp; Accounts</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="new-staff-shift" className="form-label required">
              Duty Shift Timing
            </label>
            <select
              id="new-staff-shift"
              className="form-select"
              value={newStaffForm.shift}
              onChange={(e) => setNewStaffForm({ ...newStaffForm, shift: e.target.value })}
            >
              {SHIFTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <InputField
              id="new-staff-phone"
              label="Contact Phone"
              required
              placeholder="9822000000"
              value={newStaffForm.phone}
              onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
              error={formErrors.phone}
            />

            <InputField
              id="new-staff-email"
              label="Email Address"
              type="email"
              placeholder="staff@hospital.demo"
              value={newStaffForm.email}
              onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
            />
          </div>

          <InputField
            id="new-staff-qual"
            label="Qualifications &amp; Certifications"
            placeholder="e.g. B.Sc Nursing, BLS Certification"
            value={newStaffForm.qualification}
            onChange={(e) => setNewStaffForm({ ...newStaffForm, qualification: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Edit Staff Member ────────────────────────────────────── */}
      {editingStaff && (
        <Modal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          title={`Edit Staff: ${editingStaff.name}`}
          subtitle={`ID: ${editingStaff.id}`}
          maxWidth="560px"
        >
          <form onSubmit={handleEditSubmit}>
            <InputField
              id="edit-staff-name"
              label="Full Name"
              value={editingStaff.name}
              onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
              required
            />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hospital Role</label>
                <select
                  className="form-select"
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                >
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Department</label>
                <select
                  className="form-select"
                  value={editingStaff.department}
                  onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                  <option value="Front Desk">Front Desk</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Billing & Accounts">Billing &amp; Accounts</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Duty Shift</label>
              <select
                className="form-select"
                value={editingStaff.shift}
                onChange={(e) => setEditingStaff({ ...editingStaff, shift: e.target.value })}
              >
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              id="edit-staff-phone"
              label="Contact Phone"
              value={editingStaff.phone}
              onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setEditingStaff(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── CONFIRM DIALOG: Deactivate Staff ────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deactivatingStaff}
        onClose={() => setDeactivatingStaff(null)}
        onConfirm={handleConfirmDeactivate}
        title="Update Staff Active Status"
        message={`Are you sure you want to change status for ${deactivatingStaff?.name} (${deactivatingStaff?.role}) to ${
          deactivatingStaff?.status === 'active' ? 'INACTIVE' : 'ACTIVE'
        }?`}
        confirmText={deactivatingStaff?.status === 'active' ? 'Mark Inactive' : 'Activate'}
        variant={deactivatingStaff?.status === 'active' ? 'warning' : 'primary'}
      />
    </AppLayout>
  );
}
