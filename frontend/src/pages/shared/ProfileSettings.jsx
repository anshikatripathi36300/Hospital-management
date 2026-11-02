/**
 * ProfileSettings.jsx — User Profile & Credential Settings (Part 15)
 *
 * Universal account profile management shared across Admin, Doctor, and Patient portals:
 * - Demographic & contact updates
 * - Credential security & password change validation
 * - Active session telemetry & audit compliance
 */
import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  saveCustomUser,
  logAuditEvent,
} from '../../data/demoData';
import {
  User,
  KeyRound,
  Shield,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  Save,
  Lock,
} from 'lucide-react';

export default function ProfileSettings() {
  const { currentUser, login } = useAuth();

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [department, setDepartment] = useState(currentUser?.department || currentUser?.specialization || 'General Healthcare');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated = {
      ...currentUser,
      name,
      email,
      department,
      phone,
    };

    saveCustomUser(updated);

    logAuditEvent({
      userId: currentUser.id,
      userName: name,
      role: currentUser.role,
      action: 'PROFILE_UPDATED',
      category: 'Authentication',
      details: `User demographic information updated for ${email}.`,
    });

    showToast('Personal profile information updated successfully!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    const updated = {
      ...currentUser,
      password: newPassword,
    };

    saveCustomUser(updated);

    logAuditEvent({
      userId: currentUser?.id || 'u001',
      userName: currentUser?.name || 'User',
      role: currentUser?.role || 'user',
      action: 'PASSWORD_CHANGED',
      category: 'Authentication',
      details: `Password changed by user for account ${currentUser?.email}.`,
    });

    showToast('Security password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <AppLayout title="Account & Profile Settings">
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
            <User size={26} color="var(--color-primary-600)" />
            Account &amp; Security Profile
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Manage personal contact credentials, login security, and session authentication.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Profile Information Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="var(--color-primary-600)" />
              Personal &amp; Contact Details
            </h3>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Mobile Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={currentUser?.role?.toUpperCase() || 'USER'}
                  disabled
                  style={{ background: 'var(--color-bg-secondary)', fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Unit</label>
                <input
                  type="text"
                  className="form-control"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button type="submit" variant="primary" icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Password & Security Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={18} color="var(--color-primary-600)" />
              Account Security &amp; Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {passwordError && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '10px 12px',
                  borderRadius: 6,
                  fontSize: '0.82rem',
                }}
              >
                {passwordError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button type="submit" variant="outline" icon={Lock}>
                Update Password
              </Button>
            </div>
          </form>

          {/* Session Security Details */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 14px',
              background: 'var(--color-bg-secondary)',
              borderRadius: 8,
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
              Active Session Details
            </div>
            <div>User ID: <strong>{currentUser?.id}</strong></div>
            <div>Session Type: Role-Based Authenticated JWT / Demo State</div>
            <div>Security Level: HIPAA / ISO 27001 Simulated Security</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
