/**
 * LoadingSpinner.jsx — Reusable loading indicator.
 */
export default function LoadingSpinner({ size = 'default', message = '' }) {
  return (
    <div className="spinner-container" role="status" aria-label={message || 'Loading'}>
      <div style={{ textAlign: 'center' }}>
        <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
        {message && (
          <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
