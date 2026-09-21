import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { BillsView } from './components/billing/BillsView.tsx';
import { NewBillModal } from './components/billing/NewBillModal.tsx';
import { InvoiceViewModal } from './components/billing/InvoiceViewModal.tsx';
import { CustomersView } from './components/customers/CustomersView.tsx';
import { CustomerDetailModal } from './components/customers/CustomerDetailModal.tsx';
import { NewCustomerModal } from './components/customers/NewCustomerModal.tsx';
import { PaymentsView } from './components/payments/PaymentsView.tsx';
import { RecordPaymentModal } from './components/payments/RecordPaymentModal.tsx';
import { ExpensesView } from './components/expenses/ExpensesView.tsx';
import { AddExpenseModal } from './components/expenses/AddExpenseModal.tsx';
import { AddRecurringModal } from './components/expenses/AddRecurringModal.tsx';
import { FinanceView } from './components/finance/FinanceView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { RemindersView } from './components/reminders/RemindersView.tsx';
import { RevenueView } from './components/revenue/RevenueView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { QuickActionModal } from './components/modals/QuickActionModal.tsx';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal.tsx';
import { NotificationDrawer } from './components/modals/NotificationDrawer.tsx';
import { ReceiptModal } from './components/modals/ReceiptModal.tsx';
import {
  Customer,
  Invoice,
  Payment,
  Expense,
  RecurringExpense,
  Reminder,
  NotificationItem,
  BusinessSettings,
  DashboardMetrics,
} from './types/index.ts';
import { api } from './lib/api.ts';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core business data state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('INV-0028');

  // Modal controls
  const [isNewBillOpen, setIsNewBillOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<{ payment: Payment; invoice?: Invoice | null } | null>(null);

  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentPreselectedInvoiceId, setPaymentPreselectedInvoiceId] = useState<string | undefined>();
  const [newBillPreselectedCustomerId, setNewBillPreselectedCustomerId] = useState<string | undefined>();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Sync dark class on html root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch all ledger records from server
  const loadData = useCallback(async () => {
    try {
      const [
        metricsData,
        settingsData,
        customersData,
        invoicesData,
        paymentsData,
        expensesData,
        recurringData,
        remindersData,
        notificationsData,
        nextNumberData,
      ] = await Promise.all([
        api.getDashboard(),
        api.getSettings(),
        api.getCustomers(),
        api.getInvoices(),
        api.getPayments(),
        api.getExpenses(),
        api.getRecurringExpenses(),
        api.getReminders(),
        api.getNotifications(),
        api.getNextInvoiceNumber(),
      ]);

      setMetrics(metricsData);
      setSettings(settingsData);
      setCustomers(customersData);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setExpenses(expensesData);
      setRecurringExpenses(recurringData);
      setReminders(remindersData);
      setNotifications(notificationsData);
      setNextInvoiceNumber(nextNumberData.nextInvoiceNumber);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load ledger data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Server Action Handlers
  const handleCreateInvoice = async (payload: any) => {
    await api.createInvoice(payload);
    await loadData();
  };

  const handleDeleteInvoice = async (id: string) => {
    await api.deleteInvoice(id);
    if (selectedInvoiceForView?.id === id) {
      setSelectedInvoiceForView(null);
    }
    await loadData();
  };

  const handleCreateCustomer = async (payload: any) => {
    await api.createCustomer(payload);
    await loadData();
  };

  const handleDeleteCustomer = async (id: string) => {
    await api.deleteCustomer(id);
    if (selectedCustomerForDetail?.id === id) {
      setSelectedCustomerForDetail(null);
    }
    await loadData();
  };

  const handleCreatePayment = async (payload: any) => {
    await api.createPayment(payload);
    await loadData();
  };

  const handleDeletePayment = async (id: string) => {
    await api.deletePayment(id);
    await loadData();
  };

  const handleMarkInvoicePaid = async (invoiceId: string, paymentMethod: any = 'Cash') => {
    await api.markInvoicePaid(invoiceId, paymentMethod);
    await loadData();
  };

  const handleCreateExpense = async (payload: any) => {
    await api.createExpense(payload);
    await loadData();
  };

  const handleDeleteExpense = async (id: string) => {
    await api.deleteExpense(id);
    await loadData();
  };

  const handleCreateRecurring = async (payload: any) => {
    await api.createRecurringExpense(payload);
    await loadData();
  };

  const handleDeleteRecurring = async (id: string) => {
    await api.deleteRecurringExpense(id);
    await loadData();
  };

  const handleUpdateSettings = async (payload: Partial<BusinessSettings>) => {
    await api.updateSettings(payload);
    await loadData();
  };

  const handleResetDemo = async () => {
    await api.resetDemoData();
    await loadData();
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleClearNotifications = async () => {
    await api.clearNotifications();
    setNotifications([]);
  };

  // Quick Action Selector Dispatcher
  const handleSelectQuickAction = (action: 'NEW_BILL' | 'ADD_EXPENSE' | 'ADD_CUSTOMER' | 'RECEIVE_PAYMENT') => {
    if (action === 'NEW_BILL') {
      setNewBillPreselectedCustomerId(undefined);
      setIsNewBillOpen(true);
    } else if (action === 'ADD_EXPENSE') {
      setIsAddExpenseOpen(true);
    } else if (action === 'ADD_CUSTOMER') {
      setIsNewCustomerOpen(true);
    } else if (action === 'RECEIVE_PAYMENT') {
      setPaymentPreselectedInvoiceId(undefined);
      setIsRecordPaymentOpen(true);
    }
  };

  const unpaidCount = invoices.filter((i) => i.balanceAmount > 0).length;
  const overdueCount = reminders.filter((r) => r.status === 'OVERDUE').length;

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased overflow-hidden font-sans">
      {/* Desktop Left Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        unpaidCount={unpaidCount}
        overdueCount={overdueCount}
        settings={settings}
        onOpenNewBill={() => {
          setNewBillPreselectedCustomerId(undefined);
          setIsNewBillOpen(true);
        }}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentView={currentView}
          isDark={isDark}
          setIsDark={setIsDark}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
          onQuickAction={() => setIsQuickActionsOpen(true)}
          settings={settings}
        />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {loading && !metrics ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <div className="text-xs font-semibold">Initializing Ledger Single Source of Truth...</div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {currentView === 'dashboard' && metrics && (
                <DashboardView
                  metrics={metrics}
                  settings={settings}
                  onNavigate={setCurrentView}
                  onNewBill={() => {
                    setNewBillPreselectedCustomerId(undefined);
                    setIsNewBillOpen(true);
                  }}
                  onAddExpense={() => setIsAddExpenseOpen(true)}
                  onAddCustomer={() => setIsNewCustomerOpen(true)}
                  onReceivePayment={() => {
                    setPaymentPreselectedInvoiceId(undefined);
                    setIsRecordPaymentOpen(true);
                  }}
                  onViewInvoice={(inv) => setSelectedInvoiceForView(inv)}
                />
              )}

              {currentView === 'bills' && (
                <BillsView
                  invoices={invoices}
                  settings={settings}
                  onNewBill={() => {
                    setNewBillPreselectedCustomerId(undefined);
                    setIsNewBillOpen(true);
                  }}
                  onViewInvoice={(inv) => setSelectedInvoiceForView(inv)}
                  onRecordPayment={(inv) => {
                    setPaymentPreselectedInvoiceId(inv.id);
                    setIsRecordPaymentOpen(true);
                  }}
                  onMarkInvoicePaid={handleMarkInvoicePaid}
                  onDeleteInvoice={handleDeleteInvoice}
                />
              )}

              {currentView === 'revenue' && (
                <RevenueView
                  invoices={invoices}
                  payments={payments}
                  settings={settings}
                  onMarkInvoicePaid={handleMarkInvoicePaid}
                  onViewInvoice={(inv) => setSelectedInvoiceForView(inv)}
                  onViewReceipt={(p, inv) => setSelectedPaymentForReceipt({ payment: p, invoice: inv })}
                  onRecordCustomPayment={(inv) => {
                    setPaymentPreselectedInvoiceId(inv.id);
                    setIsRecordPaymentOpen(true);
                  }}
                />
              )}

              {currentView === 'customers' && (
                <CustomersView
                  customers={customers}
                  settings={settings}
                  onSelectCustomer={(c) => setSelectedCustomerForDetail(c)}
                  onNewCustomer={() => setIsNewCustomerOpen(true)}
                  onNewBillForCustomer={(c) => {
                    setNewBillPreselectedCustomerId(c.id);
                    setIsNewBillOpen(true);
                  }}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              )}

              {currentView === 'payments' && (
                <PaymentsView
                  payments={payments}
                  settings={settings}
                  onRecordPayment={() => {
                    setPaymentPreselectedInvoiceId(undefined);
                    setIsRecordPaymentOpen(true);
                  }}
                  onViewReceipt={(p) => {
                    const inv = invoices.find((i) => i.id === p.invoiceId);
                    setSelectedPaymentForReceipt({ payment: p, invoice: inv });
                  }}
                  onDeletePayment={handleDeletePayment}
                />
              )}

              {currentView === 'expenses' && (
                <ExpensesView
                  expenses={expenses}
                  recurringExpenses={recurringExpenses}
                  settings={settings}
                  onAddExpense={() => setIsAddExpenseOpen(true)}
                  onAddRecurring={() => setIsAddRecurringOpen(true)}
                  onDeleteExpense={handleDeleteExpense}
                  onDeleteRecurring={handleDeleteRecurring}
                />
              )}

              {currentView === 'finance' && metrics && (
                <FinanceView metrics={metrics} settings={settings} />
              )}

              {currentView === 'reports' && metrics && (
                <ReportsView
                  invoices={invoices}
                  customers={customers}
                  expenses={expenses}
                  metrics={metrics}
                  settings={settings}
                />
              )}

              {(currentView === 'reminders' || currentView === 'receivables') && (
                <RemindersView
                  reminders={reminders}
                  settings={settings}
                  onRecordPaymentForInvoice={(invoiceId) => {
                    setPaymentPreselectedInvoiceId(invoiceId);
                    setIsRecordPaymentOpen(true);
                  }}
                />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onResetDemo={handleResetDemo}
                />
              )}
            </div>
          )}
        </main>

        {/* Mobile Persistent Bottom Bar */}
        <MobileNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenQuickActions={() => setIsQuickActionsOpen(true)}
          unpaidCount={unpaidCount}
          overdueCount={overdueCount}
        />
      </div>

      {/* --- MODALS & DRAWERS --- */}

      {/* Quick Action Selector Modal */}
      <QuickActionModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />

      {/* New Bill Modal */}
      <NewBillModal
        isOpen={isNewBillOpen}
        onClose={() => setIsNewBillOpen(false)}
        customers={customers}
        settings={settings}
        nextInvoiceNumber={nextInvoiceNumber}
        preselectedCustomerId={newBillPreselectedCustomerId}
        onSubmit={handleCreateInvoice}
      />

      {/* Invoice Printable View Modal */}
      <InvoiceViewModal
        invoice={selectedInvoiceForView}
        settings={settings}
        onClose={() => setSelectedInvoiceForView(null)}
        onRecordPayment={(inv) => {
          setSelectedInvoiceForView(null);
          setPaymentPreselectedInvoiceId(inv.id);
          setIsRecordPaymentOpen(true);
        }}
        onMarkInvoicePaid={handleMarkInvoicePaid}
        onDeleteInvoice={handleDeleteInvoice}
      />

      {/* Customer Detailed Ledger Modal */}
      <CustomerDetailModal
        customer={selectedCustomerForDetail}
        settings={settings}
        onClose={() => setSelectedCustomerForDetail(null)}
        onNewBill={(c) => {
          setSelectedCustomerForDetail(null);
          setNewBillPreselectedCustomerId(c.id);
          setIsNewBillOpen(true);
        }}
        onRecordPayment={(c) => {
          setSelectedCustomerForDetail(null);
          const customerInv = invoices.find((i) => i.customerId === c.id && i.balanceAmount > 0);
          setPaymentPreselectedInvoiceId(customerInv?.id);
          setIsRecordPaymentOpen(true);
        }}
        onViewInvoice={(inv) => {
          setSelectedCustomerForDetail(null);
          setSelectedInvoiceForView(inv);
        }}
        onViewReceipt={(p, inv) => {
          setSelectedPaymentForReceipt({ payment: p, invoice: inv });
        }}
        onRefreshCustomer={loadData}
      />

      {/* Add Customer Modal */}
      <NewCustomerModal
        isOpen={isNewCustomerOpen}
        onClose={() => setIsNewCustomerOpen(false)}
        settings={settings}
        onSubmit={handleCreateCustomer}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPaymentPreselectedInvoiceId(undefined);
        }}
        invoices={invoices}
        settings={settings}
        preselectedInvoiceId={paymentPreselectedInvoiceId}
        onSubmit={handleCreatePayment}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        settings={settings}
        onSubmit={handleCreateExpense}
      />

      {/* Add Recurring Expense Modal */}
      <AddRecurringModal
        isOpen={isAddRecurringOpen}
        onClose={() => setIsAddRecurringOpen(false)}
        settings={settings}
        onSubmit={handleCreateRecurring}
      />

      {/* Global Cmd+K Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        customers={customers}
        invoices={invoices}
        expenses={expenses}
        settings={settings}
        onSelectCustomer={(c) => {
          setSelectedCustomerForDetail(c);
        }}
        onSelectInvoice={(inv) => {
          setSelectedInvoiceForView(inv);
        }}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onClearAll={handleClearNotifications}
      />

      {/* Official Printable Payment Receipt Modal */}
      <ReceiptModal
        payment={selectedPaymentForReceipt?.payment || null}
        invoice={selectedPaymentForReceipt?.invoice || null}
        settings={settings}
        onClose={() => setSelectedPaymentForReceipt(null)}
      />
    </div>
  );
}
