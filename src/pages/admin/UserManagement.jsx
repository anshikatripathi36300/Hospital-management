/**
 * UserManagement.jsx — Role-Based Access Control (RBAC) & User Directory (Part 15)
 *
 * User account directory across all 8 roles, credential provisioning,
 * account lock/suspension toggle, password reset, and access privilege governance.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getAllUsers,
  saveCustomUser,
  toggleUserStatus,
  logAuditEvent,
} from '../../data/demoData';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

const ROLE_DISPLAY_NAMES = {
  admin: 'Administrator',
  doctor: 'Doctor / Physician',
  patient: 'Registered Patient',
  receptionist: 'Front Desk Receptionist',
  nurse: 'Nursing Staff (RN)',
  lab_technician: 'Laboratory Technologist',
  pharmacist: 'Licensed Pharmacist',
  accountant: 'Billing & Accounts Officer',
};

export default function UserManagement() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [addUserModal, setAddUserModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('demo1234');
  const [toast, setToast] = useState('');

  // Add User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  const [role, setRole] = useState('doctor');
  const [department, setDepartment] = useState('General Medicine');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    setUsers(getAllUsers());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Toggle Status (Active / Suspended)
  const handleToggleStatus = (u) => {
    const updated = toggleUserStatus(u.id);
    if (!updated) return;

    logAuditEvent({
      userId: currentUser?.id || 'u001',
      userName: currentUser?.name || 'Admin User',
      role: 'admin',
      action: 'USER_STATUS_TOGGLED',
      category: 'Authentication',
      details: `User ${u.name} (${u.email}) status changed to ${updated.status}.`,
    });

    showToast(`User ${u.name} is now ${updated.status}.`);
    loadData();
  };

  // Open Reset Password
  const openResetPassword = (u) => {
    setSelectedUser(u);
    setNewPassword('demo1234');
    setResetModal(true);
  };

  // Handle Reset Password
  const handleConfirmReset = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updated = { ...selectedUser, password: newPassword };
    saveCustomUser(updated);

    logAuditEvent({
      userId: currentUser?.id || 'u001',
      userName: currentUser?.name || 'Admin User',
      role: 'admin',
      action: 'PASSWORD_RESET',
      category: 'Authentication',
      details: `Password reset issued for user ${selectedUser.email}.`,
    });

    showToast(`Password for ${selectedUser.name} has been reset.`);
    setResetModal(false);
    loadData();
  };

  // Handle Add User
  const handleAddUser = (e) => {
    e.preventDefault();
    const newId = `u${String(users.length + 1).padStart(3, '0')}`;
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser = {
      id: newId,
      name,
      email,
      password,
      role,
      avatar: initials || 'US',
      department,
      status: 'Active',
      lastLogin: 'Never',
    };

    saveCustomUser(newUser);

    logAuditEvent({
      userId: currentUser?.id || 'u001',
      userName: currentUser?.name || 'Admin User',
      role: 'admin',
      action: 'USER_CREATED',
      category: 'Authentication',
      details: `New account ${newUser.email} created with role '${role}'.`,
    });

    showToast(`Account for ${newUser.name} created successfully!`);
    setAddUserModal(false);
    setName('');
    setEmail('');
    loadData();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  return (
    <AppLayout title="User Management & RBAC">
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: '#1e293b',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} color="#22c55e" />
          {toast}
        </div>
      )}

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={26} color="var(--color-primary-600)" />
            Role-Based Access Control (RBAC) User Directory
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Provision user accounts, assign role permissions, reset security credentials, and manage account statuses.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={() => setAddUserModal(true)}>
          Create User Account
        </Button>
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
              placeholder="Search by Name, Email, or Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: 190 }}
            >
              <option value="all">All Roles (8)</option>
              <option value="admin">Administrator</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="receptionist">Receptionist</option>
              <option value="nurse">Nurse</option>
              <option value="lab_technician">Lab Technician</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 140 }}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role &amp; Permissions</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Security Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No user accounts match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isActive = u.status === 'Active';
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: 'var(--color-primary-100)',
                              color: 'var(--color-primary-800)',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {u.avatar || u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'var(--color-bg-secondary)',
                            color: 'var(--color-primary-700)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          {ROLE_DISPLAY_NAMES[u.role] || u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{u.department || 'Clinical Hospital'}</td>
                      <td>
                        <span
                          style={{
                            background: isActive ? '#ecfdf5' : '#fee2e2',
                            color: isActive ? '#047857' : '#b91c1c',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        {u.lastLogin || '2026-10-27'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={KeyRound}
                            onClick={() => openResetPassword(u)}
                          >
                            Reset Password
                          </Button>

                          <Button
                            size="sm"
                            variant={isActive ? 'danger' : 'success'}
                            icon={isActive ? Lock : Unlock}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {isActive ? 'Lock' : 'Unlock'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {addUserModal && (
        <Modal
          isOpen={addUserModal}
          onClose={() => setAddUserModal(false)}
          title="Provision New Hospital Account"
        >
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Legal Name *</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Dr. Ramesh Gupta"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Institutional Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ramesh@hospital.demo"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Password *</label>
                <input
                  type="text"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Assigned Role (RBAC) *</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">Administrator</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="nurse">Nurse</option>
                  <option value="lab_technician">Lab Technician</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="accountant">Accountant</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department / Assignment</label>
                <input
                  type="text"
                  className="form-control"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Cardiology, Front Desk, General Ward"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setAddUserModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={PlusCircle}>
                Provision Account
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetModal && selectedUser && (
        <Modal
          isOpen={resetModal}
          onClose={() => setResetModal(false)}
          title={`Reset Password — ${selectedUser.name}`}
        >
          <form onSubmit={handleConfirmReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
              }}
            >
              <div><strong>User Account:</strong> {selectedUser.name} ({selectedUser.email})</div>
              <div><strong>Assigned Role:</strong> {selectedUser.role}</div>
            </div>

            <div className="form-group">
              <label className="form-label">New Temporary Password *</label>
              <input
                type="text"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                User will be asked to update their password upon next authentication.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setResetModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Save New Password
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
