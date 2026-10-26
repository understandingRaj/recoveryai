import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { generateReminderMessage } from '../../services/aiService';
import { Copy, Sparkles, Send, ShieldAlert, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MessagePreviewModal({ isOpen, onClose, followUp, invoice }) {
  const { sendFollowUpMessage, business } = useApp();
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (followUp) {
      setMessage(followUp.message || '');
    }
  }, [followUp, isOpen]);

  if (!followUp) return null;

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateReminderMessage({
        customerName: followUp.customerName,
        invoiceNumber: followUp.invoiceNumber,
        amountDue: followUp.amountDue,
        dueDate: invoice?.dueDate || '2026-10-01',
        daysOverdue: invoice?.daysOverdue || 25,
        tone,
        channel: followUp.channel || 'Email',
        businessName: business.name
      });
      setMessage(generated);
      toast.success('Generated fresh message draft');
    } catch (err) {
      toast.error('Failed to regenerate message');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Copied message to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Message draft cannot be empty');
      return;
    }
    sendFollowUpMessage(followUp.id, message);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review & Confirm Reminder"
      subtitle={`Recipient: ${followUp.customerName} • Channel: ${followUp.channel}`}
      maxWidth="max-w-lg"
    >
      <div>
        {/* Safety Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16,
            fontSize: '0.8125rem',
            color: '#1E40AF'
          }}
        >
          <ShieldAlert size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>User Confirmation Required:</strong> Messages will not be dispatched without explicit review. You can edit any wording below.
          </span>
        </div>

        {/* Tone and Quick regenerate tools */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Tone:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8125rem' }}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="Friendly">Friendly</option>
              <option value="Professional">Professional</option>
              <option value="Firm but polite">Firm but polite</option>
            </select>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <Sparkles size={12} />
              <span>{isGenerating ? 'Drafting...' : 'Regenerate'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            {copied ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>

        {/* Message Textarea */}
        <div className="form-group">
          <label className="form-label required">Message Content</label>
          <textarea
            rows="9"
            className="form-textarea"
            style={{ lineHeight: 1.55, fontSize: '0.875rem' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type or edit reminder message here..."
          />
          <div className="form-helper">
            {message.length} characters • Factual details linked to {followUp.invoiceNumber}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Send size={15} />
            <span>Confirm & Send Reminder</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
