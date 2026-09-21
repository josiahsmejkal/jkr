import React from 'react';
import {
  TrendingUp,
  Receipt,
  CreditCard,
  Clock,
  ArrowUpRight,
  Plus,
  ArrowRight,
  AlertCircle,
  FileText,
  Users,
  CheckCircle2,
  Calendar,
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
  AreaChart,
  Area,
} from 'recharts';
import { DashboardMetrics, BusinessSettings, Invoice, Payment } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  settings: BusinessSettings | null;
  onNavigate: (view: string) => void;
  onNewBill: () => void;
  onAddExpense: () => void;
  onAddCustomer: () => void;
  onReceivePayment: () => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  settings,
  onNavigate,
  onNewBill,
  onAddExpense,
  onAddCustomer,
  onReceivePayment,
  onViewInvoice,
}) => {
  const symbol = settings?.currencySymbol || '₹';

  const topCards = [
    {
      id: 'today-sales',
      label: "TODAY'S SALES",
      value: metrics.todaySales,
      icon: TrendingUp,
      accent: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      subtext: 'Billed today',
      action: () => onNavigate('bills'),
    },
    {
      id: 'amount-received',
      label: 'AMOUNT RECEIVED',
      value: metrics.amountReceived,
      icon: CreditCard,
      accent: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-800/60',
      subtext: 'Total collected revenue',
      action: () => onNavigate('payments'),
    },
    {
      id: 'expenses',
      label: 'EXPENSES',
      value: metrics.expenses,
      icon: Receipt,
      accent: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/60',
      subtext: 'Operating costs paid',
      action: () => onNavigate('expenses'),
    },
    {
      id: 'pending',
      label: 'PENDING',
      value: metrics.pendingBalance,
      icon: Clock,
      accent: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/60',
      subtext: 'Uncollected receivables',
      action: () => onNavigate('receivables'),
    },
    {
      id: 'net-profit',
      label: 'NET PROFIT',
      value: metrics.netProfit,
      icon: TrendingUp,
      accent: metrics.netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-200 dark:border-indigo-800/60',
      subtext: 'Received - Expenses',
      action: () => onNavigate('finance'),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 5 Top Financial Number Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {topCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.action}
              className={`p-4 rounded-xl border ${card.border} ${card.bg} transition-all duration-200 hover:shadow-md cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.accent}`} />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className={`text-2xl font-black font-numeric tracking-tight ${card.accent}`}>
                  {formatCurrency(card.value, symbol)}
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{card.subtext}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Row */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
          Quick Actions:
        </span>
        <button
          onClick={onNewBill}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Bill</span>
        </button>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-rose-500" />
          <span>Add Expense</span>
        </button>
        <button
          onClick={onAddCustomer}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-blue-500" />
          <span>Add Customer</span>
        </button>
        <button
          onClick={onReceivePayment}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-500" />
          <span>Receive Payment</span>
        </button>
      </div>

      {/* Visual Charts: Revenue vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue vs Expenses Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Revenue vs Expenses</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly cash flow and profit comparison</p>
            </div>
            <button
              onClick={() => onNavigate('finance')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.revenueVsExpenseChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${symbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value), symbol), '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Net Profit Trend Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Profit Trend</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Net profitability curve</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-numeric text-slate-900 dark:text-slate-100">
                {formatCurrency(metrics.netProfit, symbol)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Current financial period net</div>
            </div>
          </div>

          <div className="h-44 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueVsExpenseChart} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), symbol), 'Profit']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Recent Bills & Pending Payments / Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Bills</h3>
            </div>
            <button
              onClick={() => onNavigate('bills')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              View All Bills <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {metrics.recentBills.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onViewInvoice(inv)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : inv.status === 'PARTIALLY_PAID'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px]">
                    {inv.customerName}
                  </div>
                  <div className="text-[10px] text-slate-400">Date: {formatDate(inv.date)}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-numeric text-slate-900 dark:text-slate-100">
                    {formatCurrency(inv.grandTotal, symbol)}
                  </div>
                  {inv.balanceAmount > 0 && (
                    <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Due: {formatCurrency(inv.balanceAmount, symbol)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payment Due Dates & Overdue Alerts */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Pending Receivables & Due Dates</h3>
            </div>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              All Reminders <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {metrics.upcomingReminders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                All customer invoices are fully settled!
              </div>
            ) : (
              metrics.upcomingReminders.map((rem) => (
                <div key={rem.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{rem.customerName}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          rem.status === 'OVERDUE'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : rem.status === 'DUE_TODAY'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {rem.status === 'OVERDUE' ? `${rem.daysOverdue}d overdue` : rem.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Invoice: {rem.invoiceNumber} • Due: {formatDate(rem.dueDate)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-numeric text-rose-600 dark:text-rose-400">
                      {formatCurrency(rem.amount, symbol)}
                    </div>
                    <button
                      onClick={() => onNavigate('reminders')}
                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Remind
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid: Top Customers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Top Customers</h3>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              View Directory <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {metrics.topCustomers.map((cust, idx) => (
              <div
                key={cust.id}
                onClick={() => onNavigate('customers')}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{cust.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{cust.phone}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-numeric text-slate-900 dark:text-slate-100">
                    {formatCurrency(cust.totalBusiness, symbol)}
                  </div>
                  <div className="text-[10px] text-slate-400">{cust.billsCount} bills</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
            </div>
            <span className="text-[11px] text-slate-400">Live ledger events</span>
          </div>

          <div className="mt-3 space-y-2.5">
            {metrics.recentActivity.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{act.description}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
