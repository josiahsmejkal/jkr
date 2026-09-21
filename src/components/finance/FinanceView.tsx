import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { DashboardMetrics, BusinessSettings } from '../../types/index.ts';
import { formatCurrency } from '../../lib/api.ts';

interface FinanceViewProps {
  metrics: DashboardMetrics;
  settings: BusinessSettings | null;
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];

export const FinanceView: React.FC<FinanceViewProps> = ({ metrics, settings }) => {
  const symbol = settings?.currencySymbol || '₹';
  const [periodFilter, setPeriodFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH'>('ALL');

  const profitMargin =
    metrics.amountReceived > 0
      ? Math.round(((metrics.amountReceived - metrics.expenses) / metrics.amountReceived) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial & Profit Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time cashflow intelligence, profit margins, and expense category distributions
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setPeriodFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              periodFilter === 'ALL' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setPeriodFilter('THIS_MONTH')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              periodFilter === 'THIS_MONTH' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Net Profit Calculation Formula Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-500/30">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
          Net Profit Calculation Formula (லாபக் கணக்கீடு வாய்பாடு)
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px] block">Total Revenue (வாங்குன பணம்):</span>
            <span className="font-numeric font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(metrics.amountReceived, symbol)}
            </span>
          </div>
          <span className="text-xl font-bold text-slate-400">−</span>
          <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px] block">Total Expense (மொத்த செலவு):</span>
            <span className="font-numeric font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(metrics.expenses, symbol)}
            </span>
          </div>
          <span className="text-xl font-bold text-slate-400">=</span>
          <div className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm">
            <span className="text-emerald-100 text-[11px] block">Net Profit (நிகர லாபம்):</span>
            <span className="font-numeric font-black text-base">
              {formatCurrency(metrics.netProfit, symbol)}
            </span>
          </div>
          <div className="ml-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px] block">Profit Margin:</span>
            <span className="font-numeric font-black text-emerald-600 dark:text-emerald-400">
              {profitMargin}%
            </span>
          </div>
        </div>
      </div>

      {/* 4 Big Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales (Invoiced)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-numeric text-slate-900 dark:text-slate-100 mt-2">
            {formatCurrency(metrics.totalBilled, symbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cumulative invoices billed</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cash Collected</span>
            <CreditCard className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black font-numeric text-teal-600 dark:text-teal-400 mt-2">
            {formatCurrency(metrics.amountReceived, symbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Settled payments received</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-numeric text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(metrics.expenses, symbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total operating burn</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Realized Profit</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-numeric text-emerald-700 dark:text-emerald-400 mt-2">
            {formatCurrency(metrics.netProfit, symbol)}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Profit Margin: {profitMargin}%
          </div>
        </div>
      </div>

      {/* Main Charts: Revenue vs Expenses vs Net Profit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Bar Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Revenue & Burn</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cash intake vs operating costs</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.revenueVsExpenseChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), symbol), '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Profit Trajectory Line Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Net Profit Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Month-over-month bottom line</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.revenueVsExpenseChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), symbol), 'Profit']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Pie Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Expenses by Category</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Proportional budget breakdown</p>
          </div>

          <div className="h-56 w-full mt-2">
            {metrics.expenseCategoryChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.expenseCategoryChart}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {metrics.expenseCategoryChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val), symbol), '']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category List with Proportions */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Expense Breakdown List</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Where business capital is deployed</p>
          </div>

          <div className="mt-4 space-y-3">
            {metrics.expenseCategoryChart.map((cat, idx) => {
              const pct = metrics.expenses > 0 ? Math.round((cat.amount / metrics.expenses) * 100) : 0;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-numeric font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(cat.amount, symbol)}
                      </span>
                      <span className="text-slate-400 font-numeric w-9 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
