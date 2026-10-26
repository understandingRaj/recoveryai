import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: isDanger ? 'var(--danger-bg)' : 'var(--warning-bg)',
            color: isDanger ? 'var(--danger)' : 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
