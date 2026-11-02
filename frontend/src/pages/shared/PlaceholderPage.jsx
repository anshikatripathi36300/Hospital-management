/**
 * PlaceholderPage.jsx
 *
 * Professional placeholder component for sections scheduled in later roadmap parts.
 * Provides breadcrumb navigation, roadmap context, planned feature specifications,
 * and quick return to the role dashboard.
 */
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft, CheckCircle2, Clock, Layers, ShieldCheck } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTES } from '../../data/demoData';

export default function PlaceholderPage({
  title = 'Module In Progress',
  description = 'This section is currently in active development as part of the scheduled roadmap.',
  plannedPart = 'Coming in a later part',
  features = [],
}) {
  const { currentUser } = useAuth();
  const homeRoute = ROLE_HOME_ROUTES[currentUser?.role] ?? '/';

  const roleNameMap = {
    admin: 'Admin Portal',
    doctor: 'Doctor Portal',
    patient: 'Patient Portal',
    receptionist: 'Receptionist Desk',
    nurse: 'Nurse Portal',
    lab_technician: 'Laboratory Portal',
    pharmacist: 'Pharmacy Portal',
    accountant: 'Billing & Accounts',
  };

  const portalName = roleNameMap[currentUser?.role] ?? 'Hospital Portal';

  return (
    <AppLayout title={title}>
      <div className="placeholder-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to={homeRoute} className="breadcrumb-link">
            {portalName}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{title}</span>
        </nav>

        {/* Back Link */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Link to={homeRoute} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: 'var(--font-size-sm)' }}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Dashboard
          </Link>
        </div>

        {/* Main Status Banner */}
        <div className="card placeholder-banner-card">
          <div className="placeholder-banner-top">
            <div className="placeholder-icon-badge">
              <Construction size={28} color="var(--color-primary)" />
            </div>
            <div className="placeholder-header-content">
              <div className="placeholder-badge-row">
                <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={12} />
                  {plannedPart}
                </span>
                <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={12} />
                  Role Authorized: {currentUser?.role}
                </span>
              </div>
              <h2 className="placeholder-title">{title}</h2>
              <p className="placeholder-desc">{description}</p>
            </div>
          </div>
        </div>

        {/* Planned Features & Architecture Grid */}
        <div className="placeholder-grid">
          {/* Left: Planned Features Checklist */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={18} color="var(--color-primary)" />
                Planned Specifications &amp; Features
              </h3>
            </div>
            {features.length > 0 ? (
              <ul className="placeholder-features-list">
                {features.map((feat, idx) => (
                  <li key={idx} className="placeholder-feature-item">
                    <CheckCircle2 size={16} color="var(--color-primary)" className="flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-secondary">
                Detailed module specifications are scheduled for implementation in this roadmap part.
              </p>
            )}
          </div>

          {/* Right: Engineering & Roadmap Context */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Software Engineering Context</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: 'var(--font-size-sm)' }}>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Development Phase:</strong>
                <p className="text-secondary" style={{ marginTop: 2 }}>
                  Phase 1 — Frontend Foundation &amp; UI Architecture
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Incremental Rule:</strong>
                <p className="text-secondary" style={{ marginTop: 2 }}>
                  Following strict SE project guidelines: implementing one module at a time with verified unit and browser checks before proceeding.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>Data State:</strong>
                <p className="text-secondary" style={{ marginTop: 2 }}>
                  Will connect to local demo state models before final backend MongoDB REST API integration in Phase 2.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
