import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  CreditCard,
  FileText,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { BusinessSettings } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface SettingsViewProps {
  settings: BusinessSettings | null;
  onUpdateSettings: (data: Partial<BusinessSettings>) => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDemo,
}) => {
  const [formData, setFormData] = useState<Partial<BusinessSettings>>({
    businessName: settings?.businessName || '',
    tagline: settings?.tagline || '',
    phone: settings?.phone || '',
    email: settings?.email || '',
    address: settings?.address || '',
    gstNumber: settings?.gstNumber || '',
    currencySymbol: settings?.currencySymbol || '₹',
    invoicePrefix: settings?.invoicePrefix || 'INV-',
    upiId: settings?.upiId || '',
    bankName: settings?.bankName || '',
    accountNumber: settings?.accountNumber || '',
    ifscCode: settings?.ifscCode || '',
    defaultNotes: settings?.defaultNotes || '',
    defaultTerms: settings?.defaultTerms || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onUpdateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const backup = await api.exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMsg('Backup downloaded successfully!');
      setTimeout(() => setBackupMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to export backup: ' + err.message);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.importBackup(json);
        alert('Database restored from backup! Reloading...');
        window.location.reload();
      } catch (err: any) {
        alert('Failed to import backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Business Settings & Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your business profile, GST credentials, payment details, and data backups
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
        </div>
      )}

      {backupMsg && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {backupMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Business Profile & Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical / Office Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={formData.gstNumber || ''}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <select
                value={formData.currencySymbol || '₹'}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="$">$ (USD - Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - Pound)</option>
                <option value="AED">AED (Dirham)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Bank & UPI Payment Details */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Bank & UPI Settlement Credentials</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                UPI ID (Displayed on Bills & Reminders)
              </label>
              <input
                type="text"
                placeholder="e.g. business@okhdfcbank"
                value={formData.upiId || ''}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber || ''}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={formData.ifscCode || ''}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Default Notes & Terms */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Invoice Terms & Remarks</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Invoice Notes
              </label>
              <input
                type="text"
                value={formData.defaultNotes || ''}
                onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={formData.defaultTerms || ''}
                onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </form>

      {/* Section 4: Backup, Restore & Reset */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Data Backup, Restore & Demo Reset</h3>
        </div>

        <p className="text-xs text-slate-500">
          Export your complete database (all customers, bills, payments, and expenses) to a local JSON file, or restore a previous snapshot.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database Backup (.json)</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore From File</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset database to demo records (JKR Services, TP Enterprises, BN Tech)?')) {
                onResetDemo();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
};
