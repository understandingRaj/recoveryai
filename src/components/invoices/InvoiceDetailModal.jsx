import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { formatINR, formatDate } from '../../utils/currency';
import { Sparkles, DollarSign, Edit3, Calendar, Building, Mail, AlertTriangle } from 'lucide-react';

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
  onEdit,
  onDraftReminder
}) {
  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber}`}
      subtitle={`Issued to ${invoice.customerName}`}
      maxWidth="max-w-lg"
    >
      <div>
        {/* Status & Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            marginBottom: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status:</span>
            <StatusBadge status={invoice.status} />
          </div>

          {invoice.daysOverdue > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--danger)', fontWeight: 600 }}>
              <AlertTriangle size={15} />
              <span>{invoice.daysOverdue} days overdue</span>
            </div>
          )}
        </div>

        {/* Customer & Dates Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>
              Customer Details
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building size={15} style={{ color: 'var(--primary)' }} />
              {invoice.customerName}
            </div>
            {invoice.customerEmail && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Mail size={13} />
                {invoice.customerEmail}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>
              Timeline
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} />
              <span>Issue Date: <strong>{formatDate(invoice.invoiceDate)}</strong></span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: invoice.daysOverdue > 0 ? 'var(--danger)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Calendar size={13} />
              <span>Due Date: <strong>{formatDate(invoice.dueDate)}</strong></span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            marginBottom: 20
          }}
        >
          <div style={{ backgroundColor: '#F8FAFC', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Financial Breakdown
          </div>
          <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Invoice</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                {formatINR(invoice.totalAmount)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Paid to Date</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--success)', marginTop: 2 }}>
                {formatINR(invoice.amountPaid)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Remaining Balance</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: invoice.remainingAmount > 0 ? 'var(--danger)' : 'var(--text-secondary)', marginTop: 2 }}>
                {formatINR(invoice.remainingAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>
              Notes / Line Description
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              {invoice.notes}
            </div>
          </div>
        )}

        {/* Modal actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(invoice);
            }}
            className="btn btn-secondary btn-sm"
          >
            <Edit3 size={14} />
            <span>Edit Invoice</span>
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            {invoice.remainingAmount > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDraftReminder(invoice);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  <Sparkles size={14} />
                  <span>Draft Reminder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRecordPayment(invoice);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <DollarSign size={14} />
                  <span>Record Payment</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
