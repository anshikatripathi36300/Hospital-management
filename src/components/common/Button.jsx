/**
 * Button.jsx — Reusable button component.
 *
 * Props:
 *   variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 *   size:    'sm' | 'default' | 'lg'
 *   icon:    Lucide icon component
 *   iconPosition: 'left' | 'right'
 *   loading: boolean
 *   full:    boolean — full width
 */
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  full = false,
  className = '',
  disabled,
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    full ? 'btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="spin-icon" style={{ animation: 'spin 0.8s linear infinite' }} />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={14} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={14} />}
    </button>
  );
}
