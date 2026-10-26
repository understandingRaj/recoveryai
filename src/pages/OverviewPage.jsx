import { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Eye,
  Edit,
  CreditCard,
  Trash2,
  Send,
  MessageSquare,
  Clock,
  ChevronRight,
  Plus,
  ShieldAlert,
  ArrowUpDown,
  Building2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/currency';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import InvoiceFormModal from '../components/invoices/InvoiceFormModal';
import PaymentModal from '../components/invoices/PaymentModal';
import MessagePreviewModal from '../components/followups/MessagePreviewModal';
import CustomerDetailModal from '../components/customers/CustomerDetailModal';
import toast from 'react-hot-toast';

export default function OverviewPage() {
  const {
    user,
    invoices,
    customers,
    followUps,
    recommendations,
    collectionTrend,
    deleteInvoice,
    totalOutstanding,
    overdueAmount,
    collectedThisMonth,
    highPriorityFollowUpsCount
  } = useApp();

  const outletContext = useOutletContext();
  const navigate = useNavigate();

  // State for Chart Timeframe
  const [chartRange, setChartRange] = useState('6M');

  // Filter and Search states for Invoices table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [selectedFollowUpForMessage, setSelectedFollowUpForMessage] = useState(null);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState(null);

  // Filtered and Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search query filter
      const matchesSearch =
        inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      // Period filter (overdue duration)
      let matchesPeriod = true;
      if (periodFilter === 'overdue') {
        matchesPeriod = inv.status === 'Overdue';
      } else if (periodFilter === '1-30') {
        matchesPeriod = inv.daysOverdue >= 1 && inv.daysOverdue <= 30;
      } else if (periodFilter === '31-60') {
        matchesPeriod = inv.daysOverdue >= 31 && inv.daysOverdue <= 60;
      } else if (periodFilter === '60+') {
        matchesPeriod = inv.daysOverdue > 60;
      }

      return matchesSearch && matchesStatus && matchesPeriod;
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
  }, [invoices, searchQuery, statusFilter, periodFilter, sortField, sortOrder]);

  // Paginated Invoices
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Overdue Alerts list (Invoices significantly overdue > 10 days)
  const overdueAlerts = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'Overdue' && inv.remainingAmount > 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 5);
  }, [invoices]);

  // Follow-ups Due Today list
  const followUpsDueToday = useMemo(() => {
    return followUps.filter((f) => f.status === 'Pending').slice(0, 4);
  }, [followUps]);

  // Calculate percentage of overdue
  const overduePercentage = totalOutstanding > 0 ? ((overdueAmount / totalOutstanding) * 100).toFixed(1) : 0;

  // Sorting toggle helper
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleActionRecommendation = (rec) => {
    if (rec.id === 'rec_1') {
      navigate('/ai-assistant');
    } else if (rec.id === 'rec_2') {
      navigate('/customers');
    } else {
      setStatusFilter('Overdue');
      toast.success('Filtered to high priority overdue invoices');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, {user?.name?.split(' ')[0] || 'Alex'}</h1>
          <p className="page-subtitle">
            Here's what's happening with your receivables today.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)'
            }}
          >
            <Calendar size={14} style={{ color: 'var(--primary)' }} />
            <span>Today: {formatDate(new Date().toISOString())}</span>
          </div>

          <button
            onClick={() => outletContext?.openAddInvoice()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Add Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Outstanding"
          value={formatINR(totalOutstanding)}
          subtext="+4.2% from last month"
          icon={DollarSign}
          color="var(--primary)"
          trendType="neutral"
        />

        <StatCard
          title="Overdue Amount"
          value={formatINR(overdueAmount)}
          subtext={`${overduePercentage}% of total receivables`}
          icon={AlertCircle}
          color="var(--danger)"
          trendType={overdueAmount > 0 ? 'negative' : 'positive'}
          trendValue={overdueAmount > 0 ? 'Action needed' : 'All clear'}
        />

        <StatCard
          title="Collected This Month"
          value={formatINR(collectedThisMonth)}
          subtext="+18.4% month-over-month"
          icon={CheckCircle2}
          color="var(--success)"
          trendType="positive"
          trendValue="Strong pace"
        />

        <StatCard
          title="Follow-ups Due Today"
          value={`${followUpsDueToday.length} customers`}
          subtext={`${highPriorityFollowUpsCount} high priority queued`}
          icon={Clock}
          color="var(--secondary)"
          trendType="neutral"
        />
      </div>

      {/* Main Dashboard Layout: Chart & AI Recommendation / Overdue Alerts */}
      <div className="grid-dashboard-layout">
        {/* Left Column: Collection Trend Chart & Invoices Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Collection Trend Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                  <span>Collection & Receivables Trend</span>
                </h2>
                <p className="card-subtitle">
                  Six-month historical trajectory of payments collected vs outstanding dues
                </p>
              </div>

              {/* Date Range Selector */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-muted)',
                  padding: 3,
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {['30D', '6M', 'YTD'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setChartRange(range)}
                    style={{
                      border: 'none',
                      background: chartRange === range ? '#FFFFFF' : 'transparent',
                      color: chartRange === range ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: chartRange === range ? 600 : 500,
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      boxShadow: chartRange === range ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {range === '30D' ? '30 Days' : range === '6M' ? 'Last 6 Months' : 'Year to Date'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: 280, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={collectionTrend}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatINR(value), '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: 12, fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    name="Payments Collected"
                    dataKey="collected"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCollected)"
                  />
                  <Area
                    type="monotone"
                    name="Outstanding Receivables"
                    dataKey="outstanding"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorOutstanding)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outstanding Invoices Table Card */}
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 className="card-title">
                  <span>Outstanding & Recent Invoices</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {filteredInvoices.length} invoices
                  </span>
                </h2>
                <p className="card-subtitle">
                  Live status tracking with overdue calculations and automated reminders
                </p>
              </div>

              {/* Filters & Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <SearchInput
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Search customer, invoice #..."
                />

                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by status"
                >
                  <option value="All">All Statuses</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>

                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
                  value={periodFilter}
                  onChange={(e) => {
                    setPeriodFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by overdue period"
                >
                  <option value="All">All Durations</option>
                  <option value="overdue">Any Overdue</option>
                  <option value="1-30">1 - 30 Days Overdue</option>
                  <option value="31-60">31 - 60 Days Overdue</option>
                  <option value="60+">60+ Days Overdue</option>
                </select>
              </div>
            </div>

            {/* Table */}
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
                    <th>Invoice Date</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('dueDate')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>Due Date</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('remainingAmount')}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <span>Amount Due</span>
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
                          {inv.customerEmail && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {inv.customerEmail}
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
                              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
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
                              title="View Invoice"
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
                      <td colSpan={9}>
                        <EmptyState
                          title="No invoices found"
                          message="No records matched your search or filters. Try adjusting your filter parameters or create a new invoice."
                          actionLabel="Clear Filters"
                          onAction={() => {
                            setSearchQuery('');
                            setStatusFilter('All');
                            setPeriodFilter('All');
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
        </div>

        {/* Right Column: AI Recommendations, Overdue Alerts & Follow-ups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* AI Recommendations Card */}
          <div
            className="card"
            style={{
              border: '1px solid #C7D2FE',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%)'
            }}
          >
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="card-title" style={{ fontSize: '0.9375rem' }}>AI Recommendations</h2>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Contextual guidance based on receivables patterns
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 12,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rec.text}
                    </span>
                    <PriorityBadge priority={rec.priority} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
                    {rec.reason}
                  </p>
                  <button
                    onClick={() => handleActionRecommendation(rec)}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.75rem' }}
                  >
                    <span>{rec.actionText}</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 12,
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '1px dashed var(--border)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                lineHeight: 1.3
              }}
            >
              Recommendations are generated as decision-support suggestions, not guaranteed predictions.
            </div>
          </div>

          {/* Overdue Alerts Card */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="card-title" style={{ fontSize: '0.9375rem' }}>
                  <ShieldAlert size={16} style={{ color: 'var(--danger)' }} />
                  <span>Overdue Alerts</span>
                </h2>
                <p className="card-subtitle">Customers with significant delinquent balances</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overdueAlerts.length > 0 ? (
                overdueAlerts.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#991B1B' }}>
                        {inv.customerName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#B91C1C', marginTop: 2 }}>
                        <span>{formatINR(inv.remainingAmount)}</span>
                        <span>•</span>
                        <span>{inv.daysOverdue} days past due</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const cust = customers.find((c) => c.company === inv.customerName || c.id === inv.customerId);
                        if (cust) {
                          setSelectedCustomerForDetail(cust);
                        } else {
                          setSelectedInvoiceForDetail(inv);
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No high-priority overdue alerts today.
                </div>
              )}
            </div>
          </div>

          {/* Follow-ups Due Today Card */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="card-title" style={{ fontSize: '0.9375rem' }}>
                  <Clock size={16} style={{ color: 'var(--primary)' }} />
                  <span>Follow-ups Due Today</span>
                </h2>
                <p className="card-subtitle">Scheduled customer reminder actions</p>
              </div>

              <button
                onClick={() => navigate('/follow-ups')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                View all
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {followUpsDueToday.map((flw) => (
                <div
                  key={flw.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 12,
                    backgroundColor: '#FAFAFA'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {flw.customerName}
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {formatINR(flw.amountDue)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                    <span>Inv: {flw.invoiceNumber}</span>
                    <span>•</span>
                    <span>Via {flw.channel}</span>
                    <span>•</span>
                    <span>Last contact: {formatDate(flw.lastContactDate || '2026-10-18')}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedFollowUpForMessage(flw)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.75rem' }}
                    >
                      <Eye size={13} />
                      <span>Preview Message</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFollowUpForMessage(flw)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.75rem' }}
                    >
                      <Send size={13} />
                      <span>Review & Send</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Invoice Detail Modal */}
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
        onDraftReminder={() => {
          const matchingFollowUp = followUps.find((f) => f.invoiceNumber === selectedInvoiceForDetail.invoiceNumber);
          if (matchingFollowUp) {
            setSelectedFollowUpForMessage(matchingFollowUp);
          } else {
            navigate('/ai-assistant');
          }
          setSelectedInvoiceForDetail(null);
        }}
      />

      {/* 2. Edit Invoice Modal */}
      <InvoiceFormModal
        isOpen={!!selectedInvoiceForEdit}
        onClose={() => setSelectedInvoiceForEdit(null)}
        invoiceToEdit={selectedInvoiceForEdit}
      />

      {/* 3. Record Payment Modal */}
      <PaymentModal
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        invoice={selectedInvoiceForPayment}
      />

      {/* 4. Delete Invoice Confirmation */}
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
        message={`Are you sure you want to delete invoice ${invoiceToDelete?.invoiceNumber} for ${invoiceToDelete?.customerName}? This will permanently remove the invoice from records.`}
        confirmText="Delete Invoice"
        isDanger={true}
      />

      {/* 5. Preview & Send Message Modal */}
      <MessagePreviewModal
        isOpen={!!selectedFollowUpForMessage}
        onClose={() => setSelectedFollowUpForMessage(null)}
        followUp={selectedFollowUpForMessage}
        invoice={invoices.find((i) => i.invoiceNumber === selectedFollowUpForMessage?.invoiceNumber)}
      />

      {/* 6. Customer Detail Modal from Alert */}
      <CustomerDetailModal
        isOpen={!!selectedCustomerForDetail}
        onClose={() => setSelectedCustomerForDetail(null)}
        customer={selectedCustomerForDetail}
      />
    </div>
  );
}
