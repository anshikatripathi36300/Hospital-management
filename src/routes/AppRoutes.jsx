/**
 * AppRoutes.jsx — Central route configuration.
 *
 * Defines all public and protected routes across all 8 user roles.
 * Protected routes use <ProtectedRoute> to enforce role permissions.
 * Placeholder pages provide rich architectural specifications for future roadmap parts.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME_ROUTES } from '../data/demoData';

// Auth pages
import Login            from '../pages/auth/Login';
import PatientRegister  from '../pages/auth/PatientRegister';
import ForgotPassword   from '../pages/auth/ForgotPassword';

// Role dashboards & Admin modules
import AdminDashboard        from '../pages/admin/AdminDashboard';
import PatientManagement     from '../pages/admin/PatientManagement';
import DoctorManagement      from '../pages/admin/DoctorManagement';
import StaffManagement       from '../pages/admin/StaffManagement';
import DepartmentManagement  from '../pages/admin/DepartmentManagement';
import AppointmentManagement from '../pages/admin/AppointmentManagement';
import DoctorDashboard       from '../pages/doctor/DoctorDashboard';
import PatientDashboard      from '../pages/patient/PatientDashboard';
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import NurseDashboard        from '../pages/nurse/NurseDashboard';
import LaboratoryDashboard   from '../pages/laboratory/LaboratoryDashboard';
import PharmacyDashboard     from '../pages/pharmacy/PharmacyDashboard';
import BillingDashboard      from '../pages/billing/BillingDashboard';

// Doctor portal modules (Part 8)
import DoctorAppointments   from '../pages/doctor/DoctorAppointments';
import DoctorPatients       from '../pages/doctor/DoctorPatients';
import DoctorPrescriptions  from '../pages/doctor/DoctorPrescriptions';
import DoctorLabRequests    from '../pages/doctor/DoctorLabRequests';
import DoctorAvailability   from '../pages/doctor/DoctorAvailability';

// Patient portal modules (Part 9)
import BookAppointment      from '../pages/patient/BookAppointment';
import PatientAppointments  from '../pages/patient/PatientAppointments';
import PatientRecords       from '../pages/patient/PatientRecords';
import PatientPrescriptions from '../pages/patient/PatientPrescriptions';
import PatientLabReports    from '../pages/patient/PatientLabReports';
import PatientBills         from '../pages/patient/PatientBills';

// Receptionist portal modules (Part 10)
import RegisterPatient          from '../pages/receptionist/RegisterPatient';
import ReceptionistAppointments from '../pages/receptionist/ReceptionistAppointments';
import AppointmentQueue         from '../pages/receptionist/AppointmentQueue';
import DoctorSchedules          from '../pages/receptionist/DoctorSchedules';

// Nurse portal modules (Part 11)
import NursePatients            from '../pages/nurse/NursePatients';
import NurseVitals              from '../pages/nurse/NurseVitals';
import NurseTasks               from '../pages/nurse/NurseTasks';

// Lab portal modules (Part 12)
import LabRequests              from '../pages/laboratory/LabRequests';
import LabResults               from '../pages/laboratory/LabResults';

// Pharmacy portal modules (Part 13)
import MedicineInventory        from '../pages/pharmacy/MedicineInventory';
import PrescriptionDispensing   from '../pages/pharmacy/PrescriptionDispensing';

// Billing portal modules (Part 14)
import InvoiceManagement        from '../pages/billing/InvoiceManagement';
import PaymentRecords           from '../pages/billing/PaymentRecords';
import FinancialReports         from '../pages/billing/FinancialReports';

// Admin & Profile modules (Part 15 & 16)
import AdminReports             from '../pages/admin/AdminReports';
import UserManagement           from '../pages/admin/UserManagement';
import AuditLogs                from '../pages/admin/AuditLogs';
import HospitalSettings         from '../pages/admin/HospitalSettings';
import ProfileSettings          from '../pages/shared/ProfileSettings';
import MedicalRecords           from '../pages/admin/MedicalRecords';
import PatientNotifications     from '../pages/patient/PatientNotifications';

// Shared pages
import NotFound        from '../pages/shared/NotFound';
import PlaceholderPage from '../pages/shared/PlaceholderPage';

// ---------------------------------------------------------------------------
// Root redirect — sends authenticated users to their role dashboard
// ---------------------------------------------------------------------------
function RootRedirect() {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME_ROUTES[currentUser.role] ?? '/login'} replace />;
}

// ---------------------------------------------------------------------------
// Route Configurations
// ---------------------------------------------------------------------------
export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Public auth routes ─────────────────────────────────────────── */}
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<PatientRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ── Admin routes ───────────────────────────────────────────────── */}
      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/patients"
        element={<ProtectedRoute allowedRoles={['admin']}><PatientManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/doctors"
        element={<ProtectedRoute allowedRoles={['admin']}><DoctorManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/staff"
        element={<ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/departments"
        element={<ProtectedRoute allowedRoles={['admin']}><DepartmentManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/appointments"
        element={<ProtectedRoute allowedRoles={['admin']}><AppointmentManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/records"
        element={<ProtectedRoute allowedRoles={['admin']}><MedicalRecords /></ProtectedRoute>}
      />
      <Route
        path="/admin/laboratory"
        element={<ProtectedRoute allowedRoles={['admin']}><LabRequests /></ProtectedRoute>}
      />
      <Route
        path="/admin/pharmacy"
        element={<ProtectedRoute allowedRoles={['admin']}><MedicineInventory /></ProtectedRoute>}
      />
      <Route
        path="/admin/billing"
        element={<ProtectedRoute allowedRoles={['admin']}><InvoiceManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/reports"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/audit-logs"
        element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>}
      />
      <Route
        path="/admin/settings"
        element={<ProtectedRoute allowedRoles={['admin']}><HospitalSettings /></ProtectedRoute>}
      />
      <Route
        path="/admin/profile"
        element={<ProtectedRoute allowedRoles={['admin']}><ProfileSettings /></ProtectedRoute>}
      />

      {/* ── Doctor routes ──────────────────────────────────────────────── */}
      <Route
        path="/doctor/dashboard"
        element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>}
      />
      <Route
        path="/doctor/appointments"
        element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorAppointments /></ProtectedRoute>}
      />
      <Route
        path="/doctor/patients"
        element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorPatients /></ProtectedRoute>}
      />
      <Route
        path="/doctor/prescriptions"
        element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorPrescriptions /></ProtectedRoute>}
      />
      <Route
        path="/doctor/lab-requests"
        element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorLabRequests /></ProtectedRoute>}
      />
      <Route
        path="/doctor/profile"
        element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><ProfileSettings /></ProtectedRoute>}
      />
      <Route
        path="/doctor/availability"
        element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorAvailability /></ProtectedRoute>}
      />


      {/* ── Patient routes ─────────────────────────────────────────────── */}
      <Route
        path="/patient/dashboard"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientDashboard /></ProtectedRoute>}
      />
      <Route
        path="/patient/book-appointment"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><BookAppointment /></ProtectedRoute>}
      />
      <Route
        path="/patient/appointments"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientAppointments /></ProtectedRoute>}
      />
      <Route
        path="/patient/records"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientRecords /></ProtectedRoute>}
      />
      <Route
        path="/patient/prescriptions"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientPrescriptions /></ProtectedRoute>}
      />
      <Route
        path="/patient/lab-reports"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientLabReports /></ProtectedRoute>}
      />
      <Route
        path="/patient/bills"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientBills /></ProtectedRoute>}
      />

      <Route
        path="/patient/profile"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><ProfileSettings /></ProtectedRoute>}
      />
      <Route
        path="/patient/notifications"
        element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientNotifications /></ProtectedRoute>}
      />

      {/* ── Receptionist routes ────────────────────────────────────────── */}
      <Route
        path="/receptionist/dashboard"
        element={<ProtectedRoute allowedRoles={['receptionist', 'admin']}><ReceptionistDashboard /></ProtectedRoute>}
      />
      <Route
        path="/receptionist/register-patient"
        element={<ProtectedRoute allowedRoles={['receptionist', 'admin']}><RegisterPatient /></ProtectedRoute>}
      />
      <Route
        path="/receptionist/appointments"
        element={<ProtectedRoute allowedRoles={['receptionist', 'admin']}><ReceptionistAppointments /></ProtectedRoute>}
      />
      <Route
        path="/receptionist/queue"
        element={<ProtectedRoute allowedRoles={['receptionist', 'admin']}><AppointmentQueue /></ProtectedRoute>}
      />
      <Route
        path="/receptionist/schedules"
        element={<ProtectedRoute allowedRoles={['receptionist', 'admin']}><DoctorSchedules /></ProtectedRoute>}
      />


      {/* ── Nurse routes ───────────────────────────────────────────────── */}
      <Route
        path="/nurse/dashboard"
        element={<ProtectedRoute allowedRoles={['nurse', 'admin']}><NurseDashboard /></ProtectedRoute>}
      />
      <Route
        path="/nurse/patients"
        element={<ProtectedRoute allowedRoles={['nurse', 'admin']}><NursePatients /></ProtectedRoute>}
      />
      <Route
        path="/nurse/vitals"
        element={<ProtectedRoute allowedRoles={['nurse', 'admin']}><NurseVitals /></ProtectedRoute>}
      />
      <Route
        path="/nurse/tasks"
        element={<ProtectedRoute allowedRoles={['nurse', 'admin']}><NurseTasks /></ProtectedRoute>}
      />


      {/* ── Lab routes ─────────────────────────────────────────────────── */}
      <Route
        path="/lab/dashboard"
        element={<ProtectedRoute allowedRoles={['lab_technician', 'admin']}><LaboratoryDashboard /></ProtectedRoute>}
      />
      <Route
        path="/lab/requests"
        element={<ProtectedRoute allowedRoles={['lab_technician', 'admin']}><LabRequests /></ProtectedRoute>}
      />
      <Route
        path="/lab/results"
        element={<ProtectedRoute allowedRoles={['lab_technician', 'admin']}><LabResults /></ProtectedRoute>}
      />

      {/* ── Pharmacy routes ────────────────────────────────────────────── */}
      <Route
        path="/pharmacy/dashboard"
        element={<ProtectedRoute allowedRoles={['pharmacist', 'admin']}><PharmacyDashboard /></ProtectedRoute>}
      />
      <Route
        path="/pharmacy/inventory"
        element={<ProtectedRoute allowedRoles={['pharmacist', 'admin']}><MedicineInventory /></ProtectedRoute>}
      />
      <Route
        path="/pharmacy/dispensing"
        element={<ProtectedRoute allowedRoles={['pharmacist', 'admin']}><PrescriptionDispensing /></ProtectedRoute>}
      />

      {/* ── Billing routes ─────────────────────────────────────────────── */}
      <Route
        path="/billing/dashboard"
        element={<ProtectedRoute allowedRoles={['accountant', 'admin']}><BillingDashboard /></ProtectedRoute>}
      />
      <Route
        path="/billing/invoices"
        element={<ProtectedRoute allowedRoles={['accountant', 'admin']}><InvoiceManagement /></ProtectedRoute>}
      />
      <Route
        path="/billing/payments"
        element={<ProtectedRoute allowedRoles={['accountant', 'admin']}><PaymentRecords /></ProtectedRoute>}
      />
      <Route
        path="/billing/reports"
        element={<ProtectedRoute allowedRoles={['accountant', 'admin']}><FinancialReports /></ProtectedRoute>}
      />

      {/* ── 404 Catch-all ──────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
