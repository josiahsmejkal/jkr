import React, { useState } from 'react';
import {
  BellRing,
  AlertCircle,
  Share2,
  Mail,
  CreditCard,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';
import { Reminder, BusinessSettings, Invoice } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface RemindersViewProps {
  reminders: Reminder[];
  settings: BusinessSettings | null;
  onRecordPaymentForInvoice: (invoiceId: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  settings,
  onRecordPaymentForInvoice,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'UPCOMING'>('ALL');
  const symbol = settings?.currencySymbol || '₹';

  const filtered = reminders.filter((r) => {
    if (filter === 'OVERDUE') return r.status === 'OVERDUE';
    if (filter === 'UPCOMING') return r.status !== 'OVERDUE';
    return true;
  });

  const totalOutstanding = reminders.reduce((sum, r) => sum + r.amount, 0);
  const overdueTotal = reminders.filter((r) => r.status === 'OVERDUE').reduce((sum, r) => sum + r.amount, 0);

  const handleSendWhatsApp = (rem: Reminder) => {
    const text =
      `Dear ${rem.customerName},\n\n` +
      `This is a friendly payment reminder from ${settings?.businessName || 'Business Ledger'}.\n` +
      `Invoice Number: ${rem.invoiceNumber}\n` +
      `Due Date: ${formatDate(rem.dueDate)}\n` +
      `Outstanding Amount: ${symbol}${rem.amount}\n\n` +
      `Payment Details:\n` +
      `UPI ID: ${settings?.upiId || ''}\n` +
      `Bank: ${settings?.bankName || ''} | A/C: ${settings?.accountNumber || ''} | IFSC: ${settings?.ifscCode || ''}\n\n` +
      `Please let us know once transferred. Thank you for your continued business!`;

    const phoneClean = rem.customerPhone ? rem.customerPhone.replace(/[^0-9]/g, '') : '';
    const url = `https://wa.me/${phoneClean ? (phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`) : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = (rem: Reminder) => {
    const subject = `Payment Reminder: Invoice ${rem.invoiceNumber} from ${settings?.businessName || 'Business Ledger'}`;
    const body =
      `Dear ${rem.customerName},\n\n` +
      `Kindly note that invoice ${rem.invoiceNumber} for ${symbol}${rem.amount} was due on ${formatDate(rem.dueDate)}.\n\n` +
      `Bank: ${settings?.bankName || ''}\n` +
      `A/C: ${settings?.accountNumber || ''}\n` +
      `IFSC: ${settings?.ifscCode || ''}\n` +
      `UPI: ${settings?.upiId || ''}\n\n` +
      `Warm regards,\n${settings?.businessName || 'Business Ledger'}`;

    window.location.href = `mailto:${rem.customerEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Payment Reminders & Receivables
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Automated due date tracking and 1-click WhatsApp & Email payment reminders
        </p>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Pending Bills</div>
          <div className="text-lg font-black font-numeric text-slate-900 dark:text-slate-100 mt-1">
            {reminders.length} invoices
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">
            Overdue Amount
          </div>
          <div className="text-lg font-black font-numeric text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(overdueTotal, symbol)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
            Total Receivables Due
          </div>
          <div className="text-lg font-black font-numeric text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalOutstanding, symbol)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'ALL'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Pending ({reminders.length})
        </button>
        <button
          onClick={() => setFilter('OVERDUE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'OVERDUE'
              ? 'bg-slate-900 dark:bg-rose-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Overdue Only ({reminders.filter((r) => r.status === 'OVERDUE').length})
        </button>
        <button
          onClick={() => setFilter('UPCOMING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'UPCOMING'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Upcoming Due
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No overdue receivables!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All outstanding customer payments are currently within their payment terms.
            </p>
          </div>
        ) : (
          filtered.map((rem) => (
            <div
              key={rem.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {rem.customerName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rem.status === 'OVERDUE'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : rem.status === 'DUE_TODAY'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {rem.status === 'OVERDUE'
                      ? `⚠️ ${rem.daysOverdue} Days Overdue`
                      : rem.status === 'DUE_TODAY'
                      ? 'Due Today'
                      : 'Upcoming Due'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                  <span>Invoice: <strong className="font-mono text-slate-800 dark:text-slate-200">{rem.invoiceNumber}</strong></span>
                  <span>• Due Date: <strong>{formatDate(rem.dueDate)}</strong></span>
                  {rem.customerPhone && <span>• Tel: {rem.customerPhone}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400">Balance Pending</div>
                  <div className="text-base font-black font-numeric text-rose-600 dark:text-rose-400">
                    {formatCurrency(rem.amount, symbol)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendWhatsApp(rem)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95"
                    title="Send WhatsApp payment reminder"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {rem.customerEmail && (
                    <button
                      onClick={() => handleSendEmail(rem)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Send Email reminder"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onRecordPaymentForInvoice(rem.invoiceId)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white cursor-pointer"
                    title="Record payment now"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
