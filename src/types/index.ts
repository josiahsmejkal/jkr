export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';

export type RecurringFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export interface InvoiceItem {
  id: string;
  name: string; // Material / Product name
  description?: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  amount: number;
  unit?: string; // e.g. Loads, Tons, Bags, CFT, Trips, Nos
}

export interface MaterialProduct {
  id: string;
  name: string;
  tamilName?: string;
  defaultUnit: string;
  defaultRate: number;
  category: string;
}

export interface WeeklyExpenseSummary {
  weekKey: string; // e.g. 2026-W39
  startDate: string;
  endDate: string;
  days: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  totalWeekly: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalBusiness: number;
  amountReceived: number;
  totalPaid?: number;
  pendingBalance: number;
  billsCount: number;
  lastPaymentDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  receiptNumber?: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  vendor?: string;
  description?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringExpenseId?: string;
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextDueDate: string;
  vendor?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING';
  isDismissed?: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'PAYMENT_DUE' | 'PAYMENT_OVERDUE' | 'INVOICE_PAID' | 'PAYMENT_RECEIVED' | 'RECURRING_DUE' | 'LARGE_EXPENSE' | 'BILL_CREATED';
  title: string;
  message: string;
  date: string;
  timestamp?: string;
  read: boolean;
  link?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  entityType: 'INVOICE' | 'PAYMENT' | 'CUSTOMER' | 'EXPENSE';
  entityId: string;
  amount?: number;
  timestamp: string;
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  currencySymbol: string;
  currencyCode: string;
  invoicePrefix: string;
  financialYear: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  defaultTerms: string;
  defaultNotes: string;
  logoUrl?: string;
}

export interface DashboardMetrics {
  totalBilled: number;
  todaySales: number;
  amountReceived: number;
  expenses: number;
  pendingBalance: number;
  netProfit: number;
  estimatedProfit: number;
  totalCustomers: number;
  totalInvoices: number;
  revenueVsExpenseChart: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expenseCategoryChart: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recentBills: Invoice[];
  recentPayments: Payment[];
  pendingInvoices: Invoice[];
  upcomingReminders: Reminder[];
  topCustomers: Customer[];
  recentActivity: ActivityLog[];
}
