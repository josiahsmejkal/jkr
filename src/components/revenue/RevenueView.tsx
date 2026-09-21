import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Share2,
  Printer,
  FileCheck,
  Eye,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
} from 'lucide-react';
import { Invoice, Payment, BusinessSettings, PaymentMethod } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface RevenueViewProps {
  invoices: Invoice[];
  payments: Payment[];
  settings: BusinessSettings | null;
  onMarkInvoicePaid: (invoiceId: string, paymentMethod?: PaymentMethod) => Promise<void>;
  onViewInvoice: (invoice: Invoice) => void;
  onViewReceipt: (payment: Payment, invoice?: Invoice) => void;
  onRecordCustomPayment: (invoice: Invoice) => void;
}

export const RevenueView: React.FC<RevenueViewProps> = ({
  invoices,
  payments,
  settings,
  onMarkInvoicePaid,
  onViewInvoice,
  onViewReceipt,
  onRecordCustomPayment,
}) => {
  const [activeTab, setActiveTab] = useState<'BALANCE_DUE' | 'SETTLED'>('BALANCE_DUE');
  const [searchTerm, setSearchTerm] = useState('');
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const symbol = settings?.currencySymbol || '₹';

  // Balance Due (Invoices with balance > 0)
  const pendingInvoices = invoices.filter((i) => i.balanceAmount > 0);
  const totalBalanceDue = pendingInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);

  // Settled (Fully paid invoices or individual payments)
  const settledInvoices = invoices.filter((i) => i.status === 'PAID');
  const totalSettledAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  // Filtered lists
  const filteredPending = pendingInvoices.filter(
    (inv) =>
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(searchTerm))
  );

  const filteredSettled = settledInvoices.filter(
    (inv) =>
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkPaidClick = async (invoice: Invoice) => {
    try {
      setIsProcessing(true);
      await onMarkInvoicePaid(invoice.id, selectedMethod);
      setPayingInvoiceId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to mark as paid');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendWhatsAppReminder = (inv: Invoice) => {
    const text =
      `*Payment Reminder from ${settings?.businessName || 'Business Ledger'}*\n` +
      `Dear ${inv.customerName},\n` +
      `This is a gentle reminder regarding Bill *${inv.invoiceNumber}* dated ${formatDate(inv.date)}.\n` +
      `*Total Bill:* ${symbol}${inv.grandTotal}\n` +
      `*Amount Paid:* ${symbol}${inv.paidAmount}\n` +
      `*Balance Due Amount (வர வேண்டிய தொகை):* ${symbol}${inv.balanceAmount}\n\n` +
      (settings?.upiId ? `*UPI ID:* ${settings.upiId}\n` : '') +
      (settings?.bankName ? `*Bank:* ${settings.bankName} | *A/C:* ${settings.accountNumber} | *IFSC:* ${settings.ifscCode}\n` : '') +
      `Kindly arrange for the balance settlement at your earliest convenience. Thank you!`;

    const phoneClean = (inv.customerPhone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean ? (phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`) : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Revenue Management (வருமானம்)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track receivables (Balance Due Amount), collect payments with 1-click 'Paid', and view Settled revenue
          </p>
        </div>
      </div>

      {/* 2 Big Core Revenue Cards: Balance Due vs Settled */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Balance Due Amount */}
        <div
          onClick={() => setActiveTab('BALANCE_DUE')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'BALANCE_DUE'
              ? 'bg-amber-500/10 border-amber-500/40 dark:border-amber-500/50 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Balance Due Amount
                </span>
                <span className="text-[11px] text-slate-500 block">நமக்கு வர வேண்டிய தொகை</span>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
              {pendingInvoices.length} Bills Pending
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black font-numeric text-amber-600 dark:text-amber-400">
              {formatCurrency(totalBalanceDue, symbol)}
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Click to view pending bills →
            </span>
          </div>
        </div>

        {/* Card 2: Settled Amount */}
        <div
          onClick={() => setActiveTab('SETTLED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'SETTLED'
              ? 'bg-emerald-500/10 border-emerald-500/40 dark:border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Settled Amount
                </span>
                <span className="text-[11px] text-slate-500 block">பெறப்பட்ட / வசூலான தொகை</span>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              {settledInvoices.length} Bills Settled
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black font-numeric text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalSettledAmount, symbol)}
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Click to view settled records →
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BALANCE_DUE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'BALANCE_DUE'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            1. Balance Due Amount ({pendingInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('SETTLED')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SETTLED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            2. Settled Amount ({settledInvoices.length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, bill no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
        </div>
      </div>

      {/* SECTION 1: BALANCE DUE AMOUNT LIST */}
      {activeTab === 'BALANCE_DUE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Pending Bills Awaiting Payment (வர வேண்டிய தொகை பட்டியல்)
            </h3>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Click 'Paid' to settle invoice and move it directly to Settled
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {filteredPending.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  All Bills Are Settled!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Balance Due Amount is {formatCurrency(0, symbol)}. No pending receivables.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Bill No & Date</th>
                      <th className="py-3 px-4">Materials</th>
                      <th className="py-3 px-4 text-right">Total Bill</th>
                      <th className="py-3 px-4 text-right">Already Paid</th>
                      <th className="py-3 px-4 text-right text-amber-600 font-bold">
                        Balance Due (வர வேண்டியது)
                      </th>
                      <th className="py-3 px-4 text-center">Payment Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPending.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {inv.customerName}
                          </div>
                          {inv.customerPhone && (
                            <div className="text-[11px] text-slate-400">{inv.customerPhone}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {inv.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-slate-500">{formatDate(inv.date)}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <span className="text-slate-600 dark:text-slate-300 truncate block">
                            {inv.items.map((i) => `${i.name} (${i.quantity} ${i.unit || 'Loads'})`).join(', ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-numeric font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(inv.grandTotal, symbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-numeric text-emerald-600 font-medium">
                          {formatCurrency(inv.paidAmount, symbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-numeric font-black text-rose-600 dark:text-rose-400 text-sm">
                          {formatCurrency(inv.balanceAmount, symbol)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {payingInvoiceId === inv.id ? (
                            <div className="flex items-center justify-center gap-1.5 p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-300 dark:border-emerald-700">
                              <select
                                value={selectedMethod}
                                onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                                className="text-[11px] font-semibold bg-white dark:bg-slate-900 px-1.5 py-1 rounded border border-slate-300 dark:border-slate-700"
                              >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                              </select>
                              <button
                                onClick={() => handleMarkPaidClick(inv)}
                                disabled={isProcessing}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer disabled:opacity-50"
                              >
                                {isProcessing ? 'Saving...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setPayingInvoiceId(null)}
                                className="px-1.5 py-1 text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Primary Paid Button */}
                              <button
                                onClick={() => {
                                  setPayingInvoiceId(inv.id);
                                  setSelectedMethod('Cash');
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                                title="Click when customer pays full balance"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Paid (செலுத்தப்பட்டது)</span>
                              </button>

                              {/* WhatsApp Reminder Button */}
                              <button
                                onClick={() => handleSendWhatsAppReminder(inv)}
                                className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                                title="Send WhatsApp Reminder"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* View Bill Button */}
                              <button
                                onClick={() => onViewInvoice(inv)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                                title="View Bill"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
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

      {/* SECTION 2: SETTLED AMOUNT LIST */}
      {activeTab === 'SETTLED' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Settled Revenue Records (பெறப்பட்ட தொகை மற்றும் ரசீதுகள்)
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Total Settled: {formatCurrency(totalSettledAmount, symbol)}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {filteredSettled.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No settled bills match your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Bill No</th>
                      <th className="py-3 px-4">Settled Date</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-right text-emerald-600 font-bold">
                        Settled Amount
                      </th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Receipt & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSettled.map((inv) => {
                      const linkedPayment = payments.find((p) => p.invoiceId === inv.id);
                      return (
                        <tr
                          key={inv.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                            {inv.customerName}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {formatDate(inv.updatedAt || inv.date)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-numeric text-slate-600">
                            {formatCurrency(inv.grandTotal, symbol)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-numeric font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {formatCurrency(inv.grandTotal, symbol)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" /> SETTLED
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {linkedPayment && (
                                <button
                                  onClick={() => onViewReceipt(linkedPayment, inv)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                                >
                                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Receipt</span>
                                </button>
                              )}
                              <button
                                onClick={() => onViewInvoice(inv)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="View Bill"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
