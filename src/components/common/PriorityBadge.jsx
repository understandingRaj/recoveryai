export default function PriorityBadge({ priority = 'Medium' }) {
  const norm = priority.toLowerCase();
  
  const colors = {
    high: { bg: 'var(--danger-bg)', text: 'var(--danger)', border: 'var(--danger-border)', dot: 'var(--danger)' },
    medium: { bg: 'var(--warning-bg)', text: '#B45309', border: 'var(--warning-border)', dot: 'var(--warning)' },
    low: { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'var(--primary-border)', dot: 'var(--primary)' }
  };

  const current = colors[norm] || colors.medium;

  return (
    <span
      className="badge"
      style={{
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: current.dot,
          display: 'inline-block'
        }}
      />
      {priority} Priority
    </span>
  );
}
