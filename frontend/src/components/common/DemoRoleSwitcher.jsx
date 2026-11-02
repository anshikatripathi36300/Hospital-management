/**
 * DemoRoleSwitcher.jsx — Academic Viva Role Switcher Toolbar (Part 17)
 *
 * Designed for academic Software Engineering project viva and viva examinations:
 * - Allows seamless 1-click role transitions between all 8 hospital personas
 *   without manually typing email/password credentials repeatedly.
 * - Collapsible, floating dock with active role indicator and demo data reset.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS, ROLE_HOME_ROUTES } from '../../data/demoData';
import {
  Users,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Shield,
  Stethoscope,
  User,
  HeartPulse,
  TestTube,
  Pill,
  CreditCard,
  X,
} from 'lucide-react';

const ROLE_ICONS = {
  admin: Shield,
  doctor: Stethoscope,
  patient: User,
  receptionist: Users,
  nurse: HeartPulse,
  lab_technician: TestTube,
  pharmacist: Pill,
  accountant: CreditCard,
};

const ROLE_COLORS = {
  admin: '#b91c1c',
  doctor: '#2563eb',
  patient: '#059669',
  receptionist: '#7c3aed',
  nurse: '#ec4899',
  lab_technician: '#0891b2',
  pharmacist: '#d97706',
  accountant: '#4f46e5',
};

export default function DemoRoleSwitcher() {
  const { isAuthenticated, currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  if (!isAuthenticated) return null;

  const currentRole = currentUser?.role || 'admin';
  const CurrentIcon = ROLE_ICONS[currentRole] || Shield;
  const currentBadgeColor = ROLE_COLORS[currentRole] || '#2563eb';

  const handleSwitch = (user) => {
    login(user.email, user.password || 'demo1234');
    const homeRoute = ROLE_HOME_ROUTES[user.role] || '/login';
    navigate(homeRoute);
    setIsOpen(false);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all localStorage mock data to default hospital state?')) {
      const keysToKeep = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !k.startsWith('hms_demo_')) {
          keysToKeep.push(k);
        }
      }
      // Clear demo keys
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('hms_demo_')) {
          localStorage.removeItem(k);
        }
      });
      window.location.reload();
    }
  };

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        title="Open Academic Viva Role Switcher"
        style={{
          position: 'fixed',
          bottom: 18,
          right: 18,
          zIndex: 99999,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: currentBadgeColor,
          color: 'white',
          border: '2px solid white',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sparkles size={20} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 99999,
        fontFamily: 'inherit',
      }}
    >
      {/* Expanded Menu Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            right: 0,
            width: 320,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            marginBottom: 6,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#38bdf8" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>B.Tech Viva Role Switcher</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1-Click Cross-Portal Demo</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* User Roles List */}
          <div style={{ maxHeight: 330, overflowY: 'auto', padding: '8px' }}>
            {DEMO_USERS.map((user) => {
              const Icon = ROLE_ICONS[user.role] || User;
              const isCurrent = user.role === currentRole;
              const roleColor = ROLE_COLORS[user.role] || '#2563eb';

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSwitch(user)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: isCurrent ? `1.5px solid ${roleColor}` : '1px solid transparent',
                    background: isCurrent ? `${roleColor}10` : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: isCurrent ? roleColor : `${roleColor}15`,
                      color: isCurrent ? 'white' : roleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>

                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                        {user.name}
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: roleColor,
                            textTransform: 'uppercase',
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {user.role.replace('_', ' ').toUpperCase()} • {user.department || user.specialization || 'Hospital'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Reset & Hide */}
          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={handleResetData}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                padding: 0,
              }}
            >
              <RotateCcw size={12} /> Reset Demo Data
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setMinimized(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.74rem',
                padding: 0,
              }}
            >
              Hide Dock
            </button>
          </div>
        </div>
      )}

      {/* Main Pill Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#0f172a',
          color: 'white',
          padding: '8px 14px',
          borderRadius: 30,
          border: '1.5px solid #334155',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: currentBadgeColor,
            boxShadow: `0 0 8px ${currentBadgeColor}`,
          }}
        />
        <span>Role: <strong style={{ textTransform: 'capitalize', color: '#38bdf8' }}>{currentRole.replace('_', ' ')}</strong></span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
}
