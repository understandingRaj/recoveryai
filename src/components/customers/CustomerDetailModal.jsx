import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { formatINR, formatDate } from '../../utils/currency';
import { useApp } from '../../context/AppContext';
import { Building, Mail, Phone, MapPin, Calendar, Clock, Plus, Sparkles } from 'lucide-react';

export default function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onAddInvoiceForCustomer,
  onScheduleFollowUpForCustomer
}) {
  const { invoices, followUps } = useApp();

  if (!customer) return null;

  const customerInvoices = invoices.filter(
    (inv) => inv.customerId === customer.id || inv.customerName.toLowerCase() === customer.company.toLowerCase()
  );

  const customerFollowUps = followUps.filter(
    (f) => f.customerId === customer.id || f.customerName.toLowerCase() === customer.company.toLowerCase()
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.company || customer.name}
      subtitle={`Customer Account Details • Payment Terms: ${customer.paymentTerms || 'Net 30'}`}
      maxWidth="max-w-xl"
    >
      <div>
        {/* Customer Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Invoiced</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {formatINR(customer.totalInvoiced)}
            </div>
          </div>
          <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Outstanding</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>
              {formatINR(customer.totalOutstanding)}
            </div>
          </div>
          <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overdue Debt</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: customer.totalOverdue > 0 ? 'var(--danger)' : 'var(--success)', marginTop: 2 }}>
              {formatINR(customer.totalOverdue)}
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            padding: 14,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 20,
            fontSize: '0.8125rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <Building size={14} style={{ color: 'var(--primary)' }} />
            <span>Contact: <strong>{customer.name || 'Accounts Head'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <Mail size={14} style={{ color: 'var(--primary)' }} />
            <span>Email: <strong>{customer.email || '—'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <Phone size={14} style={{ color: 'var(--primary)' }} />
            <span>Phone: <strong>{customer.phone || '—'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <MapPin size={14} style={{ color: 'var(--primary)' }} />
            <span>Location: <strong>{customer.address || '—'}</strong></span>
          </div>
        </div>

        {/* Invoices list */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Invoice History ({customerInvoices.length})
            </h4>
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddInvoiceForCustomer(customer);
              }}
              className="btn btn-outline btn-sm"
            >
              <Plus size={13} />
              <span>New Invoice</span>
            </button>
          </div>

          {customerInvoices.length === 0 ? (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: 12, border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              No invoices generated for this customer yet.
            </div>
          ) : (
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Due Date</th>
                    <th>Total</th>
                    <th>Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td>{formatDate(inv.dueDate)}</td>
                      <td>{formatINR(inv.totalAmount)}</td>
                      <td style={{ fontWeight: 600, color: inv.remainingAmount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {formatINR(inv.remainingAmount)}
                      </td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Follow-up history */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Follow-up & Contact History ({customerFollowUps.length})
            </h4>
            <button
              type="button"
              onClick={() => {
                onClose();
                onScheduleFollowUpForCustomer(customer);
              }}
              className="btn btn-secondary btn-sm"
            >
              <Clock size={13} />
              <span>Schedule Follow-up</span>
            </button>
          </div>

          {customerFollowUps.length === 0 ? (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: 12, border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              No follow-up records found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
              {customerFollowUps.map((flw) => (
                <div
                  key={flw.id}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {flw.channel} • {flw.invoiceNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {flw.message?.slice(0, 75)}...
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={flw.status} />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatDate(flw.scheduledDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
