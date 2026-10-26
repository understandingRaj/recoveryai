import { useState } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CsvImportModal({ isOpen, onClose }) {
  const { importInvoices, customers } = useApp();
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleCsv = `InvoiceNumber,CustomerName,DueDate,TotalAmount,AmountPaid,Notes
INV-2026-101,Acme Technologies,2026-11-20,120000,0,Cloud migration sprints
INV-2026-102,Bright Solutions,2026-10-15,65000,0,DevOps monthly retainer
INV-2026-103,Nova Enterprises,2026-10-01,95000,20000,API gateway integration`;

  const handleParse = (text) => {
    setErrorMsg('');
    try {
      const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setErrorMsg('CSV must include a header line and at least one data row.');
        setParsedRows([]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const invNumIdx = headers.findIndex((h) => h.includes('invoicenumber') || h.includes('invoice') || h.includes('number'));
      const custIdx = headers.findIndex((h) => h.includes('customer') || h.includes('company'));
      const dueIdx = headers.findIndex((h) => h.includes('due'));
      const totalIdx = headers.findIndex((h) => h.includes('total') || h.includes('amount'));
      const paidIdx = headers.findIndex((h) => h.includes('paid'));
      const notesIdx = headers.findIndex((h) => h.includes('notes') || h.includes('desc'));

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length < 3) continue;

        const invoiceNumber = parts[invNumIdx] || `INV-IMP-${i}`;
        const customerName = parts[custIdx] || 'Imported Customer';
        const dueDate = parts[dueIdx] || new Date().toISOString().split('T')[0];
        const totalAmount = parseFloat(parts[totalIdx]) || 0;
        const amountPaid = paidIdx !== -1 ? (parseFloat(parts[paidIdx]) || 0) : 0;
        const notes = notesIdx !== -1 ? parts[notesIdx] : 'CSV Imported Invoice';

        const isValid = totalAmount > 0 && customerName && invoiceNumber;

        rows.push({
          invoiceNumber,
          customerName,
          dueDate,
          totalAmount,
          amountPaid,
          notes,
          isValid,
          validationError: !isValid ? 'Invalid amount or customer name' : null
        });
      }

      setParsedRows(rows);
    } catch (err) {
      setErrorMsg('Failed to parse CSV format. Please check syntax.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setCsvText(content);
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error('No valid rows found to import.');
      return;
    }
    importInvoices(validRows);
    onClose();
    setCsvText('');
    setParsedRows([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Invoices from CSV"
      subtitle="Upload or paste invoice CSV data with headers"
      maxWidth="max-w-xl"
    >
      <div>
        {/* Sample Download / Template info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Expected format: <code>InvoiceNumber, CustomerName, DueDate, TotalAmount, AmountPaid, Notes</code>
          </div>
          <button
            type="button"
            onClick={() => {
              setCsvText(sampleCsv);
              handleParse(sampleCsv);
            }}
            className="btn btn-secondary btn-sm"
          >
            Load Sample CSV
          </button>
        </div>

        {/* File upload drag/drop zone */}
        <div
          style={{
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 16px',
            textAlign: 'center',
            marginBottom: 16,
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            position: 'relative'
          }}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          <Upload size={28} style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Click or drag & drop CSV file
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Supports standard UTF-8 encoded .csv files
          </div>
        </div>

        {/* Direct text area */}
        <div className="form-group">
          <label className="form-label">Or Paste CSV Content Directly</label>
          <textarea
            rows="4"
            className="form-textarea"
            style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              handleParse(e.target.value);
            }}
            placeholder={sampleCsv}
          />
          {errorMsg && <div className="form-error">{errorMsg}</div>}
        </div>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              Data Preview ({parsedRows.filter((r) => r.isValid).length} valid of {parsedRows.length} rows)
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <table className="data-table" style={{ fontSize: '0.78rem' }}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Due Date</th>
                    <th>Total (₹)</th>
                    <th>Paid (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        {row.isValid ? (
                          <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={13} /> Valid
                          </span>
                        ) : (
                          <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={13} /> Invalid
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{row.invoiceNumber}</td>
                      <td>{row.customerName}</td>
                      <td>{row.dueDate}</td>
                      <td>₹{row.totalAmount?.toLocaleString('en-IN')}</td>
                      <td>₹{row.amountPaid?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={parsedRows.filter((r) => r.isValid).length === 0}
            className="btn btn-primary"
          >
            Import {parsedRows.filter((r) => r.isValid).length} Invoices
          </button>
        </div>
      </div>
    </Modal>
  );
}
