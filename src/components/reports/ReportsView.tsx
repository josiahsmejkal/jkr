import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Invoice, Customer, Expense, BusinessSettings, DashboardMetrics } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface ReportsViewProps {
  invoices: Invoice[];
  customers: Customer[];
  expenses: Expense[];
  metrics: DashboardMetrics;
  settings: BusinessSettings | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices,
  customers,
  expenses,
  metrics,
  settings,
}) => {
  const [reportType, setReportType] = useState<'SALES' | 'CUSTOMER_BALANCES' | 'EXPENSES' | 'PNL'>('PNL');
  const symbol = settings?.currencySymbol || '₹';

  // Export CSV Helper
  const downloadCSV = (filename: string, rows: (string | number | undefined | null)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${val ?? ''}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (reportType === 'SALES') {
      const headers = ['Invoice Number', 'Date', 'Customer', 'Phone', 'Subtotal', 'Tax', 'Grand Total', 'Paid', 'Balance', 'Status'];
      const data = invoices.map((inv) => [
        inv.invoiceNumber,
        inv.date,
        inv.customerName,
        inv.customerPhone || '',
        inv.subtotal,
        inv.taxAmount,
        inv.grandTotal,
        inv.paidAmount,
        inv.balanceAmount,
        inv.status,
      ]);
      downloadCSV('sales-report', [headers, ...data]);
    } else if (reportType === 'CUSTOMER_BALANCES') {
      const headers = ['Customer Name', 'Phone', 'Email', 'Total Billed', 'Total Paid', 'Pending Balance'];
      const data = customers.map((c) => [
        c.name,
        c.phone,
        c.email || '',
        c.totalBusiness,
        c.totalPaid ?? c.amountReceived,
        c.pendingBalance,
      ]);
      downloadCSV('customer-balances-report', [headers, ...data]);
    } else if (reportType === 'EXPENSES') {
      const headers = ['Date', 'Title', 'Category', 'Vendor', 'Payment Method', 'Amount'];
      const data = expenses.map((e) => [
        e.date,
        e.title,
        e.category,
        e.vendor || '',
        e.paymentMethod,
        e.amount,
      ]);
      downloadCSV('expenses-report', [headers, ...data]);
    } else {
      // PNL
      const headers = ['Metric', 'Amount'];
      const data = [
        ['Total Revenue Billed', metrics.totalBilled],
        ['Cash Collected', metrics.amountReceived],
        ['Total Operating Expenses', metrics.expenses],
        ['Net Realized Profit', metrics.netProfit],
        ['Pending Receivables', metrics.pendingBalance],
      ];
      downloadCSV('profit-loss-statement', [headers, ...data]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Business Financial Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate formal Profit & Loss, GST sales registers, and customer balance statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="no-print flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'PNL' as const, label: 'Profit & Loss Statement' },
          { id: 'SALES' as const, label: 'Sales Register' },
          { id: 'CUSTOMER_BALANCES' as const, label: 'Customer Receivables' },
          { id: 'EXPENSES' as const, label: 'Expense Statement' },
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setReportType(rep.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              reportType === rep.id
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      {/* Printable Report Document */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 md:p-8 invoice-paper">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {settings?.businessName || 'Business Ledger'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{settings?.address}</p>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Phone: {settings?.phone} | GSTIN: {settings?.gstNumber || 'N/A'}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Official Report</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {reportType === 'PNL' && 'Profit & Loss Statement'}
              {reportType === 'SALES' && 'Sales & Tax Register'}
              {reportType === 'CUSTOMER_BALANCES' && 'Customer Outstanding Receivables'}
              {reportType === 'EXPENSES' && 'Expense Summary Statement'}
            </h2>
            <div className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* REPORT CONTENT: PROFIT & LOSS */}
        {reportType === 'PNL' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                  Operating Income & Revenue
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Total Billed Invoices</span>
                    <span className="font-numeric font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(metrics.totalBilled, symbol)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Cash Received (Collected)</span>
                    <span className="font-numeric font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(metrics.amountReceived, symbol)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Uncollected Receivables (Pending)</span>
                    <span className="font-numeric font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(metrics.pendingBalance, symbol)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 border-b border-rose-200 dark:border-rose-800 pb-2">
                  Operating Burn & Expenses
                </h3>
                <div className="space-y-2 text-xs">
                  {metrics.expenseCategoryChart.map((cat) => (
                    <div key={cat.category} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">{cat.category}</span>
                      <span className="font-numeric font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(cat.amount, symbol)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5 border-t border-slate-200 dark:border-slate-700 font-bold">
                    <span className="text-slate-800 dark:text-slate-200">Total Expenses</span>
                    <span className="font-numeric text-rose-600 dark:text-rose-400">
                      {formatCurrency(metrics.expenses, symbol)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Line Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Revenue Cash Intake:</span>
                <span className="font-numeric font-bold">{formatCurrency(metrics.amountReceived, symbol)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Less Operating Expenses:</span>
                <span className="font-numeric font-bold text-rose-600">-{formatCurrency(metrics.expenses, symbol)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Net Business Profit:</span>
                <span className="text-xl font-black font-numeric text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(metrics.netProfit, symbol)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT CONTENT: SALES */}
        {reportType === 'SALES' && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Grand Total</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3">{formatDate(inv.date)}</td>
                    <td className="py-2.5 px-3 font-medium">{inv.customerName}</td>
                    <td className="py-2.5 px-3 text-right font-numeric">{formatCurrency(inv.subtotal, symbol)}</td>
                    <td className="py-2.5 px-3 text-right font-numeric">{formatCurrency(inv.taxAmount, symbol)}</td>
                    <td className="py-2.5 px-3 text-right font-numeric font-bold">{formatCurrency(inv.grandTotal, symbol)}</td>
                    <td className="py-2.5 px-3 text-right font-numeric text-emerald-600">{formatCurrency(inv.paidAmount, symbol)}</td>
                    <td className="py-2.5 px-3 text-right font-numeric text-rose-600">{formatCurrency(inv.balanceAmount, symbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT CONTENT: CUSTOMER BALANCES */}
        {reportType === 'CUSTOMER_BALANCES' && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 text-right">Total Invoiced</th>
                  <th className="py-2.5 px-3 text-right">Total Paid</th>
                  <th className="py-2.5 px-3 text-right">Current Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="py-2.5 px-3">{c.phone}</td>
                    <td className="py-2.5 px-3 text-right font-numeric font-semibold">{formatCurrency(c.totalBusiness, symbol)}</td>
                    <td className="py-2.5 px-3 text-right font-numeric text-emerald-600">{formatCurrency(c.totalPaid ?? c.amountReceived, symbol)}</td>
                    <td className="py-2.5 px-3 text-right font-numeric font-black text-rose-600">{formatCurrency(c.pendingBalance, symbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT CONTENT: EXPENSES */}
        {reportType === 'EXPENSES' && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 px-3">{formatDate(e.date)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{e.title}</td>
                    <td className="py-2.5 px-3">{e.category}</td>
                    <td className="py-2.5 px-3">{e.vendor || '-'}</td>
                    <td className="py-2.5 px-3">{e.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-right font-numeric font-bold text-rose-600">{formatCurrency(e.amount, symbol)}</td>
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
