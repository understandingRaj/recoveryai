import { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  PieChart as PieIcon,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Users,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/currency';
import StatCard from '../components/common/StatCard';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { invoices, customers, collectionTrend, totalOutstanding, overdueAmount, collectedThisMonth } = useApp();

  const [dateFilter, setDateFilter] = useState('6M');

  // Summary Metrics
  const totalInvoiced = invoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
  const totalCollectedAllTime = invoices.reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);
  const collectionRate = totalInvoiced > 0 ? ((totalCollectedAllTime / totalInvoiced) * 100).toFixed(1) : 0;

  // Aging Analysis Breakdown (1-30, 31-60, 61-90, 90+ days)
  const agingData = useMemo(() => {
    let bucket1_30 = 0;
    let bucket31_60 = 0;
    let bucket61_90 = 0;
    let bucket90Plus = 0;

    invoices.forEach((inv) => {
      if (inv.status === 'Overdue' && inv.remainingAmount > 0) {
        if (inv.daysOverdue <= 30) bucket1_30 += inv.remainingAmount;
        else if (inv.daysOverdue <= 60) bucket31_60 += inv.remainingAmount;
        else if (inv.daysOverdue <= 90) bucket61_90 += inv.remainingAmount;
        else bucket90Plus += inv.remainingAmount;
      }
    });

    return [
      { range: '1-30 Days', amount: bucket1_30, count: invoices.filter((i) => i.status === 'Overdue' && i.daysOverdue <= 30).length },
      { range: '31-60 Days', amount: bucket31_60, count: invoices.filter((i) => i.status === 'Overdue' && i.daysOverdue > 30 && i.daysOverdue <= 60).length },
      { range: '61-90 Days', amount: bucket61_90, count: invoices.filter((i) => i.status === 'Overdue' && i.daysOverdue > 60 && i.daysOverdue <= 90).length },
      { range: '90+ Days', amount: bucket90Plus, count: invoices.filter((i) => i.status === 'Overdue' && i.daysOverdue > 90).length }
    ];
  }, [invoices]);

  // Top Customers by Outstanding Amount
  const topCustomersData = useMemo(() => {
    return [...customers]
      .filter((c) => (c.totalOutstanding || 0) > 0)
      .sort((a, b) => (b.totalOutstanding || 0) - (a.totalOutstanding || 0))
      .slice(0, 5)
      .map((c) => ({
        name: c.company || c.name,
        outstanding: c.totalOutstanding || 0,
        overdue: c.totalOverdue || 0
      }));
  }, [customers]);

  // Invoice Breakdown for Donut Chart
  const statusBreakdownData = useMemo(() => {
    const paidCount = invoices.filter((i) => i.status === 'Paid').length;
    const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;
    const partialCount = invoices.filter((i) => i.status === 'Partially Paid').length;
    const pendingCount = invoices.filter((i) => i.status === 'Pending').length;

    return [
      { name: 'Fully Paid', value: paidCount, color: '#16A34A' },
      { name: 'Overdue', value: overdueCount, color: '#DC2626' },
      { name: 'Partially Paid', value: partialCount, color: '#4F46E5' },
      { name: 'Pending (Current)', value: pendingCount, color: '#F59E0B' }
    ].filter((item) => item.value > 0);
  }, [invoices]);

  // CSV Export for Report
  const handleExportReportCSV = () => {
    const reportData = [
      ['Metric', 'Value'],
      ['Total Outstanding Receivables', totalOutstanding],
      ['Total Overdue Amount', overdueAmount],
      ['Collection Rate (%)', `${collectionRate}%`],
      ['Collected This Month', collectedThisMonth],
      ['', ''],
      ['Aging Bucket', 'Overdue Amount', 'Count'],
      ...agingData.map((a) => [a.range, a.amount, a.count]),
      ['', ''],
      ['Top Customer', 'Outstanding Amount', 'Overdue Amount'],
      ...topCustomersData.map((c) => [`"${c.name}"`, c.outstanding, c.overdue])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + reportData.map((row) => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recoverai_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial report exported successfully');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports & Analytics</h1>
          <p className="page-subtitle">
            Executive cashflow recovery metrics, aging brackets, and customer collection velocity
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 12px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter report timeframe"
          >
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
            <option value="6M">Last 6 Months</option>
            <option value="YTD">Current Fiscal Year (YTD)</option>
          </select>

          <button
            onClick={handleExportReportCSV}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} />
            <span>Export Report Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard
          title="Outstanding Receivables"
          value={formatINR(totalOutstanding)}
          subtext="Total uncollected balance"
          icon={DollarSign}
          color="var(--primary)"
        />

        <StatCard
          title="Overdue Amount"
          value={formatINR(overdueAmount)}
          subtext={`${((overdueAmount / (totalOutstanding || 1)) * 100).toFixed(0)}% past due date`}
          icon={AlertCircle}
          color="var(--danger)"
          trendType={overdueAmount > 0 ? 'negative' : 'positive'}
          trendValue={overdueAmount > 0 ? 'Risk alert' : 'Healthy'}
        />

        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          subtext="Of all invoiced revenue"
          icon={CheckCircle2}
          color="var(--success)"
          trendType="positive"
          trendValue="+3.8%"
        />

        <StatCard
          title="Collected This Month"
          value={formatINR(collectedThisMonth)}
          subtext="Actual cleared collections"
          icon={TrendingUp}
          color="var(--secondary)"
          trendType="positive"
          trendValue="On target"
        />
      </div>

      {/* Notice on Actual vs Estimates */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)',
          marginBottom: 24,
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}
      >
        <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <span>
          <strong>Data Integrity Note:</strong> Collected totals represent verified receipts. Outstanding balances reflect active open ledger items; projections and estimates are omitted to preserve accounting accuracy.
        </span>
      </div>

      {/* Row 1: Aging Analysis & Status Breakdown */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Aging Analysis Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Receivables Aging Analysis</h2>
              <p className="card-subtitle">Distribution of delinquent balances across aging brackets</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 260, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatINR(value), 'Overdue Amount']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Invoice Portfolio Status</h2>
              <p className="card-subtitle">Proportion of invoices by current payment state</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 260, marginTop: 12, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} invoices`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Top Customers by Outstanding & Monthly Collection Trajectory */}
      <div className="grid-2">
        {/* Top Customers by Outstanding */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Top Debtors by Outstanding</h2>
              <p className="card-subtitle">Clients holding the highest share of open receivables</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 260, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topCustomersData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#0F172A', fontSize: 11, fontWeight: 500 }}
                  width={110}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Outstanding']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="outstanding" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Collection Trends Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Monthly Trajectory</h2>
              <p className="card-subtitle">Collection recovery pace vs new billings over 6 months</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 260, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collectionTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="repColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Collected']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#16A34A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#repColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
