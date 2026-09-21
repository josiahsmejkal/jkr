import React, { useState } from 'react';
import { X, Repeat } from 'lucide-react';
import { BusinessSettings, RecurringFrequency } from '../../types/index.ts';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings | null;
  onSubmit: (data: {
    title: string;
    amount: number;
    category: string;
    frequency: RecurringFrequency;
    startDate: string;
    nextDueDate: string;
    vendor?: string;
    notes?: string;
  }) => Promise<void>;
}

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const symbol = settings?.currencySymbol || '₹';
  const today = new Date().toISOString().split('T')[0];

  const categories = [
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

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Software');
  const [frequency, setFrequency] = useState<RecurringFrequency>('Monthly');
  const [startDate, setStartDate] = useState(today);
  const [nextDueDate, setNextDueDate] = useState(today);
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (Number(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        amount: Number(amount),
        category,
        frequency,
        startDate,
        nextDueDate,
        vendor: vendor.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to setup recurring expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Setup Recurring Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expense / Subscription Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Figma Pro License, Office Rent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({symbol}) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-numeric font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency *
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Due Date *
              </label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vendor / Provider (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Adobe Systems, Landlord"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Set Recurring Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
