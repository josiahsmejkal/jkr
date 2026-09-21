import React from 'react';
import {
  X,
  Printer,
  Share2,
  CreditCard,
  Trash2,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  FileText,
  Clock,
} from 'lucide-react';
import { Invoice, BusinessSettings } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  settings: BusinessSettings | null;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onMarkInvoicePaid?: (invoiceId: string) => Promise<void>;
  onDeleteInvoice: (invoiceId: string) => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  invoice,
  settings,
  onClose,
  onRecordPayment,
  onMarkInvoicePaid,
  onDeleteInvoice,
}) => {
  if (!invoice) return null;

  const [isMarkingPaid, setIsMarkingPaid] = React.useState(false);
  const symbol = settings?.currencySymbol || '₹';

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `Invoice ${invoice.invoiceNumber} from ${settings?.businessName || 'Business Ledger'}\n` +
      `Bill Date: ${formatDate(invoice.date)}\n` +
      `Total: ${symbol}${invoice.grandTotal}\n` +
      `Paid: ${symbol}${invoice.paidAmount}\n` +
      `Pending Balance: ${symbol}${invoice.balanceAmount}\n` +
      `Due Date: ${formatDate(invoice.dueDate)}\n\n` +
      `Bank: ${settings?.bankName || ''} | A/C: ${settings?.accountNumber || ''} | IFSC: ${settings?.ifscCode || ''}\n` +
      `UPI ID: ${settings?.upiId || ''}\n\n` +
      `Thank you for your business!`;

    const phoneClean = (invoice.customerPhone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean ? (phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`) : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-6 overflow-hidden invoice-paper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                invoice.status === 'PAID'
                  ? 'bg-emerald-500/15 text-emerald-600'
                  : invoice.status === 'PARTIALLY_PAID'
                  ? 'bg-blue-500/15 text-blue-600'
                  : invoice.status === 'OVERDUE'
                  ? 'bg-rose-500/15 text-rose-600'
                  : 'bg-amber-500/15 text-amber-600'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {invoice.balanceAmount > 0 && onMarkInvoicePaid && (
              <button
                onClick={async () => {
                  try {
                    setIsMarkingPaid(true);
                    await onMarkInvoicePaid(invoice.id);
                    onClose();
                  } finally {
                    setIsMarkingPaid(false);
                  }
                }}
                disabled={isMarkingPaid}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                title="Mark full bill as paid"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isMarkingPaid ? 'Saving...' : 'Paid (செலுத்தப்பட்டது)'}</span>
              </button>
            )}
            {invoice.balanceAmount > 0 && (
              <button
                onClick={() => onRecordPayment(invoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold cursor-pointer"
              title="Share invoice summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto bg-white text-slate-900">
          {/* Header: Company Details & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                  BL
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {settings?.businessName || 'Business Ledger'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{settings?.address}</p>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <div>Phone: {settings?.phone}</div>
                <div>Email: {settings?.email}</div>
                {settings?.gstNumber && (
                  <div className="font-semibold text-slate-800">GSTIN: {settings.gstNumber}</div>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                TAX INVOICE
              </div>
              <div className="mt-1 font-mono font-bold text-sm text-emerald-600">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <div>Invoice Date: <span className="font-semibold">{formatDate(invoice.date)}</span></div>
                <div>Due Date: <span className="font-semibold">{formatDate(invoice.dueDate)}</span></div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed To:
            </span>
            <div className="text-sm font-bold text-slate-900">{invoice.customerName}</div>
            {invoice.customerAddress && (
              <div className="text-xs text-slate-600 mt-0.5">{invoice.customerAddress}</div>
            )}
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-4">
              {invoice.customerPhone && <span>Phone: {invoice.customerPhone}</span>}
              {invoice.customerEmail && <span>Email: {invoice.customerEmail}</span>}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item & Description</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-numeric font-medium whitespace-nowrap">
                      {item.quantity} {item.unit ? <span className="text-slate-500 text-[11px] font-normal">{item.unit}</span> : ''}
                    </td>
                    <td className="py-3 px-3 text-right font-numeric">{formatCurrency(item.rate, symbol)}</td>
                    <td className="py-3 px-3 text-right font-numeric text-slate-500">
                      {item.taxPercent ? `${item.taxPercent}%` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-numeric font-bold text-slate-900">
                      {formatCurrency(item.amount, symbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Breakdown & Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Payment Bank Details & QR */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                Bank / UPI Payment Details:
              </span>
              <div className="text-slate-600 space-y-1">
                <div>Bank: <span className="font-semibold text-slate-800">{settings?.bankName}</span></div>
                <div>A/C No: <span className="font-mono font-semibold text-slate-800">{settings?.accountNumber}</span></div>
                <div>IFSC Code: <span className="font-mono font-semibold text-slate-800">{settings?.ifscCode}</span></div>
                <div>UPI ID: <span className="font-semibold text-emerald-700">{settings?.upiId}</span></div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-numeric font-semibold">{formatCurrency(invoice.subtotal, symbol)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount:</span>
                  <span className="font-numeric">-{formatCurrency(invoice.discountAmount, symbol)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount:</span>
                  <span className="font-numeric">+{formatCurrency(invoice.taxAmount, symbol)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                <span className="text-lg font-black font-numeric text-slate-900">
                  {formatCurrency(invoice.grandTotal, symbol)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Amount Paid:</span>
                <span className="font-numeric">{formatCurrency(invoice.paidAmount, symbol)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-rose-600">Balance Due:</span>
                <span className="text-base font-bold font-numeric text-rose-600">
                  {formatCurrency(invoice.balanceAmount, symbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Signature */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
            <div className="space-y-1 max-w-sm">
              <div className="font-bold text-slate-700 text-[11px] uppercase">Terms & Conditions:</div>
              <div className="whitespace-pre-line text-[11px] leading-relaxed">
                {invoice.terms || settings?.defaultTerms}
              </div>
            </div>

            <div className="text-center sm:text-right space-y-8 w-full sm:w-auto">
              <div className="text-[11px] font-semibold text-slate-700 uppercase">
                For {settings?.businessName || 'Business Ledger'}
              </div>
              <div className="border-t border-slate-400 pt-1 text-[11px] font-medium text-slate-600">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
