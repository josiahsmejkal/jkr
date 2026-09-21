import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Menu,
  Plus,
  Receipt,
  CreditCard,
  TrendingUp,
  BarChart3,
  BellRing,
  Settings,
  X,
} from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenQuickActions: () => void;
  unpaidCount: number;
  overdueCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  setCurrentView,
  onOpenQuickActions,
  unpaidCount,
  overdueCount,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const moreItems = [
    { id: 'revenue', label: 'Revenue (வருமானம்)', icon: CreditCard, badge: unpaidCount },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'finance', label: 'Finance & Profit', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'reminders', label: 'Reminders', icon: BellRing, badge: overdueCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* "More" Bottom Sheet Drawer */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex flex-col justify-end md:hidden"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-2xl p-5 border-t border-slate-200 dark:border-slate-800 space-y-3 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">All Modules</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2"
      >
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
            currentView === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setCurrentView('bills')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 ${
            currentView === 'bills'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px]">Bills</span>
          {unpaidCount > 0 && (
            <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Center '+' floating action button */}
        <div className="flex-1 flex justify-center -translate-y-3">
          <button
            id="mobile-plus-action-btn"
            onClick={onOpenQuickActions}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform cursor-pointer"
            title="Create new transaction"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={() => setCurrentView('customers')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
            currentView === 'customers'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Customers</span>
        </button>

        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
            showMoreMenu || ['revenue', 'payments', 'expenses', 'finance', 'reports', 'reminders', 'settings'].includes(currentView)
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>
    </>
  );
};
