import React, { useState, useEffect } from 'react';
import { Search, X, Users, FileText, Receipt, ArrowRight } from 'lucide-react';
import { Customer, Invoice, Expense, BusinessSettings } from '../../types/index.ts';
import { formatCurrency } from '../../lib/api.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  invoices: Invoice[];
  expenses: Expense[];
  settings: BusinessSettings | null;
  onSelectCustomer: (customer: Customer) => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  customers,
  invoices,
  expenses,
  settings,
  onSelectCustomer,
  onSelectInvoice,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const symbol = settings?.currencySymbol || '₹';

  // Listen for escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = query.trim().toLowerCase();

  const matchingCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      )
    : [];

  const matchingInvoices = q
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q)
      )
    : [];

  const matchingExpenses = q
    ? expenses.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.vendor && e.vendor.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    matchingCustomers.length > 0 || matchingInvoices.length > 0 || matchingExpenses.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search bills, customers, vendors, phone numbers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!q ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type anything to search across customer passbooks, invoices, and expense registers...
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for "{query}"
            </div>
          ) : (
            <>
              {/* Customers */}
              {matchingCustomers.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Customers
                  </div>
                  <div className="space-y-1">
                    {matchingCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCustomer(c);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.phone}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-numeric font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(c.pendingBalance, symbol)}
                          </div>
                          <div className="text-[10px] text-slate-400">Pending balance</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {matchingInvoices.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" /> Bills & Invoices
                  </div>
                  <div className="space-y-1">
                    {matchingInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          onSelectInvoice(inv);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                            {inv.invoiceNumber} • {inv.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400">Status: {inv.status}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-numeric font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(inv.grandTotal, symbol)}
                          </div>
                          <div className="text-[10px] text-slate-400">Total amount</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expenses */}
              {matchingExpenses.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-rose-500" /> Expenses
                  </div>
                  <div className="space-y-1">
                    {matchingExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{exp.title}</div>
                          <div className="text-[11px] text-slate-400">{exp.category} {exp.vendor ? `• ${exp.vendor}` : ''}</div>
                        </div>
                        <div className="text-xs font-numeric font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(exp.amount, symbol)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
