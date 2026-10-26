import { useState } from 'react';
import {
  Building2,
  Bell,
  Sparkles,
  User,
  Radio,
  Save,
  ShieldCheck,
  Key,
  LogOut,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { business, setBusiness, user, setUser } = useApp();

  const [activeTab, setActiveTab] = useState('business'); // 'business' | 'reminders' | 'ai' | 'integrations' | 'account'

  // Business Form State
  const [bizForm, setBizForm] = useState({
    name: business?.name || '',
    legalName: business?.legalName || '',
    email: business?.email || '',
    phone: business?.phone || '',
    address: business?.address || '',
    currency: business?.currency || 'INR',
    gstNumber: business?.gstNumber || ''
  });

  // Reminder Preferences Form State
  const [reminderForm, setReminderForm] = useState({
    defaultReminderTone: business?.defaultReminderTone || 'Professional',
    reminderSchedule: business?.reminderSchedule || '3 days before due, on due date, 7 days overdue',
    preferredChannel: business?.preferredChannel || 'Email'
  });

  // AI Settings State
  const [aiForm, setAiForm] = useState({
    aiProvider: business?.aiProvider || 'OpenAI (GPT-4o)',
    strictValidation: true,
    preventAggressiveLanguage: true,
    temperature: 0.3
  });

  // User Profile Form State
  const [userForm, setUserForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ''
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveBusiness = (e) => {
    e.preventDefault();
    setBusiness((prev) => ({ ...prev, ...bizForm }));
    toast.success('Business profile updated');
  };

  const handleSaveReminders = (e) => {
    e.preventDefault();
    setBusiness((prev) => ({ ...prev, ...reminderForm }));
    toast.success('Reminder cadence & tone saved');
  };

  const handleSaveAiSettings = (e) => {
    e.preventDefault();
    setBusiness((prev) => ({ ...prev, aiProvider: aiForm.aiProvider }));
    toast.success('AI engine preferences updated');
  };

  const handleSaveUserProfile = (e) => {
    e.preventDefault();
    setUser((prev) => ({ ...prev, ...userForm }));
    toast.success('User account profile updated');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Password updated successfully');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">
            Configure business identity, automated cadence, AI safety guardrails, and tenant integrations
          </p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          marginBottom: 24,
          gap: 20,
          overflowX: 'auto'
        }}
      >
        {[
          { key: 'business', label: 'Business Profile', icon: Building2 },
          { key: 'reminders', label: 'Payment Reminders', icon: Bell },
          { key: 'ai', label: 'AI Configuration', icon: Sparkles },
          { key: 'integrations', label: 'Integrations & API', icon: Radio },
          { key: 'account', label: 'Account & Security', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
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
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. Business Profile Tab */}
      {activeTab === 'business' && (
        <div className="card" style={{ maxWidth: 760 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Commercial Identity & Billing Details</h2>
              <p className="card-subtitle">
                This information appears on generated invoices, reminders, and payment receipts
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBusiness}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label required">Operating Business Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={bizForm.name}
                  onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Registered Legal Entity</label>
                <input
                  type="text"
                  className="form-input"
                  value={bizForm.legalName}
                  onChange={(e) => setBizForm({ ...bizForm, legalName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label required">Finance Contact Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={bizForm.email}
                  onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Billing Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={bizForm.phone}
                  onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Registered Billing Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={bizForm.address}
                onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label required">Default Currency</label>
                <select
                  className="form-select"
                  value={bizForm.currency}
                  onChange={(e) => setBizForm({ ...bizForm, currency: e.target.value })}
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">GSTIN / Tax ID Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={bizForm.gstNumber}
                  onChange={(e) => setBizForm({ ...bizForm, gstNumber: e.target.value })}
                  placeholder="e.g. 07AAAAA0000A1Z5"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={15} />
                <span>Save Business Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Payment Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="card" style={{ maxWidth: 760 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Payment Reminder Preferences</h2>
              <p className="card-subtitle">
                Configure defaults for message tone, escalation schedules, and preferred delivery channels
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveReminders}>
            <div className="form-group">
              <label className="form-label required">Default Reminder Tone</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {['Friendly', 'Professional', 'Firm but polite'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setReminderForm({ ...reminderForm, defaultReminderTone: t })}
                    style={{
                      padding: 12,
                      border: reminderForm.defaultReminderTone === t ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: reminderForm.defaultReminderTone === t ? 'var(--primary-light)' : '#FFFFFF',
                      color: reminderForm.defaultReminderTone === t ? 'var(--primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {t === 'Friendly' ? 'Courteous early reminder' : t === 'Professional' ? 'Balanced standard notice' : 'High-urgency past due'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Automated Cadence Schedule</label>
              <input
                type="text"
                className="form-input"
                value={reminderForm.reminderSchedule}
                onChange={(e) => setReminderForm({ ...reminderForm, reminderSchedule: e.target.value })}
              />
              <div className="form-helper">
                Follow-ups are staged for your manual review according to these milestones.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Preferred Communication Channel</label>
              <select
                className="form-select"
                value={reminderForm.preferredChannel}
                onChange={(e) => setReminderForm({ ...reminderForm, preferredChannel: e.target.value })}
              >
                <option value="Email">Email (Official Invoicing Channel)</option>
                <option value="WhatsApp">WhatsApp Business (Quick Settlement Desk)</option>
                <option value="SMS">SMS Text Notice</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={15} />
                <span>Save Reminder Defaults</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. AI Configuration Tab */}
      {activeTab === 'ai' && (
        <div className="card" style={{ maxWidth: 760 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">AI Engine & Safety Guardrails</h2>
              <p className="card-subtitle">
                Configure generative model provider, strictness policies, and compliance parameters
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveAiSettings}>
            <div className="form-group">
              <label className="form-label required">AI Model Provider</label>
              <select
                className="form-select"
                value={aiForm.aiProvider}
                onChange={(e) => setAiForm({ ...aiForm, aiProvider: e.target.value })}
              >
                <option value="OpenAI (GPT-4o)">OpenAI (GPT-4o) — Active / Configured</option>
                <option value="Anthropic (Claude 3.5 Sonnet)">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="Custom Private LLM Gateway">Custom Private LLM Gateway</option>
              </select>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: 16,
                marginBottom: 20
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                Safety & Compliance Guardrails
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={aiForm.strictValidation}
                    onChange={(e) => setAiForm({ ...aiForm, strictValidation: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                  />
                  <span>
                    <strong>Strict Ledger Verification:</strong> Only allow exact invoice numbers, amounts, and dates from active database records.
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={aiForm.preventAggressiveLanguage}
                    onChange={(e) => setAiForm({ ...aiForm, preventAggressiveLanguage: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                  />
                  <span>
                    <strong>Anti-Harassment Shield:</strong> Prohibit threatening legal language, defamatory statements, or misleading settlement discounts.
                  </span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Model Creativity Index (Temperature)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={aiForm.temperature}
                  onChange={(e) => setAiForm({ ...aiForm, temperature: parseFloat(e.target.value) })}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, width: 36 }}>{aiForm.temperature}</span>
              </div>
              <div className="form-helper">
                Lower values (0.2–0.4) enforce high precision financial language.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={15} />
                <span>Save AI Guardrails</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Integrations Tab */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Connected Delivery Services</h2>
                <p className="card-subtitle">
                  External gateways for transactional emails, WhatsApp Business, and AI synthesis
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email Gateway */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 14,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>SendGrid / AWS SES Mail Gateway</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Sends customer invoices and payment notices
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-success">
                    <CheckCircle2 size={12} />
                    Connected (Demo Mode)
                  </span>
                </div>
              </div>

              {/* WhatsApp Gateway */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 14,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Meta WhatsApp Business API</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Interactive message templates and delivery confirmations
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-warning">
                    <AlertTriangle size={12} />
                    Sandbox (Simulated)
                  </span>
                </div>
              </div>

              {/* OpenAI Gateway */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 14,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>OpenAI GPT-4o Gateway</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Contextual reminder message synthesis and analysis
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-success">
                    <CheckCircle2 size={12} />
                    Ready (Backend Configured)
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-muted)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}
            >
              Note: In this browser demo session, message transmissions are recorded into your local audit feed and follow-up timeline without charging real SMS or WhatsApp credits.
            </div>
          </div>
        </div>
      )}

      {/* 5. Account & Security Tab */}
      {activeTab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
          {/* Profile Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">User Account Profile</h2>
                <p className="card-subtitle">Personal credentials and access role</p>
              </div>
            </div>

            <form onSubmit={handleSaveUserProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label required">Your Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Login Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <input
                  type="text"
                  className="form-input"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="submit" className="btn btn-primary">
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Change Password</h2>
                <p className="card-subtitle">Ensure your account uses a strong, secure passphrase</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label required">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label required">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="submit" className="btn btn-secondary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
