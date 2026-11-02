/**
 * AuthLayout.jsx
 *
 * Layout for unauthenticated pages (Login, Register, Forgot Password).
 * Shows the blue brand panel on the left (desktop) and the form on the right.
 */
import { Cross } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {/* Left panel — visible only on large screens */}
      <div className="auth-panel-left" aria-hidden="true">
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: 72, height: 72,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Cross size={40} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '1.75rem', marginBottom: 12 }}>
            MediCare HMS
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 280, lineHeight: 1.7 }}>
            A comprehensive hospital management platform for patients,
            doctors, and hospital staff.
          </p>
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              '✓ Patient registration and management',
              '✓ Appointment scheduling',
              '✓ Electronic medical records',
              '✓ Billing and pharmacy management',
            ].map((item) => (
              <div key={item} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', textAlign: 'left' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form area */}
      <div className="auth-panel-right">
        {children}
      </div>
    </div>
  );
}
