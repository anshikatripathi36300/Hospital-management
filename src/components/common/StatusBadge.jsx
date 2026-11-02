/**
 * StatusBadge.jsx — Renders a colour-coded status label.
 *
 * Usage:
 *   <StatusBadge status="confirmed" />
 *   <StatusBadge status="pending" />
 */

const STATUS_MAP = {
  active:      'status-active',
  completed:   'status-completed',
  paid:        'status-paid',
  dispensed:   'status-dispensed',
  pending:     'status-pending',
  scheduled:   'status-scheduled',
  waiting:     'status-waiting',
  cancelled:   'status-cancelled',
  inactive:    'status-inactive',
  rejected:    'status-rejected',
  overdue:     'status-overdue',
  confirmed:   'status-confirmed',
  processing:  'status-processing',
  'in-progress': 'status-in-progress',
};

export default function StatusBadge({ status }) {
  const normalized = (status ?? '').toLowerCase().replace(/\s+/g, '-');
  const cls = STATUS_MAP[normalized] ?? 'status-pending';
  // Display label: capitalize words
  const label = (status ?? '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`status-badge ${cls}`}>
      {label}
    </span>
  );
}
