import React from 'react';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { Payment, BusinessSettings, Invoice } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../lib/api.ts';

interface ReceiptModalProps {
  payment: Payment | null;
  invoice?: Invoice | null;
  settings: BusinessSettings | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  invoice,
  settings,
  onClose,
}) => {
  if (!payment) return null;

  const symbol = settings?.currencySymbol || '₹';
  const receiptNo = payment.receiptNumber || payment.referenceNumber || `REC-${payment.id.slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text =
      `*PAYMENT RECEIPT*\n` +
      `*Receipt No:* ${receiptNo}\n` +
      `*Date:* ${formatDate(payment.date)}\n` +
      `*Received From:* ${payment.customerName}\n` +
      `*Amount Received:* ${symbol}${payment.amount}\n` +
      `*Payment Mode:* ${payment.paymentMethod}\n` +
      (payment.invoiceNumber ? `*Against Bill:* ${payment.invoiceNumber}\n` : '') +
      (payment.notes ? `*Notes:* ${payment.notes}\n` : '') +
      `--------------------------\n` +
      `*Received By:* ${settings?.businessName || 'Business Ledger'}\n` +
      `Thank you for your business!`;

    const phoneClean = (invoice?.customerPhone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean ? (phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`) : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-6 overflow-hidden invoice-paper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {receiptNo}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
              PAID & SETTLED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold cursor-pointer"
              title="Share Receipt on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
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

        {/* Printable Receipt Paper */}
        <div className="p-6 md:p-8 space-y-6 bg-white text-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  BL
                </div>
                <h3 className="text-base font-black uppercase text-slate-900">
                  {settings?.businessName || 'Business Ledger'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{settings?.address}</p>
              <p className="text-[11px] text-slate-500">Phone: {settings?.phone}</p>
              {settings?.gstNumber && (
                <p className="text-[11px] font-semibold text-slate-700">GSTIN: {settings.gstNumber}</p>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Payment Receipt
              </span>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1">{receiptNo}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Date: {formatDate(payment.date)}</div>
            </div>
          </div>

          {/* Received From & Payment Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-slate-500">Received With Thanks From:</span>
              <span className="text-sm font-bold text-slate-900">{payment.customerName}</span>
            </div>

            {payment.invoiceNumber && (
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-500">Against Bill / Invoice:</span>
                <span className="font-mono font-bold text-emerald-600">{payment.invoiceNumber}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline text-xs">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {payment.paymentMethod}
              </span>
            </div>

            {payment.referenceNumber && (
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-500">Transaction Ref / UPI:</span>
                <span className="font-mono text-slate-700">{payment.referenceNumber}</span>
              </div>
            )}

            {payment.notes && (
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-500">Remarks:</span>
                <span className="text-slate-700 italic">{payment.notes}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                Amount Received (செலுத்தப்பட்ட தொகை)
              </span>
              <span className="text-xs text-emerald-800">Payment Status: Settled</span>
            </div>
            <div className="text-2xl font-black font-numeric text-emerald-700">
              {formatCurrency(payment.amount, symbol)}
            </div>
          </div>

          {/* Signatory Footer */}
          <div className="pt-8 flex justify-between items-end text-xs text-slate-500 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400">This is an authorized payment receipt.</p>
              <p className="text-[10px] text-slate-400">Thank you for your business!</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-300 pb-1 mb-1 font-signature text-slate-800 font-bold">
                Authorized
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
