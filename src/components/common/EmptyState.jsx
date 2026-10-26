import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionLabel,
  onAction
}) {
  return (
    <div className="empty-state">
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          color: 'var(--text-secondary)'
        }}
      >
        <Icon size={24} />
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 18px', lineHeight: 1.45 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
