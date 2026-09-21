import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Clock,
  Trash2,
  Tag,
  Repeat,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import { Expense, RecurringExpense, BusinessSettings } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface ExpensesViewProps {
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  settings: BusinessSettings | null;
  onAddExpense: () => void;
  onAddRecurring: () => void;
  onDeleteExpense: (expenseId: string) => void;
  onDeleteRecurring: (recurringId: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  recurringExpenses,
  settings,
  onAddExpense,
  onAddRecurring,
  onDeleteExpense,
  onDeleteRecurring,
}) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'RECURRING' | 'CALENDAR'>('LOGS');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const symbol = settings?.currencySymbol || '₹';

  const categories = [
    'ALL',
    'Rent',
    'Utilities',
    'Salaries',
    'Inventory',
    'Marketing',
    'Office Supplies',
    'Maintenance',
    'Software',
    'Transport',
    'Other',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalExpenseFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calendar Day Aggregation
  const daysInMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 0);
    const numDays = date.getDate();
    const days = [];
    for (let i = 1; i <= numDays; i++) {
      const dayStr = `${selectedMonth}-${String(i).padStart(2, '0')}`;
      const dayExpenses = expenses.filter((e) => e.date === dayStr);
      const total = dayExpenses.reduce((s, e) => s + e.amount, 0);
      days.push({ dayStr, dayNumber: i, count: dayExpenses.length, total });
    }
    return days;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Expense Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Categorized daily expenses, recurring operating subscriptions, and calendar tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddRecurring}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Repeat className="w-3.5 h-3.5 text-blue-500" />
            <span>+ Recurring Bill</span>
          </button>
          <button
            onClick={onAddExpense}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'LOGS'
                ? 'border-b-2 border-rose-500 text-rose-600 dark:text-rose-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Daily Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'CALENDAR'
                ? 'border-b-2 border-rose-500 text-rose-600 dark:text-rose-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Expense Calendar
          </button>
          <button
            onClick={() => setActiveTab('RECURRING')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'RECURRING'
                ? 'border-b-2 border-rose-500 text-rose-600 dark:text-rose-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Recurring Bills ({recurringExpenses.length})
          </button>
        </div>

        <div className="text-xs font-numeric font-bold text-rose-600 dark:text-rose-400 pb-2">
          Total: {formatCurrency(totalExpenseFiltered, symbol)}
        </div>
      </div>

      {/* TAB 1: DAILY EXPENSES LIST */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-slate-900 dark:bg-rose-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No expenses found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Log your business operational costs, software licenses, rent, and vendor bills.
                </p>
                <button
                  onClick={onAddExpense}
                  className="mt-4 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  + Add First Expense
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Title / Expense</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Vendor / Payee</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredExpenses.map((exp) => (
                      <tr
                        key={exp.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {formatDate(exp.date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>{exp.title}</span>
                            {exp.isRecurring && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600">
                                Recurring
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <div className="text-[11px] text-slate-400">{exp.description}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {exp.vendor || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{exp.paymentMethod}</td>
                        <td className="py-3.5 px-4 text-right font-numeric font-black text-rose-600 dark:text-rose-400">
                          {formatCurrency(exp.amount, symbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete expense "${exp.title}"? This will update net profit.`)) {
                                onDeleteExpense(exp.id);
                              }
                            }}
                            title="Delete Expense"
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CALENDAR VIEW */}
      {activeTab === 'CALENDAR' && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Expense Calendar</h3>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {daysInMonth().map((d) => (
              <div
                key={d.dayStr}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  d.total > 0
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 opacity-70'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500">Day {d.dayNumber}</div>
                {d.total > 0 ? (
                  <div className="mt-2">
                    <div className="text-xs font-black font-numeric text-rose-600 dark:text-rose-400">
                      {formatCurrency(d.total, symbol)}
                    </div>
                    <div className="text-[10px] text-slate-400">{d.count} expense(s)</div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 mt-2">No expenses</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RECURRING EXPENSES */}
      {activeTab === 'RECURRING' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {recurringExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <Repeat className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No recurring expenses set</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Automate monthly office rent, software subscriptions, or electricity bills.
              </p>
              <button
                onClick={onAddRecurring}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                + Setup Recurring Expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Next Due Date</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recurringExpenses.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{rec.title}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {rec.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-semibold">{rec.frequency}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{formatDate(rec.nextDueDate)}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{rec.vendor || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-numeric font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(rec.amount, symbol)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete recurring schedule for "${rec.title}"?`)) {
                              onDeleteRecurring(rec.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
