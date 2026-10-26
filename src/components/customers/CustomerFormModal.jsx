import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export default function CustomerFormModal({ isOpen, onClose, customerToEdit = null }) {
  const { addCustomer, updateCustomer } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: 'Net 30',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name || '',
        company: customerToEdit.company || '',
        email: customerToEdit.email || '',
        phone: customerToEdit.phone || '',
        address: customerToEdit.address || '',
        paymentTerms: customerToEdit.paymentTerms || 'Net 30',
        notes: customerToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        paymentTerms: 'Net 30',
        notes: ''
      });
    }
    setErrors({});
  }, [isOpen, customerToEdit]);

  const validate = () => {
    const errs = {};
    if (!formData.company.trim() && !formData.name.trim()) {
      errs.company = 'Company name or contact name is required';
    }
    if (formData.email && !formData.email.includes('@')) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, formData);
    } else {
      addCustomer(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? 'Edit Customer' : 'Add New Customer'}
      subtitle={customerToEdit ? `Updating ${customerToEdit.company || customerToEdit.name}` : 'Create a customer profile to track overdue accounts'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label required">Company / Business Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Acme Technologies"
            />
            {errors.company && <div className="form-error">{errors.company}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Primary Contact Person</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Verma"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Business Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. rahul@acme.com"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98201 12345"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Standard Payment Terms</label>
            <select
              className="form-select"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            >
              <option value="Immediate">Immediate / Due on Receipt</option>
              <option value="Net 15">Net 15 Days</option>
              <option value="Net 30">Net 30 Days</option>
              <option value="Net 45">Net 45 Days</option>
              <option value="Net 60">Net 60 Days</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Billing Address / City</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. DLF CyberCity, Gurugram"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Internal Notes / Payment Habits</label>
            <textarea
              rows="2"
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Requires manager purchase order approval before invoice clearance."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {customerToEdit ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
