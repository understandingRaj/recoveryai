import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  trendValue,
  color = 'var(--primary)'
}) {
  return (
    <div className="card stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color
            }}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        {trendValue && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontWeight: 600,
              color: trendType === 'positive' ? 'var(--success)' : trendType === 'negative' ? 'var(--danger)' : 'var(--text-secondary)'
            }}
          >
            {trendType === 'positive' && <TrendingUp size={14} />}
            {trendType === 'negative' && <TrendingDown size={14} />}
            {trendValue}
          </span>
        )}
        <span>{subtext}</span>
      </div>
    </div>
  );
}
