import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  useMerchantStats,
  useDailyRevenue,
  useTopCustomers,
  useChainUsage,
  useCurrencyBreakdown
} from '../hooks/useAnalytics';
import {
  LineChart,
  Line,
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
import { Download, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState(30);
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>();

  const { data: stats, loading: statsLoading } = useMerchantStats();
  const { data: dailyRevenue, loading: revenueLoading } = useDailyRevenue(timeRange, selectedCurrency);
  const { data: topCustomers, loading: customersLoading } = useTopCustomers(selectedCurrency);
  const { data: chainUsage, loading: chainLoading } = useChainUsage();
  const { data: currencyBreakdown, loading: currencyLoading } = useCurrencyBreakdown();

  // Ensure data is always an array
  const safeChainUsage = Array.isArray(chainUsage) ? chainUsage : [];
  const safeCurrencyBreakdown = Array.isArray(currencyBreakdown) ? currencyBreakdown : [];
  const safeDailyRevenue = Array.isArray(dailyRevenue) ? dailyRevenue : [];
  const safeTopCustomers = Array.isArray(topCustomers) ? topCustomers : [];

  const exportToCSV = () => {
    if (!safeDailyRevenue || safeDailyRevenue.length === 0) return;

    const headers = ['Date', 'Currency', 'Transactions', 'Total Amount', 'Avg Amount'];
    const rows = safeDailyRevenue.map(row => [
      row.date,
      row.currency,
      row.transaction_count,
      row.total_amount,
      row.avg_amount,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your business performance and insights
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 border border-border rounded-lg bg-background"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>

        <select
          value={selectedCurrency || ''}
          onChange={(e) => setSelectedCurrency(e.target.value || undefined)}
          className="px-4 py-2 border border-border rounded-lg bg-background"
        >
          <option value="">All Currencies</option>
          <option value="USDC">USDC</option>
          <option value="USDT">USDT</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">
                ${stats?.total_revenue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            ${stats?.revenue_last_30_days?.toLocaleString() || '0'} last 30 days
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="text-2xl font-bold mt-1">
                {stats?.successful_payments?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {stats?.payments_last_30_days || '0'} last 30 days
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unique Customers</p>
              <p className="text-2xl font-bold mt-1">
                {stats?.unique_customers?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Payouts</p>
              <p className="text-2xl font-bold mt-1">
                ${stats?.total_payout_amount?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {stats?.completed_payouts || '0'} completed
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
        {revenueLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={safeDailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_amount" stroke="#3b82f6" name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chain Usage & Currency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain Usage */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Chain Usage</h2>
          {chainLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={safeChainUsage}
                  dataKey="payment_count"
                  nameKey="chain"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {safeChainUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Currency Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Currency Breakdown</h2>
          {currencyLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeCurrencyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="currency" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_volume" fill="#3b82f6" name="Total Volume" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Top Customers</h2>
        {customersLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Currency</th>
                  <th className="text-right py-3 px-4">Payments</th>
                  <th className="text-right py-3 px-4">Total Spent</th>
                  <th className="text-right py-3 px-4">Avg Payment</th>
                  <th className="text-left py-3 px-4">Last Payment</th>
                </tr>
              </thead>
              <tbody>
                {safeTopCustomers.map((customer, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">{customer.customer_email}</td>
                    <td className="py-3 px-4">{customer.currency}</td>
                    <td className="text-right py-3 px-4">{customer.payment_count}</td>
                    <td className="text-right py-3 px-4">
                      ${customer.total_spent.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      ${customer.avg_payment.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(customer.last_payment_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {safeTopCustomers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No customer data available yet
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}


