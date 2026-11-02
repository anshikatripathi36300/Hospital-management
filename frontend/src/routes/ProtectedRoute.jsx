/**
 * ProtectedRoute.jsx
 *
 * Guards a route so only authenticated users with the correct role(s)
 * can access it.
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['admin']}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  // Not logged in → redirect to login, preserving the attempted route
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Import role home routes to redirect correctly
    const homeRoutes = {
      admin:          '/admin/dashboard',
      doctor:         '/doctor/dashboard',
      patient:        '/patient/dashboard',
      receptionist:   '/receptionist/dashboard',
      nurse:          '/nurse/dashboard',
      lab_technician: '/lab/dashboard',
      pharmacist:     '/pharmacy/dashboard',
      accountant:     '/billing/dashboard',
    };
    return <Navigate to={homeRoutes[currentUser.role] ?? '/'} replace />;
  }

  return children;
}
