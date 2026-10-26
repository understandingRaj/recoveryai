import { CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  if (normalized === 'paid') {
    return (
      <span className="badge badge-paid">
        <CheckCircle2 size={12} />
        Paid
      </span>
    );
  }

  if (normalized === 'overdue') {
    return (
      <span className="badge badge-overdue">
        <AlertCircle size={12} />
        Overdue
      </span>
    );
  }

  if (normalized === 'partially paid' || normalized === 'partial') {
    return (
      <span className="badge badge-partially-paid">
        <Clock size={12} />
        Partially Paid
      </span>
    );
  }

  if (normalized === 'pending' || normalized === 'upcoming') {
    return (
      <span className="badge badge-pending">
        <Clock size={12} />
        {status}
      </span>
    );
  }

  if (normalized === 'completed') {
    return (
      <span className="badge badge-paid">
        <CheckCircle2 size={12} />
        Completed
      </span>
    );
  }

  return (
    <span className="badge badge-neutral">
      {status}
    </span>
  );
}
