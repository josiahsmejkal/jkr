import React, { useState } from 'react';
import { X, Receipt, Tag, Zap } from 'lucide-react';
import { BusinessSettings, PaymentMethod } from '../../types/index.ts';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings | null;
  onSubmit: (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: PaymentMethod;
    vendor?: string;
    description?: string;
  }) => Promise<void>;
}

const QUICK_EXPENSE_PRESETS = [
  { title: 'டீசல் (Vehicle Diesel)', category: 'Transport', defaultAmount: 2500 },
  { title: 'டிரைவர் பேட்டா (Driver Beta)', category: 'Salaries', defaultAmount: 500 },
  { title: 'டீ செலவு (Tea & Snacks)', category: 'Other', defaultAmount: 150 },
  { title: 'லோடு கூலி (Loading & Unloading)', category: 'Salaries', defaultAmount: 1200 },
  { title: 'வண்டி சர்வீஸ் (Vehicle Maintenance)', category: 'Maintenance', defaultAmount: 1800 },
  { title: 'கடை வாடகை (Shop/Yard Rent)', category: 'Rent', defaultAmount: 15000 },
  { title: 'கரண்ட் பில் (Electricity Bill)', category: 'Utilities', defaultAmount: 3200 },
  { title: 'மெட்டீரியல் பர்சேஸ் (Raw Material)', category: 'Inventory', defaultAmount: 20000 },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const symbol = settings?.currencySymbol || '₹';
  const today = new Date().toISOString().split('T')[0];

  const categories = [
    'Transport',
    'Salaries',
    'Rent',
    'Utilities',
    'Inventory',
    'Maintenance',
    'Office Supplies',
    'Marketing',
    'Software',
    'Other',
  ];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [category, setCategory] = useState('Transport');
  const [date, setDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (preset: typeof QUICK_EXPENSE_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    if (!amount || Number(amount) === 0) {
      setAmount(preset.defaultAmount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const numAmount = Number(amount);
    if (numAmount <= 0 || isNaN(numAmount)) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        amount: numAmount,
        category,
        date,
        paymentMethod,
        vendor: vendor.trim() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log expense');
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
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Log Expense (செலவு பதிவு)
              </h3>
              <p className="text-[11px] text-slate-500">
                Track diesel, driver allowance, tea, loading wages, and operational costs
              </p>
            </div>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Preset Chips */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Quick Select Expense (விரைவு தேர்வு)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_EXPENSE_PRESETS.map((pr) => (
                <button
                  type="button"
                  key={pr.title}
                  onClick={() => applyPreset(pr)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    title === pr.title
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                  }`}
                >
                  {pr.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expense Title (செலவு விவரம்) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Diesel for Lorry TN-76-9021, Driver Allowance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-rose-500"
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
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-base font-numeric font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expense Date (தேதி) *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
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
                Paid Via (பணம் செலுத்திய முறை)
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="Cash">Cash (ரொக்கம்)</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Paid To / Vendor / Person (யாருக்கு கொடுத்தது)
            </label>
            <input
              type="text"
              placeholder="e.g. Bharat Petroleum, Murugan Driver, Tea Stall"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Remarks (குறிப்பு)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 50 liters diesel for Tenkasi trip"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
