/**
 * NotFound.jsx — 404 page shown for unknown routes.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTES } from '../../data/demoData';

export default function NotFound() {
  const { currentUser } = useAuth();
  const homeRoute = currentUser ? (ROLE_HOME_ROUTES[currentUser.role] ?? '/login') : '/login';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 16,
        padding: 24,
        background: 'var(--color-bg)',
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 360 }}>
        The page you are looking for does not exist or you may not have access to it.
      </p>
      <Link
        to={homeRoute}
        style={{
          marginTop: 8,
          padding: '10px 24px',
          background: 'var(--color-primary)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontWeight: 500,
          fontSize: 'var(--font-size-sm)',
          textDecoration: 'none',
        }}
      >
        {currentUser ? 'Go to Dashboard' : 'Go to Login'}
      </Link>
    </div>
  );
}
