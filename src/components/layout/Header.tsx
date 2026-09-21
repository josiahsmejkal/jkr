import React from 'react';
import { Search, Bell, Sun, Moon, Plus, Sparkles } from 'lucide-react';
import { BusinessSettings, NotificationItem } from '../../types/index.ts';

interface HeaderProps {
  currentView: string;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onQuickAction: () => void;
  settings: BusinessSettings | null;
}

const VIEW_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Business Dashboard', subtitle: 'Real-time financial status, sales, and profit' },
  bills: { title: 'Billing & Invoices', subtitle: 'Manage invoices, drafts, and customer bill history' },
  customers: { title: 'Customer Ledger', subtitle: 'Client directory, financial balances, and transaction history' },
  payments: { title: 'Payment Management', subtitle: 'Track receipts, partial settlements, and payment modes' },
  expenses: { title: 'Expense Management', subtitle: 'Daily expenses, categories, and calendar logs' },
  finance: { title: 'Financial Analytics', subtitle: 'Sales, expenses, net profit, and revenue performance' },
  reports: { title: 'Business Reports', subtitle: 'Generate and export PDF/CSV statements' },
  reminders: { title: 'Payment Reminders', subtitle: 'Follow-ups, due invoices, and 1-click WhatsApp alerts' },
  receivables: { title: 'Outstanding Receivables', subtitle: 'Pending payments grouped by customer' },
  settings: { title: 'Business Settings', subtitle: 'Company profile, invoice templates, and system backups' },
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  isDark,
  setIsDark,
  notifications,
  onOpenNotifications,
  onOpenSearch,
  onQuickAction,
  settings,
}) => {
  const info = VIEW_TITLES[currentView] || { title: 'Business Ledger', subtitle: 'Financial Management' };
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      id="main-header"
      className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      {/* Title block */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shrink-0">
          BL
        </div>
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {info.title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
            {info.subtitle}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          id="header-search-btn"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search customers, bills...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action Button */}
        <button
          id="header-quick-action-btn"
          onClick={onQuickAction}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Action</span>
        </button>

        {/* Notification Bell */}
        <button
          id="header-notifications-btn"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Dark/Light mode toggle */}
        <button
          id="header-theme-toggle-btn"
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
