import { Menu, Plus, Calendar, RotateCcw, ShieldCheck, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Topbar({ onMenuClick, onAddInvoiceClick }) {
  const { resetDemoData, invoices, isBackendOnline } = useApp();
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <Calendar size={15} style={{ color: 'var(--primary)' }} />
          <span>{todayStr}</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isBackendOnline ? '#EEF2FF' : '#F0FDF4',
            border: isBackendOnline ? '1px solid #C7D2FE' : '1px solid #BBF7D0',
            fontSize: '0.75rem',
            color: isBackendOnline ? 'var(--primary)' : '#16A34A',
            fontWeight: 500
          }}
          title={isBackendOnline ? 'Connected to RecoverAI Express/MongoDB API backend' : 'Operating in secure local demo mode'}
        >
          <ShieldCheck size={13} />
          <span>{isBackendOnline ? 'API Connected (Live)' : 'Demo Mode (Active)'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={resetDemoData}
          className="btn btn-ghost btn-sm"
          title="Reset back to standard fictional demo records"
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: 'var(--radius-sm)' }}
            title="Notifications"
          >
            <Bell size={16} />
          </button>
          {overdueCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 10,
                height: 10,
                backgroundColor: 'var(--danger)',
                borderRadius: '50%',
                border: '2px solid #FFFFFF'
              }}
            />
          )}
        </div>

        <button
          onClick={onAddInvoiceClick}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} />
          <span>Add Invoice</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #mobile-menu-btn {
            display: flex !important;
          }
          header {
            padding: 0 16px !important;
          }
        }
      `}</style>
    </header>
  );
}
