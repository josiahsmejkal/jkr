import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  FileText,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Share2,
  Printer,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
  FileCheck,
  Building2,
  Check,
} from 'lucide-react';
import { Customer, Invoice, Payment, BusinessSettings } from '../../types/index.ts';
import { api, formatCurrency, formatDate } from '../../lib/api.ts';

interface CustomerDetailModalProps {
  customer: Customer | null;
  settings: BusinessSettings | null;
  onClose: () => void;
  onNewBill: (customer: Customer) => void;
  onRecordPayment: (customer: Customer) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onViewReceipt?: (payment: Payment, invoice?: Invoice) => void;
  onRefreshCustomer?: () => void;
}

interface LedgerEntry {
  id: string;
  date: string;
  type: 'INVOICE' | 'PAYMENT';
  refNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  rawInvoice?: Invoice;
  rawPayment?: Payment;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  settings,
  onClose,
  onNewBill,
  onRecordPayment,
  onViewInvoice,
  onViewReceipt,
  onRefreshCustomer,
}) => {
  if (!customer) return null;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'BILLS' | 'PASSBOOK'>('BILLS');
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const symbol = settings?.currencySymbol || '₹';

  const fetchDetails = () => {
    setLoading(true);
    api.getCustomer(customer.id)
      .then((data) => {
        setInvoices(data.invoices || []);
        setPayments(data.payments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetails();
  }, [customer.id]);

  // Handle Mark Paid for an invoice
  const handleQuickMarkPaid = async (inv: Invoice) => {
    try {
      setPayingInvoiceId(inv.id);
      await api.markInvoicePaid(inv.id, 'Cash', 'Settled from Customer Page');
      fetchDetails();
      if (onRefreshCustomer) onRefreshCustomer();
    } catch (err: any) {
      alert(err.message || 'Failed to mark bill as paid');
    } finally {
      setPayingInvoiceId(null);
    }
  };

  // Compute unified chronological ledger statement with running balance
  const ledgerEntries: LedgerEntry[] = [];
  const allEvents: { date: string; type: 'INVOICE' | 'PAYMENT'; raw: any }[] = [
    ...invoices.map((inv) => ({ date: inv.date, type: 'INVOICE' as const, raw: inv })),
    ...payments.map((p) => ({ date: p.date, type: 'PAYMENT' as const, raw: p })),
  ];

  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentBalance = 0;
  allEvents.forEach((ev) => {
    if (ev.type === 'INVOICE') {
      const inv = ev.raw as Invoice;
      currentBalance += inv.grandTotal;
      ledgerEntries.push({
        id: inv.id,
        date: inv.date,
        type: 'INVOICE',
        refNumber: inv.invoiceNumber,
        description: inv.items.map((i) => `${i.name} (${i.quantity} ${i.unit || 'Loads'})`).join(', ') || 'Invoice billed',
        debit: inv.grandTotal,
        credit: 0,
        runningBalance: currentBalance,
        rawInvoice: inv,
      });
    } else {
      const pay = ev.raw as Payment;
      currentBalance -= pay.amount;
      ledgerEntries.push({
        id: pay.id,
        date: pay.date,
        type: 'PAYMENT',
        refNumber: pay.receiptNumber || pay.referenceNumber || pay.id,
        description: `Payment received via ${pay.paymentMethod} ${pay.notes ? `(${pay.notes})` : ''}`,
        debit: 0,
        credit: pay.amount,
        runningBalance: currentBalance,
        rawPayment: pay,
      });
    }
  });

  const reversedLedger = [...ledgerEntries].reverse();

  // Share overall statement
  const handleShareStatement = () => {
    const totalBill = invoices.reduce((sum, i) => sum + i.grandTotal, 0) || customer.totalBusiness;
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0) || (customer.totalPaid ?? customer.amountReceived);
    const balance = totalBill - totalPaid;

    const text =
      `*CUSTOMER ACCOUNT STATEMENT*\n` +
      `*Customer:* ${customer.name}\n` +
      `*Business:* ${settings?.businessName || 'Business Ledger'}\n` +
      `--------------------------\n` +
      `*Total Bill (மொத்த பில்):* ${symbol}${totalBill}\n` +
      `*Total Paid (செலுத்தியது):* ${symbol}${totalPaid}\n` +
      `*Balance (மீதி வர வேண்டியது):* ${symbol}${balance}\n` +
      `--------------------------\n` +
      (settings?.upiId ? `*UPI ID:* ${settings.upiId}\n` : '') +
      (settings?.bankName ? `*Bank:* ${settings.bankName} | *A/C:* ${settings.accountNumber} | *IFSC:* ${settings.ifscCode}\n` : '') +
      `Thank you!`;

    const phoneClean = (customer.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean ? (phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`) : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Share individual invoice via WhatsApp
  const handleShareInvoiceWhatsApp = (inv: Invoice) => {
    const text =
      `*BILL / INVOICE: ${inv.invoiceNumber}*\n` +
      `*Customer:* ${customer.name}\n` +
      `*Date:* ${formatDate(inv.date)}\n` +
      `*From:* ${settings?.businessName || 'Business Ledger'}\n` +
      `--------------------------\n` +
      `*Materials:*\n` +
      inv.items.map((i) => `• ${i.name}: ${i.quantity} ${i.unit || 'Loads'} × ${symbol}${i.rate} = ${symbol}${i.amount}`).join('\n') +
      `\n--------------------------\n` +
      `*Total Bill:* ${symbol}${inv.grandTotal}\n` +
      `*Paid Amount:* ${symbol}${inv.paidAmount}\n` +
      `*Balance Due:* ${symbol}${inv.balanceAmount}\n` +
      (inv.balanceAmount > 0 && settings?.upiId ? `*Pay via UPI:* ${settings.upiId}\n` : '') +
      `Thank you!`;

    const phoneClean = (customer.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean ? (phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`) : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const calculatedTotalBill = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const calculatedTotalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const calculatedBalance = calculatedTotalBill - calculatedTotalPaid;

  const displayTotalBill = calculatedTotalBill || customer.totalBusiness;
  const displayTotalPaid = calculatedTotalPaid || (customer.totalPaid ?? customer.amountReceived);
  const displayBalance = displayTotalBill - displayTotalPaid;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-6 overflow-hidden invoice-paper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {customer.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customer Ledger & Invoices (கஸ்டமர் கணக்கு மற்றும் பில்கள்)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareStatement}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold cursor-pointer"
              title="Share statement on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Statement</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Customer 3-Card Summary (Total Bill, Total Paid, Balance) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Bill (மொத்த பில்)
              </span>
              <div className="text-2xl font-black font-numeric text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(displayTotalBill, symbol)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {invoices.length} Bills Created
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Total Paid (செலுத்திய தொகை)
              </span>
              <div className="text-2xl font-black font-numeric text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(displayTotalPaid, symbol)}
              </div>
              <span className="text-[10px] text-emerald-600/70 block mt-0.5">
                {payments.length} Payments Collected
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/60">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                Balance (மீதி வர வேண்டியது)
              </span>
              <div className="text-2xl font-black font-numeric text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(displayBalance, symbol)}
              </div>
              <span className="text-[10px] text-rose-600/70 block mt-0.5">
                {displayBalance <= 0 ? 'Fully Settled ✓' : 'Payment Outstanding'}
              </span>
            </div>
          </div>

          {/* Contact Details & Quick Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {customer.phone}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {customer.email}
                </span>
              )}
              {customer.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {customer.address}
                </span>
              )}
            </div>

            <div className="no-print flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onNewBill(customer);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Bill</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(customer);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer active:scale-95 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            </div>
          </div>

          {/* Sub-tabs: Customer Bills vs Passbook Ledger */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('BILLS')}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'BILLS'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Bills & Invoices ({invoices.length})
              </button>
              <button
                onClick={() => setActiveTab('PASSBOOK')}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'PASSBOOK'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Passbook Ledger ({ledgerEntries.length})
              </button>
            </div>

            {/* TAB 1: BILLS LIST WITH DATE, VIEW BILL, PRINT BILL, RECEIPT, WHATSAPP */}
            {activeTab === 'BILLS' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {invoices.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No bills created for this customer yet.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Bill No</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Materials</th>
                        <th className="py-2.5 px-3 text-right">Total Bill</th>
                        <th className="py-2.5 px-3 text-right">Paid</th>
                        <th className="py-2.5 px-3 text-right">Balance</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {invoices.map((inv) => {
                        const linkedPayment = payments.find((p) => p.invoiceId === inv.id);
                        return (
                          <tr
                            key={inv.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                              {inv.invoiceNumber}
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                              {formatDate(inv.date)}
                            </td>
                            <td className="py-3 px-3 max-w-[180px]">
                              <span className="text-slate-600 dark:text-slate-300 truncate block">
                                {inv.items.map((i) => `${i.name} (${i.quantity} ${i.unit || 'Loads'})`).join(', ')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-numeric font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(inv.grandTotal, symbol)}
                            </td>
                            <td className="py-3 px-3 text-right font-numeric text-emerald-600 dark:text-emerald-400 font-medium">
                              {formatCurrency(inv.paidAmount, symbol)}
                            </td>
                            <td className="py-3 px-3 text-right font-numeric font-bold">
                              <span className={inv.balanceAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                                {formatCurrency(inv.balanceAmount, symbol)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  inv.status === 'PAID'
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : inv.status === 'PARTIALLY_PAID'
                                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right no-print">
                              <div className="flex items-center justify-end gap-1">
                                {/* Quick Mark Paid button for pending bills */}
                                {inv.balanceAmount > 0 && (
                                  <button
                                    onClick={() => handleQuickMarkPaid(inv)}
                                    disabled={payingInvoiceId === inv.id}
                                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                                    title="Mark this bill as fully Paid"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{payingInvoiceId === inv.id ? '...' : 'Paid'}</span>
                                  </button>
                                )}

                                {/* View Bill */}
                                <button
                                  onClick={() => onViewInvoice(inv)}
                                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                  title="View Bill"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Print Bill */}
                                <button
                                  onClick={() => onViewInvoice(inv)}
                                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                  title="Print Bill / PDF"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>

                                {/* WhatsApp Share */}
                                <button
                                  onClick={() => handleShareInvoiceWhatsApp(inv)}
                                  className="p-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                                  title="Share on WhatsApp"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Receipt Button */}
                                {linkedPayment && onViewReceipt && (
                                  <button
                                    onClick={() => onViewReceipt(linkedPayment, inv)}
                                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 cursor-pointer"
                                    title="View Payment Receipt"
                                  >
                                    <FileCheck className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB 2: PASSBOOK LEDGER (DEBIT / CREDIT / RUNNING BALANCE) */}
            {activeTab === 'PASSBOOK' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Ref #</th>
                      <th className="py-2.5 px-3">Type & Details</th>
                      <th className="py-2.5 px-3 text-right">Debit (+)</th>
                      <th className="py-2.5 px-3 text-right">Credit (-)</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3 text-center no-print">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reversedLedger.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No transactions recorded for this customer yet.
                        </td>
                      </tr>
                    ) : (
                      reversedLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                            {formatDate(entry.date)}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {entry.refNumber}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 ${
                                entry.type === 'INVOICE'
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {entry.type}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 truncate">
                              {entry.description}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-numeric font-bold text-slate-900 dark:text-slate-100">
                            {entry.debit > 0 ? formatCurrency(entry.debit, symbol) : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-numeric font-bold text-emerald-600 dark:text-emerald-400">
                            {entry.credit > 0 ? formatCurrency(entry.credit, symbol) : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-numeric font-black text-slate-900 dark:text-slate-100">
                            {formatCurrency(entry.runningBalance, symbol)}
                          </td>
                          <td className="py-3 px-3 text-center no-print">
                            {entry.rawPayment && onViewReceipt && (
                              <button
                                onClick={() => onViewReceipt(entry.rawPayment!)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 cursor-pointer"
                                title="View Receipt"
                              >
                                <FileCheck className="w-3.5 h-3.5 inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
