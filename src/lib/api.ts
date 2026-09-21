import {
  Customer,
  Invoice,
  InvoiceItem,
  Payment,
  Expense,
  RecurringExpense,
  Reminder,
  NotificationItem,
  BusinessSettings,
  DashboardMetrics,
} from '../types/index.ts';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const json = await res.json();
      if (json.error) errMsg = json.error;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  getDashboard: () => request<DashboardMetrics>('/dashboard'),

  getSettings: () => request<BusinessSettings>('/settings'),
  updateSettings: (data: Partial<BusinessSettings>) =>
    request<BusinessSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  getCustomers: (search?: string) =>
    request<Customer[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCustomer: (id: string) =>
    request<{ customer: Customer; invoices: Invoice[]; payments: Payment[] }>(`/customers/${id}`),
  createCustomer: (data: { name: string; phone: string; email?: string; address?: string; notes?: string }) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) =>
    request<{ success: boolean }>(`/customers/${id}`, { method: 'DELETE' }),

  getInvoices: (status?: string, customerId?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.set('status', status);
    if (customerId) params.set('customerId', customerId);
    const query = params.toString();
    return request<Invoice[]>(`/invoices${query ? `?${query}` : ''}`);
  },
  getNextInvoiceNumber: () => request<{ nextInvoiceNumber: string }>('/invoices/next-number'),
  createInvoice: (data: {
    invoiceNumber?: string;
    customerId: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    date: string;
    dueDate: string;
    items: Omit<InvoiceItem, 'id' | 'amount'>[];
    paidAmount?: number;
    paymentMethod?: any;
    notes?: string;
    terms?: string;
  }) => request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  deleteInvoice: (id: string) => request<{ success: boolean }>(`/invoices/${id}`, { method: 'DELETE' }),
  markInvoicePaid: (id: string, paymentMethod: string = 'Cash', notes?: string) =>
    request<{ success: boolean; invoice: Invoice; payment: Payment }>(`/invoices/${id}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, notes }),
    }),

  getPayments: () => request<Payment[]>('/payments'),
  createPayment: (data: {
    invoiceId: string;
    amount: number;
    date: string;
    paymentMethod: any;
    referenceNumber?: string;
    notes?: string;
  }) => request<{ payment: Payment; invoice: Invoice }>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  deletePayment: (id: string) => request<{ success: boolean }>(`/payments/${id}`, { method: 'DELETE' }),

  getExpenses: (category?: string, date?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.set('category', category);
    if (date) params.set('date', date);
    const query = params.toString();
    return request<Expense[]>(`/expenses${query ? `?${query}` : ''}`);
  },
  createExpense: (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: any;
    vendor?: string;
    description?: string;
    isRecurring?: boolean;
    recurringExpenseId?: string;
  }) => request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id: string) => request<{ success: boolean }>(`/expenses/${id}`, { method: 'DELETE' }),

  getRecurringExpenses: () => request<RecurringExpense[]>('/recurring-expenses'),
  createRecurringExpense: (data: {
    title: string;
    amount: number;
    category: string;
    frequency: any;
    startDate: string;
    nextDueDate: string;
    vendor?: string;
    notes?: string;
  }) => request<RecurringExpense>('/recurring-expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteRecurringExpense: (id: string) =>
    request<{ success: boolean }>(`/recurring-expenses/${id}`, { method: 'DELETE' }),

  getReminders: () => request<Reminder[]>('/reminders'),

  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
  clearNotifications: () => request<{ success: boolean }>('/notifications/clear', { method: 'POST' }),

  resetDemoData: () => request<{ success: boolean; data: any }>('/seed/reset', { method: 'POST' }),
  exportBackup: () => request<any>('/backup/export'),
  importBackup: (backup: any) =>
    request<{ success: boolean }>('/backup/import', { method: 'POST', body: JSON.stringify(backup) }),
};

// Formatting helpers
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol}0`;
  const parts = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${parts}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
