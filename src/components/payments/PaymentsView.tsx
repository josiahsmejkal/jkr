import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Calendar,
  Building2,
  Printer,
  FileCheck,
} from 'lucide-react';
import { Payment, BusinessSettings, Invoice } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface PaymentsViewProps {
  payments: Payment[];
  settings: BusinessSettings | null;
  onRecordPayment: () => void;
  onViewReceipt?: (payment: Payment) => void;
  onDeletePayment: (paymentId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  settings,
  onRecordPayment,
  onViewReceipt,
  onDeletePayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const symbol = settings?.currencySymbol || '₹';

  const methods = ['ALL', 'Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'];

  const filtered = payments.filter((p) => {
    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    const matchesSearch =
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesMethod && matchesSearch;
  });

  const totalCollected = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Payment Receipts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track all incoming customer payments, settlement modes, and transaction references
          </p>
        </div>

        <button
          onClick={onRecordPayment}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Collected (Filter)</div>
          <div className="text-lg font-black font-numeric text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalCollected, symbol)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Receipts Issued</div>
          <div className="text-lg font-black font-numeric text-slate-900 dark:text-slate-100 mt-1">
            {filtered.length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Settlement Mode</div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
            Multi-mode (Cash, UPI, Bank Transfer)
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                methodFilter === m
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt, customer, invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No payment records found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Record a payment received from a customer to update their outstanding balance.
            </p>
            <button
              onClick={onRecordPayment}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              + Record Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Reference / Notes</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {pay.receiptNumber || pay.id.toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {formatDate(pay.date)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {pay.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {pay.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {pay.referenceNumber ? `Ref: ${pay.referenceNumber}` : pay.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(pay.amount, symbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onViewReceipt && (
                          <button
                            onClick={() => onViewReceipt(pay)}
                            title="View / Print Official Receipt"
                            className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete receipt ${pay.receiptNumber || pay.id}? This will revert the customer balance and invoice status.`)) {
                              onDeletePayment(pay.id);
                            }
                          }}
                          title="Delete Receipt"
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
