import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function InvoiceFormModal({ isOpen, onClose, invoiceToEdit = null }) {
  const { customers, addInvoice, updateInvoice } = useApp();

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    totalAmount: '',
    amountPaid: 0,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (invoiceToEdit) {
      setFormData({
        customerId: invoiceToEdit.customerId || '',
        customerName: invoiceToEdit.customerName || '',
        customerEmail: invoiceToEdit.customerEmail || '',
        invoiceNumber: invoiceToEdit.invoiceNumber || '',
        invoiceDate: invoiceToEdit.invoiceDate || '',
        dueDate: invoiceToEdit.dueDate || '',
        totalAmount: invoiceToEdit.totalAmount || '',
        amountPaid: invoiceToEdit.amountPaid || 0,
        notes: invoiceToEdit.notes || ''
      });
    } else {
      // Default new invoice
      const randomNum = Math.floor(100 + Math.random() * 900);
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 30);

      setFormData({
        customerId: customers[0]?.id || '',
        customerName: customers[0]?.company || '',
        customerEmail: customers[0]?.email || '',
        invoiceNumber: `INV-2026-${randomNum}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: nextDueDate.toISOString().split('T')[0],
        totalAmount: '',
        amountPaid: 0,
        notes: ''
      });
    }
    setErrors({});
  }, [isOpen, invoiceToEdit, customers]);

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customerId: found.id,
        customerName: found.company || found.name,
        customerEmail: found.email
      }));
    } else {
      setFormData((prev) => ({ ...prev, customerId: '', customerName: '', customerEmail: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) errs.customerName = 'Customer is required';
    if (!formData.invoiceNumber.trim()) errs.invoiceNumber = 'Invoice number is required';
    if (!formData.dueDate) errs.dueDate = 'Due date is required';
    
    const total = Number(formData.totalAmount);
    if (!formData.totalAmount || isNaN(total) || total <= 0) {
      errs.totalAmount = 'Total amount must be greater than 0';
    }

    const paid = Number(formData.amountPaid);
    if (isNaN(paid) || paid < 0) {
      errs.amountPaid = 'Paid amount cannot be negative';
    } else if (paid > total) {
      errs.amountPaid = 'Paid amount cannot exceed total invoice amount';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (invoiceToEdit) {
      updateInvoice(invoiceToEdit.id, formData);
    } else {
      addInvoice(formData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoiceToEdit ? 'Edit Invoice' : 'Create New Invoice'}
      subtitle={invoiceToEdit ? `Updating ${invoiceToEdit.invoiceNumber}` : 'Add a new invoice to track receivables'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Customer select */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label required">Select Customer</label>
            <select
              className="form-select"
              value={formData.customerId}
              onChange={handleCustomerSelect}
            >
              <option value="">-- Choose existing customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Customer / Company Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. Acme Technologies"
            />
            {errors.customerName && <div className="form-error">{errors.customerName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Customer Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="e.g. billing@acme.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Invoice Number</label>
            <input
              type="text"
              className="form-input"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="e.g. INV-2026-001"
            />
            {errors.invoiceNumber && <div className="form-error">{errors.invoiceNumber}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required">Issue Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.invoiceDate}
              onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required">Total Amount (₹)</label>
            <input
              type="number"
              min="1"
              step="any"
              className="form-input"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="e.g. 150000"
            />
            {errors.totalAmount && <div className="form-error">{errors.totalAmount}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Initial Amount Paid (₹)</label>
            <input
              type="number"
              min="0"
              step="any"
              className="form-input"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
              placeholder="0"
            />
            {errors.amountPaid && <div className="form-error">{errors.amountPaid}</div>}
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Description / Notes</label>
            <textarea
              rows="2"
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Cloud Architecture Audit Q3"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {invoiceToEdit ? 'Save Changes' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
