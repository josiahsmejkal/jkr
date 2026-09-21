import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  CreditCard,
  Trash2,
  Share2,
  Printer,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Invoice, InvoiceStatus, BusinessSettings } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface BillsViewProps {
  invoices: Invoice[];
  settings: BusinessSettings | null;
  onNewBill: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onMarkInvoicePaid?: (invoiceId: string) => Promise<void>;
  onDeleteInvoice: (invoiceId: string) => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  invoices,
  settings,
  onNewBill,
  onViewInvoice,
  onRecordPayment,
  onMarkInvoicePaid,
  onDeleteInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const symbol = settings?.currencySymbol || '₹';

  const statuses: { label: string; value: string }[] = [
    { label: 'All Bills', value: 'ALL' },
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Overdue', value: 'OVERDUE' },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  // Calculate summary metrics for current view
  const totalBilled = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalReceived = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPending = filteredInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Bill CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Bills & Invoices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create professional GST/Non-GST invoices, record payments, and track receivables
          </p>
        </div>

        <button
          onClick={onNewBill}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Bill</span>
        </button>
      </div>

      {/* Mini Financial Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Billed</div>
          <div className="text-lg font-black font-numeric text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(totalBilled, symbol)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            Amount Received
          </div>
          <div className="text-lg font-black font-numeric text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalReceived, symbol)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">
            Pending Balance
          </div>
          <div className="text-lg font-black font-numeric text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalPending, symbol)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st.value
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No invoices found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Create a new bill to automatically link transactions to customers and update your profit reports.
            </p>
            <button
              onClick={onNewBill}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
            >
              + Create First Bill
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onViewInvoice(inv)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400">{inv.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{formatDate(inv.date)}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className={inv.status === 'OVERDUE' ? 'text-rose-600 font-semibold' : ''}>
                        {formatDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(inv.grandTotal, symbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(inv.paidAmount, symbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric font-bold">
                      <span className={inv.balanceAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                        {formatCurrency(inv.balanceAmount, symbol)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balanceAmount > 0 && onMarkInvoicePaid && (
                          <button
                            onClick={async () => {
                              try {
                                setProcessingId(inv.id);
                                await onMarkInvoicePaid(inv.id);
                              } finally {
                                setProcessingId(null);
                              }
                            }}
                            disabled={processingId === inv.id}
                            title="Mark Full Bill as Paid"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{processingId === inv.id ? '...' : 'Paid'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => onViewInvoice(inv)}
                          title="View / Print Invoice"
                          className="p-1.5 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.balanceAmount > 0 && (
                          <button
                            onClick={() => onRecordPayment(inv)}
                            title="Record Custom Payment"
                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}? This will recalculate customer balance.`)) {
                              onDeleteInvoice(inv.id);
                            }
                          }}
                          title="Delete Invoice"
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
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
