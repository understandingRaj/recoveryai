import { useState, useMemo } from 'react';
import {
  Plus,
  Upload,
  Download,
  Filter,
  Eye,
  Edit,
  CreditCard,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/currency';
import StatusBadge from '../components/common/StatusBadge';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import InvoiceFormModal from '../components/invoices/InvoiceFormModal';
import PaymentModal from '../components/invoices/PaymentModal';
import CsvImportModal from '../components/invoices/CsvImportModal';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const { invoices, deleteInvoice } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [overdueFilter, setOverdueFilter] = useState('All');
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Filtered and Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      let matchesOverdue = true;
      if (overdueFilter === 'overdue') {
        matchesOverdue = inv.status === 'Overdue';
      } else if (overdueFilter === '1-30') {
        matchesOverdue = inv.daysOverdue >= 1 && inv.daysOverdue <= 30;
      } else if (overdueFilter === '31-60') {
        matchesOverdue = inv.daysOverdue >= 31 && inv.daysOverdue <= 60;
      } else if (overdueFilter === '60+') {
        matchesOverdue = inv.daysOverdue > 60;
      }

      return matchesSearch && matchesStatus && matchesOverdue;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'dueDate' || sortField === 'invoiceDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [invoices, searchQuery, statusFilter, overdueFilter, sortField, sortOrder]);

  // Paginated Invoices
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Financial Summaries for the invoice list
  const totalInvoicedVal = invoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
  const totalPaidVal = invoices.reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);
  const totalRemainingVal = invoices.reduce((sum, i) => sum + (Number(i.remainingAmount) || 0), 0);
  const totalOverdueVal = invoices
    .filter((i) => i.status === 'Overdue')
    .reduce((sum, i) => sum + (Number(i.remainingAmount) || 0), 0);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      toast.error('No invoices to export');
      return;
    }

    const headers = ['Invoice Number', 'Customer', 'Invoice Date', 'Due Date', 'Total Amount', 'Amount Paid', 'Remaining Amount', 'Days Overdue', 'Status', 'Notes'];
    const rows = filteredInvoices.map((i) => [
      `"${i.invoiceNumber}"`,
      `"${i.customerName}"`,
      i.invoiceDate,
      i.dueDate,
      i.totalAmount,
      i.amountPaid,
      i.remainingAmount,
      i.daysOverdue,
      i.status,
      `"${(i.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recoverai_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Invoices exported to CSV');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice Management</h1>
          <p className="page-subtitle">
            Track receivables, aging cycles, partial payments, and issue settlement requests
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="Download CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Upload size={15} />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24
        }}
        className="grid-4"
      >
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Invoiced
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {formatINR(totalInvoicedVal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Across {invoices.length} invoices
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Outstanding
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
            {formatINR(totalRemainingVal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Uncollected balance
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Delinquent / Overdue
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: totalOverdueVal > 0 ? 'var(--danger)' : 'var(--success)', marginTop: 4 }}>
            {formatINR(totalOverdueVal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {invoices.filter((i) => i.status === 'Overdue').length} past-due invoices
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Recovered / Paid
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>
            {formatINR(totalPaidVal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {invoices.filter((i) => i.status === 'Paid').length} invoices fully cleared
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Controls */}
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, invoice number, notes..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status:</span>
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All ({invoices.length})</option>
                <option value="Overdue">Overdue ({invoices.filter((i) => i.status === 'Overdue').length})</option>
                <option value="Pending">Pending ({invoices.filter((i) => i.status === 'Pending').length})</option>
                <option value="Partially Paid">Partially Paid ({invoices.filter((i) => i.status === 'Partially Paid').length})</option>
                <option value="Paid">Paid ({invoices.filter((i) => i.status === 'Paid').length})</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Aging:</span>
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
                value={overdueFilter}
                onChange={(e) => {
                  setOverdueFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Periods</option>
                <option value="overdue">Overdue Only</option>
                <option value="1-30">1 - 30 Days Past Due</option>
                <option value="31-60">31 - 60 Days Past Due</option>
                <option value="60+">60+ Days Past Due</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('customerName')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>Customer</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Invoice #</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('invoiceDate')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('dueDate')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>Due Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Total Amount</th>
                <th style={{ textAlign: 'right' }}>Amount Paid</th>
                <th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('remainingAmount')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <span>Remaining Due</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Overdue</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {inv.customerName}
                      </div>
                      {inv.notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inv.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {formatDate(inv.invoiceDate)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {formatDate(inv.dueDate)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      {formatINR(inv.totalAmount)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 500 }}>
                      {formatINR(inv.amountPaid)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: inv.remainingAmount > 0 ? 'var(--text-primary)' : 'var(--success)' }}>
                      {formatINR(inv.remainingAmount)}
                    </td>
                    <td>
                      {inv.daysOverdue > 0 ? (
                        <span
                          style={{
                            color: 'var(--danger)',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <AlertTriangle size={13} />
                          {inv.daysOverdue}d overdue
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Current</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForDetail(inv)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForEdit(inv)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Edit Invoice"
                        >
                          <Edit size={15} />
                        </button>
                        {inv.remainingAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--success)' }}
                            title="Record Payment"
                          >
                            <CreditCard size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setInvoiceToDelete(inv)}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Invoice"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      title="No invoices matched"
                      message="No invoices match your selected search query or filters. You can clear your filters or create a new invoice."
                      actionLabel="Reset Filters"
                      onAction={() => {
                        setSearchQuery('');
                        setStatusFilter('All');
                        setOverdueFilter('All');
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredInvoices.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Add Invoice Modal */}
      <InvoiceFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* 2. Edit Invoice Modal */}
      <InvoiceFormModal
        isOpen={!!selectedInvoiceForEdit}
        onClose={() => setSelectedInvoiceForEdit(null)}
        invoiceToEdit={selectedInvoiceForEdit}
      />

      {/* 3. Invoice Detail View */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoiceForDetail}
        onClose={() => setSelectedInvoiceForDetail(null)}
        invoice={selectedInvoiceForDetail}
        onRecordPayment={() => {
          setSelectedInvoiceForPayment(selectedInvoiceForDetail);
          setSelectedInvoiceForDetail(null);
        }}
        onEdit={() => {
          setSelectedInvoiceForEdit(selectedInvoiceForDetail);
          setSelectedInvoiceForDetail(null);
        }}
      />

      {/* 4. Record Payment Modal */}
      <PaymentModal
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        invoice={selectedInvoiceForPayment}
      />

      {/* 5. CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />

      {/* 6. Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={() => {
          if (invoiceToDelete) {
            deleteInvoice(invoiceToDelete.id);
            setInvoiceToDelete(null);
          }
        }}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${invoiceToDelete?.invoiceNumber} for ${invoiceToDelete?.customerName}? This will permanently remove it from receivables.`}
        confirmText="Delete Invoice"
        isDanger={true}
      />
    </div>
  );
}
