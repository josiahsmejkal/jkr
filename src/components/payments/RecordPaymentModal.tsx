import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { Invoice, BusinessSettings, PaymentMethod } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  settings: BusinessSettings | null;
  preselectedInvoiceId?: string;
  onSubmit: (data: {
    invoiceId: string;
    amount: number;
    date: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
  }) => Promise<void>;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoices,
  settings,
  preselectedInvoiceId,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const symbol = settings?.currencySymbol || '₹';
  const today = new Date().toISOString().split('T')[0];

  // Invoices with pending balance (plus preselected one if any)
  const eligibleInvoices = invoices.filter(
    (inv) => inv.balanceAmount > 0 || inv.id === preselectedInvoiceId
  );

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    preselectedInvoiceId || eligibleInvoices[0]?.id || ''
  );
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  // Auto-set amount when active invoice changes
  useEffect(() => {
    if (activeInvoice) {
      setAmount(activeInvoice.balanceAmount);
    }
  }, [selectedInvoiceId, activeInvoice?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) {
      setError('Please select an invoice');
      return;
    }

    const payVal = Number(amount) || 0;
    if (payVal <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    if (payVal > activeInvoice.balanceAmount) {
      setError(`Payment cannot exceed invoice pending balance of ${symbol}${activeInvoice.balanceAmount}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        invoiceId: activeInvoice.id,
        amount: payVal,
        date,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingAfterPayment = Math.max(0, (activeInvoice?.balanceAmount || 0) - (Number(amount) || 0));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Record Payment</h3>
              <p className="text-[11px] text-slate-500">Collect payment against an outstanding bill</p>
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
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Invoice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Invoice to Settle *
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
            >
              {eligibleInvoices.length === 0 ? (
                <option value="">No pending invoices available</option>
              ) : (
                eligibleInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.customerName} (Pending: {formatCurrency(inv.balanceAmount, symbol)})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Active Invoice Info Card */}
          {activeInvoice && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Total:</span>
                <span className="font-numeric font-semibold">{formatCurrency(activeInvoice.grandTotal, symbol)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="font-numeric text-emerald-600 font-semibold">{formatCurrency(activeInvoice.paidAmount, symbol)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="font-bold text-rose-600 dark:text-rose-400">Current Outstanding:</span>
                <span className="font-black font-numeric text-rose-600 dark:text-rose-400 text-sm">
                  {formatCurrency(activeInvoice.balanceAmount, symbol)}
                </span>
              </div>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount Received ({symbol}) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                max={activeInvoice?.balanceAmount || 9999999}
                step="any"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-numeric font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Date *
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

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reference / UTR / Cheque # (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. UPI-129384729"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Received full settlement, thanks"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>

          {/* Dynamic Settlement Preview */}
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
            <div className="flex justify-between text-emerald-800 dark:text-emerald-300">
              <span>Remaining balance after this:</span>
              <span className="font-numeric font-bold">{formatCurrency(remainingAfterPayment, symbol)}</span>
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Status will be: <span className="font-bold">{remainingAfterPayment === 0 ? 'PAID (Fully Settled)' : 'PARTIALLY_PAID'}</span>
            </div>
          </div>

          {/* Buttons */}
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
              disabled={isSubmitting || !activeInvoice}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
