import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Receipt,
  TrendingUp,
  BarChart3,
  BellRing,
  Settings,
  Plus,
  ShieldCheck,
  Building2,
  DollarSign,
} from 'lucide-react';
import { BusinessSettings } from '../../types/index.ts';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  unpaidCount: number;
  overdueCount: number;
  settings: BusinessSettings | null;
  onOpenNewBill: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  unpaidCount,
  overdueCount,
  settings,
  onOpenNewBill,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bills', label: 'Bills', icon: FileText, badge: unpaidCount > 0 ? unpaidCount : undefined, badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    { id: 'revenue', label: 'Revenue (வருமானம்)', icon: DollarSign, badge: unpaidCount > 0 ? unpaidCount : undefined, badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'finance', label: 'Finance & Profit', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'reminders', label: 'Reminders', icon: BellRing, badge: overdueCount > 0 ? overdueCount : undefined, badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="main-sidebar"
      className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200 select-none shrink-0"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            <span className="text-xl tracking-tight font-black">BL</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
              BUSINESS LEDGER
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Billing • Expenses • Profit
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          id="sidebar-new-bill-btn"
          onClick={onOpenNewBill}
          className="mt-4 w-full py-2.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Bill</span>
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Business Card */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {settings?.businessName || 'Business Ledger'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                GST: {settings?.gstNumber || 'Unregistered'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
