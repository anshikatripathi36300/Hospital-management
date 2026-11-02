/**
 * ForgotPassword.jsx — Placeholder forgot-password page.
 * Password reset will be implemented in the backend phase.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Cross, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Cross size={22} color="white" /></div>
          <div className="auth-logo-text">
            <h1>MediCare HMS</h1>
            <p>Password Recovery</p>
          </div>
        </div>

        <div
          style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 20, fontSize: 'var(--font-size-xs)', color: '#92400e', display: 'flex', gap: 8 }}
          role="note"
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span><strong>DEMO</strong> — Password reset is not implemented yet. It requires the backend email service.</span>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 style={{ marginBottom: 8 }}>Check your email</h2>
            <p style={{ marginBottom: 24, fontSize: 'var(--font-size-sm)' }}>
              In the live system, a reset link would be sent to <strong>{email}</strong>.
              This is a demo — no email was sent.
            </p>
            <Link to="/login">
              <Button variant="primary" full>Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 4 }}>Forgot Password</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Enter your email and we'll send a reset link.
            </p>
            <InputField
              id="forgot-email" label="Email Address" type="email" required
              placeholder="your@email.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
              error={error} iconLeft={Mail}
            />
            <Button type="submit" variant="primary" size="lg" full loading={loading}>
              Send Reset Link
            </Button>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
              <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>← Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
