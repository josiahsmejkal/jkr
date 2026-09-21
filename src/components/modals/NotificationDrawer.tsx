import React from 'react';
import { X, Bell, Check, Trash2, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { NotificationItem } from '../../types/index.ts';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1"
                title="Clear all notifications"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No recent notifications
            </div>
          ) : (
            notifications.map((n) => {
              const Icon =
                n.type === 'PAYMENT_OVERDUE'
                  ? AlertCircle
                  : n.type === 'BILL_CREATED'
                  ? TrendingUp
                  : Info;
              const color =
                n.type === 'PAYMENT_OVERDUE'
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    n.read
                      ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 opacity-70'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg ${color} shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {n.message}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : n.date}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
