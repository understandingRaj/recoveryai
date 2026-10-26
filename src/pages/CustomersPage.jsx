import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  ArrowUpRight,
  Eye,
  Edit,
  Trash2,
  FileText,
  Sparkles,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/currency';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CustomerFormModal from '../components/customers/CustomerFormModal';
import CustomerDetailModal from '../components/customers/CustomerDetailModal';
import InvoiceFormModal from '../components/invoices/InvoiceFormModal';
import FollowUpFormModal from '../components/followups/FollowUpFormModal';

export default function CustomersPage() {
  const { customers, invoices, deleteCustomer } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [termsFilter, setTermsFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [customerForDetail, setCustomerForDetail] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [customerForNewInvoice, setCustomerForNewInvoice] = useState(null);
  const [customerForNewFollowUp, setCustomerForNewFollowUp] = useState(null);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch =
        cust.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone?.includes(searchQuery);

      const matchesTerms = termsFilter === 'All' || cust.paymentTerms === termsFilter;

      let matchesStatus = true;
      if (statusFilter === 'Overdue') {
        matchesStatus = (cust.totalOverdue || 0) > 0;
      } else if (statusFilter === 'Outstanding') {
        matchesStatus = (cust.totalOutstanding || 0) > 0;
      } else if (statusFilter === 'Clear') {
        matchesStatus = (cust.totalOutstanding || 0) === 0;
      }

      return matchesSearch && matchesTerms && matchesStatus;
    });
  }, [customers, searchQuery, termsFilter, statusFilter]);

  // Aggregate stats
  const totalCustomers = customers.length;
  const customersWithOverdue = customers.filter((c) => (c.totalOverdue || 0) > 0).length;
  const totalReceivables = customers.reduce((sum, c) => sum + (c.totalOutstanding || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Accounts</h1>
          <p className="page-subtitle">
            Directory of corporate clients, credit history, payment terms, and communications
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Active Accounts
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {totalCustomers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Registered client accounts
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Accounts with Overdue Dues
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: customersWithOverdue > 0 ? 'var(--danger)' : 'var(--success)', marginTop: 4 }}>
            {customersWithOverdue}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Requires priority follow-up
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Customer Receivables
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
            {formatINR(totalReceivables)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Across all clients
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Search & Filters */}
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by customer name, company, email, or phone..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by account status"
            >
              <option value="All">All Balance States</option>
              <option value="Overdue">Has Overdue Dues</option>
              <option value="Outstanding">Has Outstanding Balance</option>
              <option value="Clear">Zero Balance (Clear)</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
              value={termsFilter}
              onChange={(e) => setTermsFilter(e.target.value)}
              aria-label="Filter by payment terms"
            >
              <option value="All">All Payment Terms</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Due on Receipt">Due on Receipt</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Customer / Company</th>
                <th>Contact Info</th>
                <th>Payment Terms</th>
                <th style={{ textAlign: 'right' }}>Total Invoiced</th>
                <th style={{ textAlign: 'right' }}>Outstanding</th>
                <th style={{ textAlign: 'right' }}>Overdue Debt</th>
                <th>Last Contact</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => {
                  const custInvoices = invoices.filter(
                    (inv) => inv.customerId === cust.id || inv.customerName.toLowerCase() === cust.company.toLowerCase()
                  );
                  const openInvoicesCount = custInvoices.filter((i) => i.remainingAmount > 0).length;

                  return (
                    <tr key={cust.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {cust.company || cust.name}
                        </div>
                        {cust.name && cust.company && cust.name !== cust.company && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Contact: {cust.name}
                          </div>
                        )}
                        {cust.address && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <MapPin size={11} />
                            <span style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cust.address}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={13} style={{ color: 'var(--primary)' }} />
                          <span>{cust.email || '—'}</span>
                        </div>
                        {cust.phone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <Phone size={12} />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--bg-muted)',
                            color: 'var(--text-secondary)',
                            fontWeight: 500
                          }}
                        >
                          {cust.paymentTerms || 'Net 30'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        {formatINR(cust.totalInvoiced || 0)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: (cust.totalOutstanding || 0) > 0 ? 'var(--text-primary)' : 'var(--success)' }}>
                        {formatINR(cust.totalOutstanding || 0)}
                        {openInvoicesCount > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {openInvoicesCount} open
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: (cust.totalOverdue || 0) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {formatINR(cust.totalOverdue || 0)}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {formatDate(cust.lastContactDate || '2026-10-18')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => setCustomerForDetail(cust)}
                            className="btn btn-ghost btn-icon btn-sm"
                            title="View Full Profile & Invoices"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomerToEdit(cust)}
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Edit Customer"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomerForNewInvoice(cust)}
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--primary)' }}
                            title="Create Invoice for Client"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomerToDelete(cust)}
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--danger)' }}
                            title="Delete Customer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="No customers match criteria"
                      message="No client accounts match your active search filters. Try clearing your filters or add a new customer."
                      actionLabel="Reset Search"
                      onAction={() => {
                        setSearchQuery('');
                        setTermsFilter('All');
                        setStatusFilter('All');
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Add Customer */}
      <CustomerFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* 2. Edit Customer */}
      <CustomerFormModal
        isOpen={!!customerToEdit}
        onClose={() => setCustomerToEdit(null)}
        customerToEdit={customerToEdit}
      />

      {/* 3. Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={!!customerForDetail}
        onClose={() => setCustomerForDetail(null)}
        customer={customerForDetail}
        onAddInvoiceForCustomer={() => {
          setCustomerForNewInvoice(customerForDetail);
          setCustomerForDetail(null);
        }}
        onScheduleFollowUpForCustomer={() => {
          setCustomerForNewFollowUp(customerForDetail);
          setCustomerForDetail(null);
        }}
      />

      {/* 4. Create Invoice for specific customer */}
      <InvoiceFormModal
        isOpen={!!customerForNewInvoice}
        onClose={() => setCustomerForNewInvoice(null)}
        invoiceToEdit={customerForNewInvoice ? {
          customerId: customerForNewInvoice.id,
          customerName: customerForNewInvoice.company || customerForNewInvoice.name,
          customerEmail: customerForNewInvoice.email,
          totalAmount: '',
          amountPaid: 0,
          invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
        } : null}
      />

      {/* 5. Schedule Follow-up for customer */}
      <FollowUpFormModal
        isOpen={!!customerForNewFollowUp}
        onClose={() => setCustomerForNewFollowUp(null)}
        initialData={customerForNewFollowUp ? {
          customerId: customerForNewFollowUp.id,
          customerName: customerForNewFollowUp.company || customerForNewFollowUp.name,
          amountDue: customerForNewFollowUp.totalOutstanding || 0
        } : null}
      />

      {/* 6. Confirm Delete Customer */}
      <ConfirmDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
          }
        }}
        title="Delete Customer"
        message={`Are you sure you want to remove ${customerToDelete?.company || customerToDelete?.name}? Associated invoices will remain in history.`}
        confirmText="Delete Account"
        isDanger={true}
      />
    </div>
  );
}
