import { useState, useMemo } from 'react';
import {
  History,
  FileText,
  CreditCard,
  Users,
  Send,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  PhoneCall,
  Search,
  Filter,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/currency';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function ActivityHistoryPage() {
  const { activities } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSearch =
        act.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.user?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'All' || act.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [activities, searchQuery, typeFilter]);

  // Export audit log
  const handleExportAudit = () => {
    if (filteredActivities.length === 0) {
      toast.error('No activities to export');
      return;
    }

    const headers = ['Timestamp', 'Type', 'Description', 'Customer', 'Invoice', 'User', 'Status'];
    const rows = filteredActivities.map((a) => [
      a.timestamp,
      a.type,
      `"${a.description.replace(/"/g, '""')}"`,
      `"${a.customerName || ''}"`,
      `"${a.invoiceNumber || ''}"`,
      `"${a.user || ''}"`,
      a.status || 'completed'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recoverai_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit trail exported as CSV');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'invoice_created':
      case 'invoice_updated':
        return <FileText size={16} style={{ color: 'var(--primary)' }} />;
      case 'payment_recorded':
        return <CreditCard size={16} style={{ color: 'var(--success)' }} />;
      case 'customer_added':
        return <Users size={16} style={{ color: 'var(--secondary)' }} />;
      case 'reminder_sent':
        return <Send size={16} style={{ color: 'var(--primary)' }} />;
      case 'reminder_drafted':
        return <Sparkles size={16} style={{ color: '#D97706' }} />;
      case 'follow_up_completed':
        return <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
      case 'follow_up_rescheduled':
        return <RotateCcw size={16} style={{ color: '#F59E0B' }} />;
      case 'phone_call_logged':
        return <PhoneCall size={16} style={{ color: 'var(--secondary)' }} />;
      default:
        return <History size={16} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="badge badge-success">Delivered</span>;
      case 'sent':
        return <span className="badge badge-info">Sent</span>;
      case 'drafted':
        return <span className="badge badge-warning">Drafted</span>;
      case 'failed':
        return <span className="badge badge-danger">Delivery Failed</span>;
      case 'completed':
      default:
        return <span className="badge badge-neutral">Logged</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity & Audit History</h1>
          <p className="page-subtitle">
            Immutable, chronological audit log of all financial events, invoice adjustments, and communications
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Download size={15} />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="card">
        {/* Search & Filter Header */}
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search audit trail by description, invoice #, customer, user..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Event Type:</span>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by activity event type"
            >
              <option value="All">All Event Types ({activities.length})</option>
              <option value="payment_recorded">Payments Recorded</option>
              <option value="invoice_created">Invoices Created</option>
              <option value="invoice_updated">Invoices Updated</option>
              <option value="reminder_sent">Reminders Sent</option>
              <option value="reminder_drafted">Reminders Drafted</option>
              <option value="follow_up_completed">Follow-ups Completed</option>
              <option value="customer_added">Customers Added</option>
            </select>
          </div>
        </div>

        {/* Timeline List */}
        <div style={{ padding: '8px 0' }}>
          {filteredActivities.length > 0 ? (
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              {/* Vertical timeline line */}
              <div
                style={{
                  position: 'absolute',
                  left: 11,
                  top: 14,
                  bottom: 14,
                  width: 2,
                  backgroundColor: 'var(--border)'
                }}
              />

              {filteredActivities.map((act) => {
                const dateObj = new Date(act.timestamp);
                const timeString = isNaN(dateObj.getTime())
                  ? 'Recent'
                  : dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const dateString = isNaN(dateObj.getTime())
                  ? ''
                  : formatDate(act.timestamp);

                return (
                  <div
                    key={act.id}
                    style={{
                      position: 'relative',
                      marginBottom: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    {/* Timeline dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -28,
                        top: 2,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}
                    >
                      {getActivityIcon(act.type)}
                    </div>

                    {/* Content Box */}
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 16px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {act.description}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {getStatusBadge(act.status)}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {dateString} • {timeString}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {act.customerName && (
                          <span>Customer: <strong>{act.customerName}</strong></span>
                        )}
                        {act.invoiceNumber && (
                          <span>Invoice: <strong>{act.invoiceNumber}</strong></span>
                        )}
                        <span>Actor: <strong>{act.user || 'Alex Vance'}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No activity records found"
              message="No events match your current search criteria or event type filter."
              actionLabel="Reset Search"
              onAction={() => {
                setSearchQuery('');
                setTypeFilter('All');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
