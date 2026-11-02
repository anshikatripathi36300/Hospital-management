/**
 * Sidebar.jsx
 *
 * Role-aware navigation sidebar. Renders only the links
 * permitted for the current user's role.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Briefcase, Building2,
  Calendar, FileText, FlaskConical, Pill, Receipt, BarChart3,
  Settings, LogOut, Stethoscope, TestTube, ClipboardList,
  HeartPulse, ShoppingBag, CreditCard, Bell, Shield,
  Cross,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ---------------------------------------------------------------------------
// Nav config per role
// ---------------------------------------------------------------------------
const NAV_CONFIG = {
  admin: [
    { section: 'Main' },
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/admin/dashboard' },
    { section: 'Management' },
    { label: 'Patients',         icon: Users,           to: '/admin/patients' },
    { label: 'Doctors',          icon: Stethoscope,     to: '/admin/doctors' },
    { label: 'Staff',            icon: Briefcase,       to: '/admin/staff' },
    { label: 'Departments',      icon: Building2,       to: '/admin/departments' },
    { section: 'Operations' },
    { label: 'Appointments',     icon: Calendar,        to: '/admin/appointments' },
    { label: 'Medical Records',  icon: FileText,        to: '/admin/records' },
    { label: 'Laboratory',       icon: FlaskConical,    to: '/admin/laboratory' },
    { label: 'Pharmacy',         icon: Pill,            to: '/admin/pharmacy' },
    { label: 'Billing',          icon: Receipt,         to: '/admin/billing' },
    { section: 'Admin' },
    { label: 'Reports',          icon: BarChart3,       to: '/admin/reports' },
    { label: 'User Management',  icon: Shield,          to: '/admin/users' },
    { label: 'Audit Logs',       icon: ClipboardList,   to: '/admin/audit-logs' },
    { label: 'Settings',         icon: Settings,        to: '/admin/settings' },
    { label: 'My Profile',       icon: UserCheck,       to: '/admin/profile' },
  ],
  doctor: [
    { section: 'Main' },
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/doctor/dashboard' },
    { section: 'Patient Care' },
    { label: 'Appointments',     icon: Calendar,        to: '/doctor/appointments' },
    { label: 'My Patients',      icon: Users,           to: '/doctor/patients' },
    { label: 'Prescriptions',    icon: ClipboardList,   to: '/doctor/prescriptions' },
    { label: 'Lab Requests',     icon: TestTube,        to: '/doctor/lab-requests' },
    { section: 'Profile' },
    { label: 'My Profile',       icon: UserCheck,       to: '/doctor/profile' },
    { label: 'Availability',     icon: Calendar,        to: '/doctor/availability' },
  ],
  patient: [
    { section: 'Main' },
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/patient/dashboard' },
    { section: 'My Health' },
    { label: 'Book Appointment', icon: Calendar,        to: '/patient/book-appointment' },
    { label: 'Appointments',     icon: Calendar,        to: '/patient/appointments' },
    { label: 'Medical Records',  icon: FileText,        to: '/patient/records' },
    { label: 'Prescriptions',    icon: ClipboardList,   to: '/patient/prescriptions' },
    { label: 'Lab Reports',      icon: FlaskConical,    to: '/patient/lab-reports' },
    { label: 'Bills',            icon: CreditCard,      to: '/patient/bills' },
    { section: 'Account' },
    { label: 'Profile',          icon: UserCheck,       to: '/patient/profile' },
    { label: 'Notifications',    icon: Bell,            to: '/patient/notifications' },
  ],
  receptionist: [
    { section: 'Main' },
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/receptionist/dashboard' },
    { section: 'Front Desk' },
    { label: 'Register Patient', icon: Users,           to: '/receptionist/register-patient' },
    { label: 'Appointments',     icon: Calendar,        to: '/receptionist/appointments' },
    { label: 'Appointment Queue',icon: ClipboardList,   to: '/receptionist/queue' },
    { label: 'Doctor Schedules', icon: Stethoscope,     to: '/receptionist/schedules' },
  ],
  nurse: [
    { section: 'Main' },
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/nurse/dashboard' },
    { section: 'Patient Care' },
    { label: 'Assigned Patients',icon: Users,           to: '/nurse/patients' },
    { label: 'Vital Signs',      icon: HeartPulse,      to: '/nurse/vitals' },
    { label: 'Tasks',            icon: ClipboardList,   to: '/nurse/tasks' },
  ],
  lab_technician: [
    { section: 'Main' },
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/lab/dashboard' },
    { section: 'Laboratory' },
    { label: 'Test Requests',    icon: TestTube,        to: '/lab/requests' },
    { label: 'Results',          icon: FlaskConical,    to: '/lab/results' },
  ],
  pharmacist: [
    { section: 'Main' },
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/pharmacy/dashboard' },
    { section: 'Pharmacy' },
    { label: 'Inventory',        icon: ShoppingBag,     to: '/pharmacy/inventory' },
    { label: 'Dispensing',       icon: Pill,            to: '/pharmacy/dispensing' },
  ],
  accountant: [
    { section: 'Main' },
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/billing/dashboard' },
    { section: 'Billing' },
    { label: 'Invoices',         icon: Receipt,         to: '/billing/invoices' },
    { label: 'Payments',         icon: CreditCard,      to: '/billing/payments' },
    { label: 'Reports',          icon: BarChart3,       to: '/billing/reports' },
  ],
};

// ---------------------------------------------------------------------------
// Role display labels
// ---------------------------------------------------------------------------
const ROLE_LABELS = {
  admin:          'Administrator',
  doctor:         'Doctor',
  patient:        'Patient',
  receptionist:   'Receptionist',
  nurse:          'Nurse',
  lab_technician: 'Lab Technician',
  pharmacist:     'Pharmacist',
  accountant:     'Accountant',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = NAV_CONFIG[currentUser?.role] ?? [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = currentUser?.avatar ?? currentUser?.name?.slice(0, 2).toUpperCase() ?? 'U';
  const roleLabel = ROLE_LABELS[currentUser?.role] ?? currentUser?.role ?? '';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar${isOpen ? ' open' : ''}`} aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Cross size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-brand-name">MediCare HMS</div>
            <div className="sidebar-brand-sub">Hospital Management</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={`section-${idx}`} className="sidebar-section-label">
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-item${isActive ? ' active' : ''}`
                }
                onClick={onClose}
              >
                {Icon && <Icon size={16} className="sidebar-item-icon" aria-hidden="true" />}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer — user info + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser?.name}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
          </div>
          <button
            className="sidebar-item"
            style={{ marginTop: '8px', color: '#fca5a5' }}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
