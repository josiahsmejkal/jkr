import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, UserCheck, ShieldCheck, Sparkles, Building2, PackageCheck } from 'lucide-react';
import { Customer, InvoiceItem, BusinessSettings, PaymentMethod } from '../../types/index.ts';
import { formatCurrency } from '../../lib/api.ts';
import { POPULAR_MATERIALS, COMMON_UNITS } from '../../data/materials.ts';

interface NewBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  settings: BusinessSettings | null;
  nextInvoiceNumber: string;
  preselectedCustomerId?: string;
  onSubmit: (payload: any) => Promise<void>;
}

interface ItemRow {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
}

export const NewBillModal: React.FC<NewBillModalProps> = ({
  isOpen,
  onClose,
  customers,
  settings,
  nextInvoiceNumber,
  preselectedCustomerId,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const symbol = settings?.currencySymbol || '₹';
  const today = new Date().toISOString().split('T')[0];

  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber || 'INV-0028');
  const [date, setDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDueDate());

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Items State (Unlimited materials)
  const [items, setItems] = useState<ItemRow[]>([
    {
      name: 'M-Sand',
      description: 'Manufactured sand for construction',
      quantity: 2,
      unit: 'Loads',
      rate: 8000,
      discountPercent: 0,
      taxPercent: 0,
    },
  ]);

  // Payment Upfront State
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  // Notes & Terms
  const [notes, setNotes] = useState(settings?.defaultNotes || '');
  const [terms, setTerms] = useState(settings?.defaultTerms || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when preselected customer changes
  useEffect(() => {
    if (preselectedCustomerId) {
      const cust = customers.find((c) => c.id === preselectedCustomerId);
      if (cust) {
        setSelectedCustomerId(cust.id);
        setCustomerName(cust.name);
        setCustomerPhone(cust.phone);
        setCustomerEmail(cust.email || '');
        setCustomerAddress(cust.address || '');
      }
    }
  }, [preselectedCustomerId, customers]);

  // Handle customer selection
  const handleCustomerChange = (cid: string) => {
    setSelectedCustomerId(cid);
    if (cid === 'NEW') {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
    } else {
      const cust = customers.find((c) => c.id === cid);
      if (cust) {
        setCustomerName(cust.name);
        setCustomerPhone(cust.phone);
        setCustomerEmail(cust.email || '');
        setCustomerAddress(cust.address || '');
      }
    }
  };

  // Add Material Row
  const addMaterial = (matName: string = '', defaultUnit: string = 'Loads', defaultRate: number = 0) => {
    setItems((prev) => [
      ...prev,
      {
        name: matName,
        description: '',
        quantity: 1,
        unit: defaultUnit,
        rate: defaultRate,
        discountPercent: 0,
        taxPercent: 0,
      },
    ]);
  };

  // Quick Pick Material from chips
  const handlePickMaterial = (mat: (typeof POPULAR_MATERIALS)[0]) => {
    const lastIndex = items.length - 1;
    if (lastIndex >= 0 && !items[lastIndex].name.trim()) {
      updateItem(lastIndex, 'name', mat.name);
      updateItem(lastIndex, 'rate', mat.defaultRate);
      updateItem(lastIndex, 'unit', mat.defaultUnit);
    } else {
      addMaterial(mat.name, mat.defaultUnit, mat.defaultRate);
    }
  };

  // Remove Item
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update Item
  const updateItem = (index: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Calculation Math
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  items.forEach((item) => {
    const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    const disc = base * ((Number(item.discountPercent) || 0) / 100);
    const afterDisc = base - disc;
    const tax = afterDisc * ((Number(item.taxPercent) || 0) / 100);

    subtotal += base;
    totalDiscount += disc;
    totalTax += tax;
  });

  const grandTotal = Math.round((subtotal - totalDiscount + totalTax) * 100) / 100;
  const balanceAmount = Math.max(0, Math.round((grandTotal - (Number(paidAmount) || 0)) * 100) / 100);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameToUse = customerName.trim();
    if (!nameToUse) {
      setError('Please provide a customer name');
      return;
    }

    if (items.some((i) => !i.name.trim() || Number(i.quantity) <= 0 || Number(i.rate) < 0)) {
      setError('Please ensure every item has a valid name, quantity > 0, and rate >= 0');
      return;
    }

    if (Number(paidAmount) > grandTotal) {
      setError(`Paid amount cannot be greater than grand total (${symbol}${grandTotal})`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        invoiceNumber,
        customerId: selectedCustomerId !== 'NEW' && selectedCustomerId ? selectedCustomerId : '',
        customerName: nameToUse,
        customerPhone,
        customerEmail,
        customerAddress,
        date,
        dueDate,
        items,
        paidAmount: Number(paidAmount) || 0,
        paymentMethod,
        notes,
        terms,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Bill To (பில் டு)
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-full">
                  Construction & Material Billing
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create bill for customer, select materials (M-Sand, Gravel, Cement), and auto-save to Customer ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Invoice Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Invoice / Bill Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Bill Date (தேதி)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Payment Due Date (கெடு தேதி)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Customer Selection: "Bill To: Who are you billing? / யாருக்கு பில் அடிக்க போறீங்க?" */}
          <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Bill To: Who are you billing? (யாருக்கு பில் அடிக்க போறீங்க?)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Type customer name below or 1-tap an existing customer like JKR Construction
                </p>
              </div>

              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs"
              >
                <option value="">-- Choose From Customer List --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
                <option value="NEW">+ Type / Register New Customer</option>
              </select>
            </div>

            {/* Quick 1-tap customer chips */}
            {customers.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                  Quick Select:
                </span>
                {customers.slice(0, 5).map((c) => {
                  const isSelected = selectedCustomerId === c.id || customerName.trim() === c.name.trim();
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCustomerChange(c.id)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Customer Name * (வாடிக்கையாளர் பெயர்)
                </label>
                <input
                  type="text"
                  placeholder="e.g. JKR Construction"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number * (தொலைபேசி)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 98421 77331"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. jkr@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Site / Delivery Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bypass Road, Tirunelveli"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Material Section: Strictly labeled "Material (பொருட்கள் / மெட்டீரியல்)" */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Material (பொருட்கள் / மெட்டீரியல்)
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Touch any material below to auto-load default unit and rate, then enter quantity
                </p>
              </div>

              <button
                type="button"
                onClick={() => addMaterial('', 'Loads', 0)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Material (அடுத்த பொருள்)
              </button>
            </div>

            {/* Quick Material Picker Bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Available Materials Catalog (மெட்டீரியல் பட்டியல்):
                </span>
                <span className="text-[10px] text-slate-400">Click to add to bill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => handlePickMaterial(mat)}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {mat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600">
                      ({mat.tamilName ? `${mat.tamilName} • ` : ''}{symbol}{mat.defaultRate}/{mat.defaultUnit})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Materials Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    <th className="py-2.5 px-3 min-w-[200px]">Material & Spec</th>
                    <th className="py-2.5 px-2 w-28 text-left">Unit (அலகு)</th>
                    <th className="py-2.5 px-2 w-24 text-right">Quantity (அளவு)</th>
                    <th className="py-2.5 px-2 w-28 text-right">Rate / Unit ({symbol})</th>
                    <th className="py-2.5 px-2 w-20 text-right">Tax %</th>
                    <th className="py-2.5 px-3 w-28 text-right">Amount ({symbol})</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, idx) => {
                    const rowBase = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                    const rowDisc = rowBase * ((Number(item.discountPercent) || 0) / 100);
                    const rowTax = (rowBase - rowDisc) * ((Number(item.taxPercent) || 0) / 100);
                    const rowTotal = rowBase - rowDisc + rowTax;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="p-2 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="e.g. M-Sand, Gravel, Cement"
                              value={item.name}
                              onChange={(e) => updateItem(idx, 'name', e.target.value)}
                              required
                              className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                            />
                            {/* Fast select dropdown */}
                            <select
                              onChange={(e) => {
                                const selected = POPULAR_MATERIALS.find((m) => m.name === e.target.value);
                                if (selected) {
                                  updateItem(idx, 'name', selected.name);
                                  updateItem(idx, 'rate', selected.defaultRate);
                                  updateItem(idx, 'unit', selected.defaultUnit);
                                }
                              }}
                              className="text-[11px] py-1 px-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-500"
                              title="Pick preset material"
                              value=""
                            >
                              <option value="">Presets...</option>
                              {POPULAR_MATERIALS.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Specifications / vehicle / location (optional)"
                            value={item.description}
                            onChange={(e) => updateItem(idx, 'description', e.target.value)}
                            className="w-full px-2.5 py-0.5 bg-transparent border-0 text-[11px] text-slate-500 dark:text-slate-400 placeholder:text-slate-400"
                          />
                        </td>

                        <td className="p-2">
                          <select
                            value={item.unit || 'Loads'}
                            onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium"
                          >
                            {COMMON_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-numeric font-bold"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-numeric font-semibold"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={item.taxPercent}
                            onChange={(e) => updateItem(idx, 'taxPercent', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-numeric"
                          />
                        </td>

                        <td className="p-2 text-right font-numeric font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(rowTotal, symbol)}
                        </td>

                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            disabled={items.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-20 cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Once saved, this bill is automatically linked to {customerName || 'the customer'}'s Customer Page.
              </span>
              <button
                type="button"
                onClick={() => addMaterial('', 'Loads', 0)}
                className="font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Material
              </button>
            </div>
          </div>

          {/* Bottom Breakdown & Payment Collection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Payment & Notes */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Upfront Payment (Optional)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Paid Amount ({symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      step="any"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-numeric font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                {paidAmount > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    ✓ This will automatically record a {symbol}{paidAmount} payment receipt and update customer balance.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add payment terms, delivery notes..."
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-numeric font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(subtotal, symbol)}
                </span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-numeric font-semibold">
                    -{formatCurrency(totalDiscount, symbol)}
                  </span>
                </div>
              )}
              {totalTax > 0 && (
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Tax (GST):</span>
                  <span className="font-numeric font-semibold text-slate-800 dark:text-slate-200">
                    +{formatCurrency(totalTax, symbol)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Grand Total:</span>
                <span className="text-xl font-black font-numeric text-slate-900 dark:text-slate-100">
                  {formatCurrency(grandTotal, symbol)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                <span>Amount Paid:</span>
                <span className="font-numeric font-semibold">
                  {formatCurrency(paidAmount, symbol)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Balance Pending:</span>
                <span className="text-base font-bold font-numeric text-rose-600 dark:text-rose-400">
                  {formatCurrency(balanceAmount, symbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save & Issue Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
