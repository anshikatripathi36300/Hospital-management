/**
 * ConfirmDialog.jsx
 *
 * Reusable modal for confirming sensitive or destructive operations.
 * (e.g. deactivating a patient record, confirming admission discharge).
 */
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const Icon = variant === 'danger' ? AlertTriangle : variant === 'warning' ? AlertCircle : Info;
  const iconColor =
    variant === 'danger' ? 'var(--color-danger)' : variant === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '6px 0' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            background: `${iconColor}15`,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <Icon size={20} />
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {message}
        </div>
      </div>
    </Modal>
  );
}
