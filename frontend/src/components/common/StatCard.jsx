/**
 * StatCard.jsx
 *
 * Reusable KPI stat card component with trend indicator and icon highlighting.
 * Extracted and enhanced as part of Part 4 Roadmap.
 */
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  color = 'var(--color-primary)',
  trend,
  subtitle,
  badge,
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <div>
          <div className="kpi-value">{value}</div>
          <div className="kpi-label">{label}</div>
        </div>
        <div
          className="kpi-icon-box"
          style={{
            background: `${color}18`,
            color: color,
          }}
          aria-hidden="true"
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>

      {(trend || subtitle || badge) && (
        <div className="kpi-footer">
          {trend && (
            <span className={`kpi-trend ${trend.direction || 'neutral'}`}>
              {trend.direction === 'up' && <ArrowUpRight size={14} />}
              {trend.direction === 'down' && <ArrowDownRight size={14} />}
              {trend.direction === 'neutral' && <Minus size={14} />}
              <span>{trend.value}</span>
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--color-text-muted)' }}>{subtitle}</span>}
          {badge && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
