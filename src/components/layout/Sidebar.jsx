import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Clock,
  Sparkles,
  History,
  BarChart3,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, onClose }) {
  const { user, business, followUpsDueTodayList, invoices } = useApp();

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'Overdue').length;
  const pendingFollowupsCount = followUpsDueTodayList.length;

  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Invoices', to: '/invoices', icon: FileText, badge: overdueInvoicesCount > 0 ? `${overdueInvoicesCount} overdue` : null, badgeType: 'danger' },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Follow-ups', to: '/follow-ups', icon: Clock, badge: pendingFollowupsCount > 0 ? `${pendingFollowupsCount}` : null, badgeType: 'primary' },
    { label: 'AI Assistant', to: '/ai-assistant', icon: Sparkles, highlight: true },
    { label: 'Activity History', to: '/activity-history', icon: History },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
    { label: 'Settings', to: '/settings', icon: Settings }
  ];

  const handleLogout = () => {
    toast.success('Logged out successfully (Demo session)');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.35)'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Recover<span style={{ color: 'var(--primary)' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Receivables AI
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon mobile-only"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 8px' }}>
            Main Menu
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    transition: 'all 0.15s ease'
                  })}
                  className="nav-link-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={18} strokeWidth={item.highlight ? 2.2 : 2} style={{ color: item.highlight ? 'var(--secondary)' : undefined }} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: item.badgeType === 'danger' ? 'var(--danger-bg)' : 'var(--primary-light)',
                        color: item.badgeType === 'danger' ? 'var(--danger)' : 'var(--primary)',
                        border: `1px solid ${item.badgeType === 'danger' ? 'var(--danger-border)' : 'var(--primary-border)'}`
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick AI Assist Card */}
          <div
            style={{
              marginTop: 24,
              padding: 14,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
              <ShieldCheck size={14} />
              <span>Safe AI Execution</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Messages require your explicit confirmation before dispatch. No automated emails in demo.
            </p>
          </div>
        </div>

        {/* User profile footer */}
        <div
          style={{
            padding: 14,
            borderTop: '1px solid var(--border)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={11} />
                {business.name}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-icon"
            title="Logout"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <style>{`
        .nav-link-hover:hover {
          background-color: var(--bg-muted) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </>
  );
}
