import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';

export default function PaymentModal({ isOpen, onClose, invoice }) {
  const { recordPayment } = useApp();

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (invoice) {
      setPaymentAmount(invoice.remainingAmount || '');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Bank Transfer');
      setReference('');
      setNotes('');
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    recordPayment(invoice.id, paymentAmount, paymentDate, `${paymentMethod} ${reference ? `(Ref: ${reference})` : ''}`, notes);
    onClose();
  };

  const handleFullPayment = () => {
    setPaymentAmount(invoice.remainingAmount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      subtitle={`Invoice ${invoice.invoiceNumber} • ${invoice.customerName}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit}>
        {/* Balance Summary Box */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 14,
            marginBottom: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Invoice</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatINR(invoice.totalAmount)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Outstanding Due</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--danger)' }}>
              {formatINR(invoice.remainingAmount)}
            </div>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label required" style={{ margin: 0 }}>Payment Amount (₹)</label>
            <button
              type="button"
              onClick={handleFullPayment}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Pay Full Balance
            </button>
          </div>
          <input
            type="number"
            min="1"
            max={invoice.remainingAmount}
            step="any"
            className="form-input"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter payment amount"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Payment Date</label>
          <input
            type="date"
            className="form-input"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Payment Method</label>
          <select
            className="form-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
            <option value="UPI / QR">UPI / QR Code</option>
            <option value="Credit / Debit Card">Credit / Debit Card</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Transaction / UTR Reference</label>
          <input
            type="text"
            className="form-input"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. UTR198273645"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Payment Notes (Optional)</label>
          <input
            type="text"
            className="form-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Cleared via HDFC Bank"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Confirm Payment
          </button>
        </div>
      </form>
    </Modal>
  );
}
