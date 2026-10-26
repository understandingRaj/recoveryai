import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { generateReminderMessage } from '../../services/aiService';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FollowUpFormModal({ isOpen, onClose, initialData = null }) {
  const { customers, invoices, addFollowUp, business } = useApp();

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    invoiceId: '',
    invoiceNumber: '',
    amountDue: 0,
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    channel: 'Email',
    message: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerId: initialData.customerId || '',
        customerName: initialData.customerName || '',
        invoiceId: initialData.invoiceId || '',
        invoiceNumber: initialData.invoiceNumber || '',
        amountDue: initialData.amountDue || 0,
        scheduledDate: initialData.scheduledDate || new Date().toISOString().split('T')[0],
        priority: initialData.priority || 'Medium',
        channel: initialData.channel || 'Email',
        message: initialData.message || ''
      });
    } else {
      const firstInvoice = invoices.find((i) => i.remainingAmount > 0) || invoices[0];
      setFormData({
        customerId: firstInvoice?.customerId || '',
        customerName: firstInvoice?.customerName || '',
        invoiceId: firstInvoice?.id || '',
        invoiceNumber: firstInvoice?.invoiceNumber || '',
        amountDue: firstInvoice?.remainingAmount || 0,
        scheduledDate: new Date().toISOString().split('T')[0],
        priority: 'High',
        channel: 'Email',
        message: ''
      });
    }
  }, [isOpen, initialData, invoices]);

  const handleInvoiceChange = (e) => {
    const invId = e.target.value;
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setFormData((prev) => ({
        ...prev,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        customerId: inv.customerId,
        amountDue: inv.remainingAmount
      }));
    }
  };

  const handleGenerateDraft = async () => {
    const inv = invoices.find((i) => i.id === formData.invoiceId);
    setIsGenerating(true);
    try {
      const draft = await generateReminderMessage({
        customerName: formData.customerName,
        invoiceNumber: formData.invoiceNumber,
        amountDue: formData.amountDue,
        dueDate: inv?.dueDate || '2026-10-15',
        daysOverdue: inv?.daysOverdue || 10,
        tone: 'Professional',
        channel: formData.channel,
        businessName: business.name
      });
      setFormData((prev) => ({ ...prev, message: draft }));
      toast.success('AI reminder drafted');
    } catch (err) {
      toast.error('Draft generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.invoiceNumber) {
      toast.error('Please select an invoice and customer');
      return;
    }
    addFollowUp(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Follow-up"
      subtitle="Plan a structured payment reminder or outreach"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label required">Select Invoice</label>
            <select
              className="form-select"
              value={formData.invoiceId}
              onChange={handleInvoiceChange}
              required
            >
              <option value="">-- Choose outstanding invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} • {inv.customerName} (Due: ₹{inv.remainingAmount?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Schedule Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Priority</label>
            <select
              className="form-select"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label required">Channel</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Email', 'WhatsApp', 'Phone Call', 'SMS'].map((chan) => (
                <label
                  key={chan}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: formData.channel === chan ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: formData.channel === chan ? 'var(--primary-light)' : '#FFFFFF',
                    color: formData.channel === chan ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 500
                  }}
                >
                  <input
                    type="radio"
                    name="channel"
                    value={chan}
                    checked={formData.channel === chan}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    style={{ display: 'none' }}
                  />
                  {chan}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Message / Call Script</label>
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={isGenerating}
                className="btn btn-outline btn-sm"
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              >
                <Sparkles size={12} />
                <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
              </button>
            </div>
            <textarea
              rows="4"
              className="form-textarea"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter message details or click AI Generate..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Schedule Follow-up
          </button>
        </div>
      </form>
    </Modal>
  );
}
