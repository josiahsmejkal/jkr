import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  ChevronRight,
  FileText,
  CreditCard,
  Trash2,
  Share2,
} from 'lucide-react';
import { Customer, BusinessSettings } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface CustomersViewProps {
  customers: Customer[];
  settings: BusinessSettings | null;
  onSelectCustomer: (customer: Customer) => void;
  onNewCustomer: () => void;
  onNewBillForCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  onSelectCustomer,
  onNewCustomer,
  onNewBillForCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');
  const symbol = settings?.currencySymbol || '₹';

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm));

    if (!matchesSearch) return false;
    if (filterType === 'PENDING') return c.pendingBalance > 0;
    if (filterType === 'SETTLED') return c.pendingBalance <= 0;
    return true;
  });

  const totalReceivables = customers.reduce((sum, c) => sum + c.pendingBalance, 0);
  const totalLifetimeBusiness = customers.reduce((sum, c) => sum + c.totalBusiness, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Add Customer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Customer Ledger & Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated customer balances, total lifetime business, and statement ledgers
          </p>
        </div>

        <button
          onClick={onNewCustomer}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Mini Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Registered Clients</div>
          <div className="text-lg font-black font-numeric text-slate-900 dark:text-slate-100 mt-1">
            {customers.length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            Total Business Done
          </div>
          <div className="text-lg font-black font-numeric text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalLifetimeBusiness, symbol)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">
            Outstanding Customer Balances
          </div>
          <div className="text-lg font-black font-numeric text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalReceivables, symbol)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Customers ({customers.length})
          </button>
          <button
            onClick={() => setFilterType('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'PENDING'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Has Pending ({customers.filter((c) => c.pendingBalance > 0).length})
          </button>
          <button
            onClick={() => setFilterType('SETTLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'SETTLED'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Fully Settled
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No customers found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Customers are automatically registered whenever you create a bill, or you can add one directly.
            </p>
            <button
              onClick={onNewCustomer}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
            >
              + Add Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Total Invoiced</th>
                  <th className="py-3 px-4 text-right">Total Paid</th>
                  <th className="py-3 px-4 text-right">Pending Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => onSelectCustomer(c)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{c.name}</span>
                        {c.pendingBalance > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </div>
                      {c.address && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{c.address}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{c.phone}</div>
                      {c.email && <div className="text-[10px] text-slate-400">{c.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(c.totalBusiness, symbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(c.totalPaid ?? c.amountReceived, symbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric font-bold">
                      <span className={c.pendingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                        {formatCurrency(c.pendingBalance, symbol)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectCustomer(c)}
                          title="Open Customer Ledger"
                          className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        >
                          Ledger
                        </button>
                        <button
                          onClick={() => onNewBillForCustomer(c)}
                          title="Create Bill for this customer"
                          className="p-1.5 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete customer ${c.name}? This will remove associated ledger links.`)) {
                              onDeleteCustomer(c.id);
                            }
                          }}
                          title="Delete Customer"
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
