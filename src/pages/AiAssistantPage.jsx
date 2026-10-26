import { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  RotateCcw,
  Send,
  Save,
  Check,
  ShieldCheck,
  AlertTriangle,
  Building,
  FileText,
  Mail,
  Smartphone,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateReminderMessage } from '../services/aiService';
import { formatINR, formatDate } from '../utils/currency';
import toast from 'react-hot-toast';

export default function AiAssistantPage() {
  const { customers, invoices, business, addFollowUp, sendFollowUpMessage } = useApp();

  // State selectors
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [tone, setTone] = useState('Professional');
  const [channel, setChannel] = useState('Email');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize with first unpaid invoice
  useEffect(() => {
    if (invoices.length > 0 && !selectedInvoiceId) {
      const unpaid = invoices.find((i) => i.remainingAmount > 0) || invoices[0];
      setSelectedInvoiceId(unpaid.id);
      setSelectedCustomerId(unpaid.customerId || customers[0]?.id || '');
    }
  }, [invoices, customers, selectedInvoiceId]);

  // Selected entities
  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId || c.company === selectedInvoice?.customerName);

  // When customer changes, pick their first invoice
  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      const matchingInv = invoices.find((i) => i.customerId === custId || i.customerName === cust.company);
      if (matchingInv) {
        setSelectedInvoiceId(matchingInv.id);
      }
    }
  };

  // Generate Message using AI service
  const handleGenerate = async () => {
    if (!selectedInvoice) {
      toast.error('Please choose a valid invoice first');
      return;
    }

    setIsGenerating(true);
    try {
      const msg = await generateReminderMessage({
        customerName: selectedCustomer?.company || selectedInvoice.customerName,
        contactPerson: selectedCustomer?.name,
        invoiceNumber: selectedInvoice.invoiceNumber,
        amountDue: selectedInvoice.remainingAmount,
        dueDate: selectedInvoice.dueDate,
        daysOverdue: selectedInvoice.daysOverdue,
        tone,
        channel,
        businessName: business.name
      });
      setGeneratedMessage(msg);
      toast.success('Generated AI reminder draft');
    } catch (err) {
      toast.error('Failed to generate message draft');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate initial draft when invoice or tone or channel changes if empty
  useEffect(() => {
    if (selectedInvoice && !generatedMessage) {
      handleGenerate();
    }
  }, [selectedInvoiceId]);

  // Copy to clipboard
  const handleCopy = () => {
    if (!generatedMessage.trim()) return;
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    toast.success('Copied reminder to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Save as Follow-up Draft
  const handleSaveDraft = () => {
    if (!generatedMessage.trim()) {
      toast.error('No draft content to save');
      return;
    }

    addFollowUp({
      customerId: selectedCustomer?.id || selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      amountDue: selectedInvoice.remainingAmount,
      scheduledDate: new Date().toISOString().split('T')[0],
      priority: selectedInvoice.daysOverdue > 20 ? 'High' : selectedInvoice.daysOverdue > 0 ? 'Medium' : 'Low',
      channel,
      message: generatedMessage,
      status: 'Pending'
    });
    toast.success('Saved draft to Scheduled Follow-ups');
  };

  // Direct Send
  const handleSendReminder = () => {
    if (!generatedMessage.trim()) {
      toast.error('Draft message is empty');
      return;
    }

    const createdFollowUp = addFollowUp({
      customerId: selectedCustomer?.id || selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      amountDue: selectedInvoice.remainingAmount,
      scheduledDate: new Date().toISOString().split('T')[0],
      priority: selectedInvoice.daysOverdue > 20 ? 'High' : 'Medium',
      channel,
      message: generatedMessage,
      status: 'Pending'
    });

    sendFollowUpMessage(createdFollowUp.id, generatedMessage);
  };

  // Stats calculation
  const charCount = generatedMessage.length;
  const wordCount = generatedMessage.trim() ? generatedMessage.trim().split(/\s+/).length : 0;

  // Tone recommendation logic
  const getRecommendedTone = () => {
    if (!selectedInvoice) return 'Professional';
    if (selectedInvoice.daysOverdue > 30) return 'Firm but polite';
    if (selectedInvoice.daysOverdue > 0) return 'Professional';
    return 'Friendly';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">AI Payment Recovery Assistant</h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--secondary-light)',
                color: 'var(--secondary)',
                border: '1px solid #DDD6FE'
              }}
            >
              GPT-4o Engine
            </span>
          </div>
          <p className="page-subtitle">
            Craft context-aware, professionally balanced collection reminders using verified invoice ledger data
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.1fr 1.3fr', gap: 24, alignItems: 'start' }}>
        {/* Left Side: Parameters & Invoice Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Configuration Card */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 16 }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              <span>Reminder Parameters</span>
            </h2>

            <div className="form-group">
              <label className="form-label required">Select Customer</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={handleCustomerChange}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company || c.name} {c.totalOverdue > 0 ? `(Overdue: ${formatINR(c.totalOverdue)})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Select Outstanding Invoice</label>
              <select
                className="form-select"
                value={selectedInvoiceId}
                onChange={(e) => {
                  setSelectedInvoiceId(e.target.value);
                  const inv = invoices.find((i) => i.id === e.target.value);
                  if (inv && inv.customerId) setSelectedCustomerId(inv.customerId);
                }}
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.customerName} ({formatINR(inv.remainingAmount)} due, {inv.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Tone Selector */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label required" style={{ margin: 0 }}>Message Tone</label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Recommended: <strong>{getRecommendedTone()}</strong>
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {['Friendly', 'Professional', 'Firm but polite'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '0.75rem',
                      fontWeight: tone === t ? 600 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: tone === t ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: tone === t ? 'var(--primary-light)' : '#FFFFFF',
                      color: tone === t ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Selector */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label required">Delivery Channel</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { name: 'Email', icon: Mail },
                  { name: 'WhatsApp', icon: Smartphone },
                  { name: 'SMS', icon: Smartphone }
                ].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      key={ch.name}
                      type="button"
                      onClick={() => setChannel(ch.name)}
                      style={{
                        padding: '8px 4px',
                        fontSize: '0.75rem',
                        fontWeight: channel === ch.name ? 600 : 500,
                        borderRadius: 'var(--radius-sm)',
                        border: channel === ch.name ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: channel === ch.name ? 'var(--primary-light)' : '#FFFFFF',
                        color: channel === ch.name ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Icon size={14} />
                      <span>{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Synthesizing Message...' : 'Generate AI Message'}</span>
            </button>
          </div>

          {/* Active Ledger Context Box */}
          {selectedInvoice && (
            <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={15} style={{ color: 'var(--primary)' }} />
                <span>Verified Financial Context</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Outstanding Due:</span>
                  <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1.0625rem' }}>
                    {formatINR(selectedInvoice.remainingAmount)}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Overdue Status:</span>
                  <div style={{ fontWeight: 600, color: selectedInvoice.daysOverdue > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {selectedInvoice.daysOverdue > 0 ? `${selectedInvoice.daysOverdue} days past due` : 'Not overdue'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Maturity Date:</span>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {formatDate(selectedInvoice.dueDate)}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Customer Terms:</span>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {selectedCustomer?.paymentTerms || 'Net 30'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <ShieldCheck size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>Zero hallucination policy: Only verified amounts & dates are populated.</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Editable Preview & Delivery Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ minHeight: 480, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="card-title">Editable Reminder Draft</h2>
                <p className="card-subtitle">
                  Review and customize this draft. Messages are never sent without explicit confirmation.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn btn-secondary btn-sm"
                  title="Regenerate message"
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <RotateCcw size={13} />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {copied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <textarea
                className="form-textarea"
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                placeholder="Click 'Generate AI Message' or write your custom reminder draft here..."
                style={{
                  flex: 1,
                  minHeight: 280,
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  fontFamily: channel === 'Email' ? 'inherit' : 'monospace',
                  padding: 16
                }}
              />

              {/* Counters */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                <span>Format: {channel} • Tone: {tone}</span>
                <span>{charCount} characters • {wordCount} words</span>
              </div>
            </div>

            {/* Bottom Action Strip */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12,
                paddingTop: 16,
                borderTop: '1px solid var(--border)'
              }}
            >
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Save size={15} />
                <span>Save as Follow-up Draft</span>
              </button>

              <button
                type="button"
                onClick={handleSendReminder}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={15} />
                <span>Review & Send Now</span>
              </button>
            </div>
          </div>

          {/* AI Behavioral Guidelines Notice */}
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#EEF2FF',
              border: '1px solid #C7D2FE',
              display: 'flex',
              gap: 12
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary)' }}>
                Responsible Financial Recovery AI
              </div>
              <p style={{ fontSize: '0.75rem', color: '#3730A3', marginTop: 2, lineHeight: 1.4 }}>
                RecoverAI strictly prohibits deceptive language, unauthorized payment promises, and aggressive threats. All communications maintain commercial courtesy while prioritizing receivable liquidity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
