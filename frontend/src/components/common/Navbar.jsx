/**
 * Navbar.jsx — Top navigation bar.
 * Shows page title, demo mode indicator, role-switcher (demo), and user profile dropdown.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu, ChevronDown, User, Settings, LogOut,
  AlertTriangle, RefreshCw, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../data/demoData';

export default function Navbar({ title = 'Dashboard', onMenuClick }) {
  const { currentUser, logout, switchRole, DEMO_MODE } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setRoleSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleSwitchRole(role) {
    const targetUrl = switchRole(role);
    setDropdownOpen(false);
    setRoleSwitcherOpen(false);
    if (targetUrl) {
      navigate(targetUrl);
    }
  }

  const initials = currentUser?.avatar ?? currentUser?.name?.slice(0, 2).toUpperCase() ?? 'U';

  // Profile route for the current role
  const profileRoutes = {
    admin:          '/admin/profile',
    doctor:         '/doctor/profile',
    patient:        '/patient/profile',
    receptionist:   '/receptionist/dashboard',
    nurse:          '/nurse/dashboard',
    lab_technician: '/lab/dashboard',
    pharmacist:     '/pharmacy/dashboard',
    accountant:     '/billing/dashboard',
  };
  const profileRoute = profileRoutes[currentUser?.role] ?? '/';

  return (
    <header className="navbar">
      {/* Left: hamburger + page title */}
      <div className="navbar-left">
        <button
          className="navbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>

      {/* Right: demo banner + user dropdown */}
      <div className="navbar-right">
        {DEMO_MODE && (
          <span
            className="badge badge-warning"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
            }}
            title="Demo mode — fictional data for college evaluation"
          >
            <AlertTriangle size={12} />
            DEMO MODE
          </span>
        )}

        {/* User dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            className="navbar-user-btn"
            onClick={() => {
              setDropdownOpen((o) => !o);
              setRoleSwitcherOpen(false);
            }}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            id="navbar-user-btn"
          >
            <div className="navbar-avatar" aria-hidden="true">{initials}</div>
            <span className="text-sm font-medium" style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name}
            </span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu" role="menu" aria-labelledby="navbar-user-btn" style={{ width: 240 }}>
              <div className="dropdown-header">
                <div className="text-sm font-semibold">{currentUser?.name}</div>
                <div className="text-xs text-muted">{currentUser?.email}</div>
                <div style={{ marginTop: 4 }}>
                  <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                    {currentUser?.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <Link
                to={profileRoute}
                className="dropdown-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={14} aria-hidden="true" />
                My Profile
              </Link>

              {currentUser?.role === 'admin' && (
                <Link
                  to="/admin/settings"
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={14} aria-hidden="true" />
                  Settings
                </Link>
              )}

              {/* Demo Mode Role Switcher */}
              {DEMO_MODE && (
                <>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => setRoleSwitcherOpen((prev) => !prev)}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <RefreshCw size={14} color="var(--color-primary)" />
                      Switch Demo Role
                    </span>
                    <ChevronDown size={12} style={{ transform: roleSwitcherOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                  </button>

                  {roleSwitcherOpen && (
                    <div className="demo-role-list" style={{ background: 'var(--color-bg)', padding: '4px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                      {DEMO_USERS.map((u) => {
                        const isCurrent = u.role === currentUser?.role;
                        return (
                          <button
                            key={u.role}
                            className={`dropdown-item ${isCurrent ? 'font-semibold' : ''}`}
                            style={{
                              padding: '6px 16px',
                              fontSize: 'var(--font-size-xs)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: isCurrent ? 'var(--color-primary-bg)' : 'transparent',
                              color: isCurrent ? 'var(--color-primary)' : 'var(--color-text)',
                            }}
                            onClick={() => handleSwitchRole(u.role)}
                          >
                            <span>
                              {u.name} <span style={{ opacity: 0.7 }}>({u.role.replace('_', ' ')})</span>
                            </span>
                            {isCurrent && <Check size={12} color="var(--color-primary)" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <div className="dropdown-divider" />

              <button
                className="dropdown-item danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={14} aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
