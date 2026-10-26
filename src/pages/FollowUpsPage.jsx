import { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Send,
  MessageSquare,
  Sparkles,
  RotateCcw,
  PhoneCall,
  Mail,
  Smartphone,
  Check,
  Edit2,
  XCircle,
  Eye,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/currency';
import PriorityBadge from '../components/common/PriorityBadge';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import FollowUpFormModal from '../components/followups/FollowUpFormModal';
import MessagePreviewModal from '../components/followups/MessagePreviewModal';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export default function FollowUpsPage() {
  const { followUps, invoices, completeFollowUp, rescheduleFollowUp, addActivity } = useApp();

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming' | 'overdue' | 'completed' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [followUpForMessage, setFollowUpForMessage] = useState(null);
  const [followUpForReschedule, setFollowUpForReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [followUpForCompletion, setFollowUpForCompletion] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [manualCallFollowUp, setManualCallFollowUp] = useState(null);
  const [manualCallNotes, setManualCallNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Tab Filtering & Counts
  const counts = useMemo(() => {
    return {
      today: followUps.filter((f) => f.status === 'Pending' && f.scheduledDate === todayStr).length,
      upcoming: followUps.filter((f) => f.status === 'Pending' && f.scheduledDate > todayStr).length,
      overdue: followUps.filter((f) => f.status === 'Pending' && f.scheduledDate < todayStr).length,
      completed: followUps.filter((f) => f.status === 'Completed').length,
      all: followUps.length
    };
  }, [followUps, todayStr]);

  // Filtered Follow-ups based on active tab and search filters
  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      // Tab filter
      if (activeTab === 'today') {
        if (item.status !== 'Pending' || item.scheduledDate !== todayStr) return false;
      } else if (activeTab === 'upcoming') {
        if (item.status !== 'Pending' || item.scheduledDate <= todayStr) return false;
      } else if (activeTab === 'overdue') {
        if (item.status !== 'Pending' || item.scheduledDate >= todayStr) return false;
      } else if (activeTab === 'completed') {
        if (item.status !== 'Completed') return false;
      }

      // Search filter
      const matchesSearch =
        item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchQuery.toLowerCase());

      // Channel filter
      const matchesChannel = channelFilter === 'All' || item.channel === channelFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;

      return matchesSearch && matchesChannel && matchesPriority;
    });
  }, [followUps, activeTab, searchQuery, channelFilter, priorityFilter, todayStr]);

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleDate) {
      toast.error('Please pick a valid reschedule date');
      return;
    }
    rescheduleFollowUp(followUpForReschedule.id, rescheduleDate);
    setFollowUpForReschedule(null);
    setRescheduleDate('');
  };

  const handleCompletionSubmit = (e) => {
    e.preventDefault();
    completeFollowUp(followUpForCompletion.id, completionNotes);
    setFollowUpForCompletion(null);
    setCompletionNotes('');
  };

  const handleManualCallSubmit = (e) => {
    e.preventDefault();
    if (manualCallFollowUp) {
      addActivity({
        type: 'phone_call_logged',
        description: `Logged direct phone contact with ${manualCallFollowUp.customerName}: ${manualCallNotes || 'Spoke with accounts desk'}`,
        customerName: manualCallFollowUp.customerName,
        invoiceNumber: manualCallFollowUp.invoiceNumber,
        status: 'completed'
      });
      toast.success(`Call record logged for ${manualCallFollowUp.customerName}`);
      setManualCallFollowUp(null);
      setManualCallNotes('');
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'WhatsApp':
        return <Smartphone size={14} style={{ color: '#16A34A' }} />;
      case 'Phone':
        return <PhoneCall size={14} style={{ color: '#F59E0B' }} />;
      case 'Email':
      default:
        return <Mail size={14} style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-up Schedules</h1>
          <p className="page-subtitle">
            Manage payment communications, scheduled touches, and customer recovery logs
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          marginBottom: 20,
          gap: 24,
          overflowX: 'auto'
        }}
      >
        {[
          { key: 'today', label: "Today's Queue", count: counts.today },
          { key: 'overdue', label: 'Overdue Follow-ups', count: counts.overdue, isDanger: counts.overdue > 0 },
          { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { key: 'completed', label: 'Completed', count: counts.completed },
          { key: 'all', label: 'All Records', count: counts.all }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.key ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: tab.isDanger ? 'var(--danger-bg)' : activeTab === tab.key ? 'var(--primary-light)' : 'var(--bg-muted)',
                color: tab.isDanger ? 'var(--danger)' : activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 600
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Controls & Search */}
      <div className="card" style={{ marginBottom: 20, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search follow-ups by customer, invoice #, message snippet..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              aria-label="Filter by channel"
            >
              <option value="All">All Channels</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone">Phone</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Follow-up Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredFollowUps.length > 0 ? (
          filteredFollowUps.map((flw) => {
            const isCompleted = flw.status === 'Completed';
            const isPastDue = !isCompleted && flw.scheduledDate < todayStr;

            return (
              <div
                key={flw.id}
                className="card"
                style={{
                  borderLeft: isPastDue ? '4px solid var(--danger)' : isCompleted ? '4px solid var(--success)' : '4px solid var(--primary)',
                  padding: '16px 20px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {flw.customerName}
                      </span>
                      <PriorityBadge priority={flw.priority} />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-muted)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {getChannelIcon(flw.channel)}
                        <span>{flw.channel}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4, flexWrap: 'wrap' }}>
                      <span>Invoice: <strong>{flw.invoiceNumber}</strong></span>
                      <span>•</span>
                      <span>Amount: <strong style={{ color: 'var(--primary)' }}>{formatINR(flw.amountDue)}</strong></span>
                      <span>•</span>
                      <span>Scheduled: <strong>{formatDate(flw.scheduledDate)}</strong></span>
                      {isPastDue && (
                        <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <AlertTriangle size={13} />
                          Overdue Follow-up
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isCompleted ? (
                      <span className="badge badge-success">
                        <Check size={12} />
                        Completed
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <Clock size={12} />
                        Pending Action
                      </span>
                    )}
                  </div>
                </div>

                {/* Message preview snippet */}
                {flw.message && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 14,
                      whiteSpace: 'pre-line',
                      maxHeight: 100,
                      overflowY: 'auto'
                    }}
                  >
                    {flw.message}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Created on {formatDate(flw.createdDate || todayStr)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!isCompleted && (
                      <>
                        <button
                          type="button"
                          onClick={() => setManualCallFollowUp(flw)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Log phone call with customer"
                        >
                          <PhoneCall size={14} />
                          <span>Log Call</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFollowUpForReschedule(flw);
                            setRescheduleDate(flw.scheduledDate || todayStr);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <RotateCcw size={14} />
                          <span>Reschedule</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFollowUpForMessage(flw)}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Send size={14} />
                          <span>Review & Send</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFollowUpForCompletion(flw)}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', borderColor: 'var(--success-border)' }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark Done</span>
                        </button>
                      </>
                    )}

                    {isCompleted && flw.completedNotes && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--success)', fontStyle: 'italic' }}>
                        Notes: {flw.completedNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No follow-ups in this queue"
            message="No follow-up items match the selected tab or criteria. Create a scheduled reminder or change your active filters."
            actionLabel="Schedule New Follow-up"
            onAction={() => setIsCreateOpen(true)}
          />
        )}
      </div>

      {/* MODALS */}
      {/* 1. Schedule Follow-up */}
      <FollowUpFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* 2. Message Preview & Review Send Modal */}
      <MessagePreviewModal
        isOpen={!!followUpForMessage}
        onClose={() => setFollowUpForMessage(null)}
        followUp={followUpForMessage}
        invoice={invoices.find((i) => i.invoiceNumber === followUpForMessage?.invoiceNumber)}
      />

      {/* 3. Reschedule Follow-up Modal */}
      <Modal
        isOpen={!!followUpForReschedule}
        onClose={() => setFollowUpForReschedule(null)}
        title="Reschedule Follow-up"
        subtitle={`Adjust scheduled contact date for ${followUpForReschedule?.customerName}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleRescheduleSubmit}>
          <div className="form-group">
            <label className="form-label required">New Contact Date</label>
            <input
              type="date"
              className="form-input"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={todayStr}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setFollowUpForReschedule(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Reschedule
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Complete Follow-up Modal */}
      <Modal
        isOpen={!!followUpForCompletion}
        onClose={() => setFollowUpForCompletion(null)}
        title="Mark Follow-up as Completed"
        subtitle={`Recording resolution for ${followUpForCompletion?.customerName}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleCompletionSubmit}>
          <div className="form-group">
            <label className="form-label">Resolution Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g., Spoke with CFO, agreed to initiate NEFT transfer by Friday..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setFollowUpForCompletion(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Complete
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Manual Call Log Modal */}
      <Modal
        isOpen={!!manualCallFollowUp}
        onClose={() => setManualCallFollowUp(null)}
        title="Log Direct Customer Call"
        subtitle={`Record phone conversation with ${manualCallFollowUp?.customerName}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleManualCallSubmit}>
          <div className="form-group">
            <label className="form-label required">Call Summary</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={manualCallNotes}
              onChange={(e) => setManualCallNotes(e.target.value)}
              placeholder="e.g. Discussed invoice clearance with Rahul Verma, PO approval is underway."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setManualCallFollowUp(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Call Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
