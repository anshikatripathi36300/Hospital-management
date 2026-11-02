/**
 * Login.jsx
 *
 * Full-featured login page supporting:
 * - Email or UHID/Patient ID authentication
 * - Password visibility toggle
 * - Remember me option
 * - Interactive 1-click demo role selector with role details
 * - Newly registered patient detection and quick login
 * - Real-time form validation and feedback
 *
 * Part 3 Roadmap Implementation.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Cross, CheckCircle2, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { DEMO_USERS, getAllUsers } from '../../data/demoData';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ identifier: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState(null);

  // Check if redirected from registration
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setFormData((prev) => ({
        ...prev,
        identifier: location.state.registeredEmail,
        password: location.state.tempPassword || '',
      }));
      setSuccessNotice(`Registration successful for ${location.state.registeredName || 'patient'}! Please sign in.`);
    }
  }, [location.state]);

  // Validation
  function validate() {
    const errs = {};
    if (!formData.identifier.trim()) {
      errs.identifier = 'Email address or Patient UHID is required.';
    }
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 4) {
      errs.password = 'Password must be at least 4 characters.';
    }
    return errs;
  }

  // Submit Handler
  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const result = await login(formData.identifier.trim(), formData.password, formData.rememberMe);
    setLoading(false);

    if (!result.success) {
      setServerError(result.error);
      return;
    }
    navigate(result.redirectTo, { replace: true });
  }

  function handleChange(field) {
    return (e) => {
      const val = field === 'rememberMe' ? e.target.checked : e.target.value;
      setFormData((p) => ({ ...p, [field]: val }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
    };
  }

  // Quick-fill for demo accounts
  function handleSelectDemo(u) {
    setSelectedDemoRole(u.role);
    setFormData({
      identifier: u.email,
      password: u.password,
      rememberMe: false,
    });
    setErrors({});
    setServerError('');
  }

  const allAvailableUsers = getAllUsers();
  // Filter standard demo users plus any newly registered patients
  const demoList = allAvailableUsers.slice(0, 10);

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Cross size={22} color="white" />
          </div>
          <div className="auth-logo-text">
            <h1>MediCare HMS</h1>
            <p>Hospital Management System</p>
          </div>
        </div>

        {/* Success Notice from Registration */}
        {successNotice && (
          <div
            role="status"
            style={{
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: 'var(--font-size-sm)',
              marginBottom: '16px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label="Login form">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 4 }}>Sign In</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Enter your hospital credentials or patient UHID
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              style={{
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 'var(--font-size-sm)',
                marginBottom: '16px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <AlertCircle size={16} />
              {serverError}
            </div>
          )}

          <InputField
            id="login-identifier"
            label="Email or Patient ID / UHID"
            type="text"
            required
            placeholder="e.g. admin@hospital.demo or P-001"
            value={formData.identifier}
            onChange={handleChange('identifier')}
            error={errors.identifier}
            iconLeft={Mail}
            autoComplete="username"
          />

          <InputField
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            iconLeft={Lock}
            iconRight={showPassword ? EyeOff : Eye}
            onIconRightClick={() => setShowPassword((s) => !s)}
            autoComplete="current-password"
          />

          {/* Remember Me & Forgot Password Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: -6,
              marginBottom: 20,
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange('rememberMe')}
                style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            full
            loading={loading}
          >
            Sign In to Portal
          </Button>

          <p
            style={{
              textAlign: 'center',
              marginTop: 18,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            New patient?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Complete Patient Registration
            </Link>
          </p>
        </form>

        {/* Quick Demo Switcher Section */}
        <div
          style={{
            marginTop: 22,
            borderTop: '1px solid var(--color-border)',
            paddingTop: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Shield size={12} color="var(--color-primary)" />
              1-Click Demo Accounts
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Click any role to populate
            </span>
          </div>

          <div className="demo-role-grid">
            {demoList.map((u) => {
              const isSelected = selectedDemoRole === u.role && formData.identifier === u.email;
              const roleTitle = u.role.replace('_', ' ');
              return (
                <button
                  key={u.email}
                  type="button"
                  className={`demo-role-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectDemo(u)}
                  title={`${u.name} — ${u.department || roleTitle}`}
                >
                  <div className="demo-role-avatar">
                    {u.avatar || u.role[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: 'var(--color-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {roleTitle}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {u.name.split(' ')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
