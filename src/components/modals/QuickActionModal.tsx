import React from 'react';
import { X, FileText, Receipt, Users, CreditCard } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'NEW_BILL' | 'ADD_EXPENSE' | 'ADD_CUSTOMER' | 'RECEIVE_PAYMENT') => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'NEW_BILL' as const,
      title: 'New Bill',
      description: 'Create invoice, calculate taxes, link to customer',
      icon: FileText,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'RECEIVE_PAYMENT' as const,
      title: 'Receive Payment',
      description: 'Record cash, UPI, or bank transfer against invoice',
      icon: CreditCard,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      id: 'ADD_EXPENSE' as const,
      title: 'Add Expense',
      description: 'Log vendor costs, fuel, rent, software or office bills',
      icon: Receipt,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    },
    {
      id: 'ADD_CUSTOMER' as const,
      title: 'Add Customer',
      description: 'Register a new client contact and opening balance',
      icon: Users,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Quick Actions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose a financial action to record</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-all group cursor-pointer active:scale-[0.98]"
              >
                <div className={`p-2.5 rounded-lg border ${act.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    + {act.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    {act.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
