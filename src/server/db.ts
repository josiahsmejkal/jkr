import fs from 'fs';
import path from 'path';
import {
  Customer,
  Invoice,
  InvoiceItem,
  Payment,
  Expense,
  RecurringExpense,
  Reminder,
  NotificationItem,
  ActivityLog,
  BusinessSettings,
  DashboardMetrics,
} from '../types/index.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'ledger.json');

interface LedgerData {
  settings: BusinessSettings;
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Apex Digital Solutions',
  ownerName: 'Rajesh Sharma',
  tagline: 'Billing • Customers • Expenses • Payments • Profit',
  phone: '+91 98765 00000',
  email: 'billing@apexdigital.in',
  address: 'Suite 402, Innov8 Hub, MG Road, Bengaluru, Karnataka 560001',
  gstNumber: '29ABCDE1234F1Z5',
  currencySymbol: '₹',
  currencyCode: 'INR',
  invoicePrefix: 'INV-',
  financialYear: '2026-2027',
  bankName: 'HDFC Bank Ltd',
  accountNumber: '50200012345678',
  ifscCode: 'HDFC0000123',
  upiId: 'apexdigital@hdfcbank',
  defaultTerms: '1. Payment due within 15 days of invoice date.\n2. Interest @ 18% p.a. will be charged on overdue payments.\n3. Goods or services once delivered cannot be returned.',
  defaultNotes: 'Thank you for your business! For any queries, please write to billing@apexdigital.in.',
};

function getInitialDemoData(): LedgerData {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Date helpers
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const daysAhead = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Customers: JKR Construction, TP Technologies, Thenkasi Traders & Builders
  const customers: Customer[] = [
    {
      id: 'cust-jkr',
      name: 'JKR Construction',
      phone: '+91 98765 43210',
      email: 'contact@jkrconstruction.in',
      address: 'Plot 45, Bye-pass Road, Industrial Area, Chennai, TN',
      totalBusiness: 85000,
      amountReceived: 70000,
      pendingBalance: 15000,
      billsCount: 3,
      lastPaymentDate: daysAgo(2),
      status: 'ACTIVE',
      notes: 'Active building contractor. Supplies: M-Sand, Gravel, Blue Metal 20mm, Cement.',
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: 'cust-tp',
      name: 'TP Technologies',
      phone: '+91 98123 45678',
      email: 'accounts@tptech.io',
      address: 'Level 3, Cyber Gateway, Hitec City, Hyderabad, TS',
      totalBusiness: 65000,
      amountReceived: 45000,
      pendingBalance: 20000,
      billsCount: 2,
      lastPaymentDate: daysAgo(10),
      status: 'ACTIVE',
      notes: 'Commercial IT campus infra client. Supplies: River Sand, M-Sand, Chamber Bricks.',
      createdAt: daysAgo(60),
      updatedAt: daysAgo(10),
    },
    {
      id: 'cust-thenkasi',
      name: 'Thenkasi Traders & Builders',
      phone: '+91 94433 22110',
      email: 'orders@thenkasitraders.com',
      address: '74 Madurai Road, Tenkasi, Tamil Nadu 627811',
      totalBusiness: 95000,
      amountReceived: 45000,
      pendingBalance: 50000,
      billsCount: 2,
      lastPaymentDate: daysAgo(5),
      status: 'ACTIVE',
      notes: 'Wholesale materials supplier & builder in Tenkasi district. Pending balance ₹50,000.',
      createdAt: daysAgo(30),
      updatedAt: daysAgo(5),
    },
  ];

  // Invoices with Materials: M-Sand, Gravel, River Sand, Blue Metal, Cement, Bricks
  const invoices: Invoice[] = [
    {
      id: 'inv-0021',
      invoiceNumber: 'INV-0021',
      customerId: 'cust-jkr',
      customerName: 'JKR Construction',
      customerPhone: '+91 98765 43210',
      customerEmail: 'contact@jkrconstruction.in',
      customerAddress: 'Plot 45, Bye-pass Road, Industrial Area, Chennai, TN',
      date: daysAgo(15),
      dueDate: daysAgo(1), // Overdue!
      items: [
        {
          id: 'item-1',
          name: 'M-Sand (Manufactured Sand)',
          description: 'High grade plastering & concrete M-Sand (2 Loads)',
          quantity: 2,
          unit: 'Loads',
          rate: 8000,
          discountPercent: 0,
          taxPercent: 0,
          amount: 16000,
        },
      ],
      subtotal: 16000,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 16000,
      paidAmount: 6000,
      balanceAmount: 10000,
      status: 'OVERDUE',
      notes: 'Site delivery: Bye-pass Road project site. Delivery challan #4401.',
      terms: 'Payment due on delivery or net 14 days.',
      createdAt: daysAgo(15),
      updatedAt: daysAgo(5),
    },
    {
      id: 'inv-0022',
      invoiceNumber: 'INV-0022',
      customerId: 'cust-jkr',
      customerName: 'JKR Construction',
      customerPhone: '+91 98765 43210',
      customerEmail: 'contact@jkrconstruction.in',
      customerAddress: 'Plot 45, Bye-pass Road, Industrial Area, Chennai, TN',
      date: daysAgo(8),
      dueDate: daysAhead(7),
      items: [
        {
          id: 'item-2',
          name: 'Gravel (Filling Earth)',
          description: 'Base foundation filling gravel (2 Loads)',
          quantity: 2,
          unit: 'Loads',
          rate: 6000,
          discountPercent: 0,
          taxPercent: 0,
          amount: 12000,
        },
        {
          id: 'item-2b',
          name: 'Blue Metal 20mm',
          description: 'Concrete aggregate stone 20mm (1 Load)',
          quantity: 1,
          unit: 'Loads',
          rate: 12000,
          discountPercent: 0,
          taxPercent: 0,
          amount: 12000,
        },
      ],
      subtotal: 24000,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 24000,
      paidAmount: 19000,
      balanceAmount: 5000,
      status: 'PARTIALLY_PAID',
      notes: 'Dispatched via Tipper Lorry TN-76-A-4122.',
      terms: 'Net 15 days.',
      createdAt: daysAgo(8),
      updatedAt: daysAgo(2),
    },
    {
      id: 'inv-0023',
      invoiceNumber: 'INV-0023',
      customerId: 'cust-jkr',
      customerName: 'JKR Construction',
      customerPhone: '+91 98765 43210',
      customerEmail: 'contact@jkrconstruction.in',
      customerAddress: 'Plot 45, Bye-pass Road, Industrial Area, Chennai, TN',
      date: daysAgo(35),
      dueDate: daysAgo(20),
      items: [
        {
          id: 'item-3',
          name: 'Cement (OPC 53 Grade)',
          description: 'UltraTech 50kg bags (100 Bags)',
          quantity: 100,
          unit: 'Bags',
          rate: 450,
          discountPercent: 0,
          taxPercent: 0,
          amount: 45000,
        },
      ],
      subtotal: 45000,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 45000,
      paidAmount: 45000,
      balanceAmount: 0,
      status: 'PAID',
      notes: 'Full payment received. Invoice cleared.',
      terms: 'Standard supply contract.',
      createdAt: daysAgo(35),
      updatedAt: daysAgo(20),
    },
    {
      id: 'inv-0024',
      invoiceNumber: 'INV-0024',
      customerId: 'cust-tp',
      customerName: 'TP Technologies',
      customerPhone: '+91 98123 45678',
      customerEmail: 'accounts@tptech.io',
      customerAddress: 'Level 3, Cyber Gateway, Hitec City, Hyderabad, TS',
      date: daysAgo(6),
      dueDate: daysAhead(9),
      items: [
        {
          id: 'item-4',
          name: 'River Sand (Natural)',
          description: 'Certified river sand for structural finishing (2 Loads)',
          quantity: 2,
          unit: 'Loads',
          rate: 15000,
          discountPercent: 0,
          taxPercent: 0,
          amount: 30000,
        },
        {
          id: 'item-4b',
          name: 'M-Sand',
          description: 'Manufactured sand (1 Load)',
          quantity: 1,
          unit: 'Loads',
          rate: 10000,
          discountPercent: 0,
          taxPercent: 0,
          amount: 10000,
        },
      ],
      subtotal: 40000,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 40000,
      paidAmount: 20000,
      balanceAmount: 20000,
      status: 'PARTIALLY_PAID',
      notes: 'Balance due: ₹20,000.',
      terms: 'Net 15 days.',
      createdAt: daysAgo(6),
      updatedAt: daysAgo(3),
    },
    {
      id: 'inv-0025',
      invoiceNumber: 'INV-0025',
      customerId: 'cust-tp',
      customerName: 'TP Technologies',
      customerPhone: '+91 98123 45678',
      customerEmail: 'accounts@tptech.io',
      customerAddress: 'Level 3, Cyber Gateway, Hitec City, Hyderabad, TS',
      date: daysAgo(25),
      dueDate: daysAgo(10),
      items: [
        {
          id: 'item-5',
          name: 'Red Chamber Bricks',
          description: 'First quality clay chamber bricks (5,000 Nos)',
          quantity: 5000,
          unit: 'Nos',
          rate: 5,
          discountPercent: 0,
          taxPercent: 0,
          amount: 25000,
        },
      ],
      subtotal: 25000,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 25000,
      paidAmount: 25000,
      balanceAmount: 0,
      status: 'PAID',
      notes: 'Delivered to tech park expansion wing.',
      terms: 'Net 15 days.',
      createdAt: daysAgo(25),
      updatedAt: daysAgo(10),
    },
    {
      id: 'inv-0026',
      invoiceNumber: 'INV-0026',
      customerId: 'cust-thenkasi',
      customerName: 'Thenkasi Traders & Builders',
      customerPhone: '+91 94433 22110',
      customerEmail: 'orders@thenkasitraders.com',
      customerAddress: '74 Madurai Road, Tenkasi, Tamil Nadu 627811',
      date: todayStr,
      dueDate: daysAhead(14),
      items: [
        {
          id: 'item-6',
          name: 'M-Sand (Manufactured Sand)',
          description: 'Direct quarry supply M-Sand (2 Loads)',
          quantity: 2,
          unit: 'Loads',
          rate: 12500,
          discountPercent: 0,
          taxPercent: 0,
          amount: 25000,
        },
      ],
      subtotal: 25000,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 25000,
      paidAmount: 5000,
      balanceAmount: 20000,
      status: 'PARTIALLY_PAID',
      notes: 'Advance ₹5,000 received. Balance due ₹20,000.',
      terms: 'Net 14 days.',
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 'inv-0027',
      invoiceNumber: 'INV-0027',
      customerId: 'cust-thenkasi',
      customerName: 'Thenkasi Traders & Builders',
      customerPhone: '+91 94433 22110',
      customerEmail: 'orders@thenkasitraders.com',
      customerAddress: '74 Madurai Road, Tenkasi, Tamil Nadu 627811',
      date: daysAgo(10),
      dueDate: daysAgo(1),
      items: [
        {
          id: 'item-7',
          name: 'Gravel (Filling Earth)',
          description: 'Red gravel soil for road leveling (3 Loads)',
          quantity: 3,
          unit: 'Loads',
          rate: 5000,
          discountPercent: 0,
          taxPercent: 0,
          amount: 15000,
        },
        {
          id: 'item-7b',
          name: 'Blue Metal 40mm',
          description: 'Sub-base coarse aggregate 40mm (1 Load)',
          quantity: 1,
          unit: 'Loads',
          rate: 15000,
          discountPercent: 0,
          taxPercent: 0,
          amount: 15000,
        },
      ],
      subtotal: 30000,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 30000,
      paidAmount: 0,
      balanceAmount: 30000,
      status: 'OVERDUE',
      notes: 'Dispatched to Tenkasi bypass commercial site. Balance due: ₹30,000.',
      terms: 'Net 7 days.',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(1),
    },
  ];

  // Payments
  const payments: Payment[] = [
    {
      id: 'pay-1',
      invoiceId: 'inv-0026',
      invoiceNumber: 'INV-0026',
      customerId: 'cust-thenkasi',
      customerName: 'Thenkasi Traders & Builders',
      amount: 5000,
      date: todayStr,
      paymentMethod: 'UPI',
      referenceNumber: 'UPI-THENKASI-908234',
      notes: 'Advance for M-Sand 2 loads.',
      createdAt: todayStr,
    },
    {
      id: 'pay-2',
      invoiceId: 'inv-0022',
      invoiceNumber: 'INV-0022',
      customerId: 'cust-jkr',
      customerName: 'JKR Construction',
      amount: 19000,
      date: daysAgo(2),
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'NEFT-HDFC-991204',
      notes: 'Payment for Gravel and Blue Metal 20mm.',
      createdAt: daysAgo(2),
    },
    {
      id: 'pay-3',
      invoiceId: 'inv-0024',
      invoiceNumber: 'INV-0024',
      customerId: 'cust-tp',
      customerName: 'TP Technologies',
      amount: 20000,
      date: daysAgo(3),
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'RTGS-ICICI-88129',
      notes: 'Initial payment for River Sand.',
      createdAt: daysAgo(3),
    },
    {
      id: 'pay-4',
      invoiceId: 'inv-0021',
      invoiceNumber: 'INV-0021',
      customerId: 'cust-jkr',
      customerName: 'JKR Construction',
      amount: 6000,
      date: daysAgo(5),
      paymentMethod: 'UPI',
      referenceNumber: 'UPI-JKR-4421',
      notes: 'Token advance for M-Sand.',
      createdAt: daysAgo(5),
    },
    {
      id: 'pay-6',
      invoiceId: 'inv-0025',
      invoiceNumber: 'INV-0025',
      customerId: 'cust-tp',
      customerName: 'TP Technologies',
      amount: 25000,
      date: daysAgo(10),
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'RTGS-YESB-7729',
      notes: 'Red chamber bricks full payment.',
      createdAt: daysAgo(10),
    },
    {
      id: 'pay-7',
      invoiceId: 'inv-0023',
      invoiceNumber: 'INV-0023',
      customerId: 'cust-jkr',
      customerName: 'JKR Construction',
      amount: 45000,
      date: daysAgo(20),
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'NEFT-HDFC-10293',
      notes: 'ERP dev project full payment.',
      createdAt: daysAgo(20),
    },
  ];

  // Expenses: Realistic sample matching prompt (Petrol ₹500, Food ₹250, Domain ₹1,200, Office ₹800, etc.)
  const expenses: Expense[] = [
    {
      id: 'exp-1',
      title: 'Petrol for client site visit',
      amount: 500,
      category: 'Petrol',
      date: todayStr,
      paymentMethod: 'UPI',
      vendor: 'Shell Fuel Station',
      description: 'Fuel for visiting JKR warehouse for hardware setup.',
      createdAt: todayStr,
    },
    {
      id: 'exp-2',
      title: 'Team lunch & client coffee',
      amount: 250,
      category: 'Food',
      date: todayStr,
      paymentMethod: 'Cash',
      vendor: 'Cafe Coffee Day',
      description: 'Discussion on project deliverables.',
      createdAt: todayStr,
    },
    {
      id: 'exp-3',
      title: 'Domain renewal (client apex portal)',
      amount: 1200,
      category: 'Domain',
      date: todayStr,
      paymentMethod: 'Card',
      vendor: 'Namecheap',
      description: 'Annual domain name extension.',
      createdAt: todayStr,
    },
    {
      id: 'exp-4',
      title: 'Office stationery and printer cartridges',
      amount: 800,
      category: 'Office',
      date: todayStr,
      paymentMethod: 'UPI',
      vendor: 'Metro Stationers',
      description: 'A4 paper reams and black toner.',
      createdAt: todayStr,
    },
    {
      id: 'exp-5',
      title: 'Internet Fiber 300Mbps bill',
      amount: 1499,
      category: 'Internet',
      date: daysAgo(1),
      paymentMethod: 'UPI',
      vendor: 'Airtel Broadband',
      description: 'High-speed commercial fiber connection.',
      createdAt: daysAgo(1),
    },
    {
      id: 'exp-6',
      title: 'AWS Cloud Hosting servers',
      amount: 3500,
      category: 'Hosting',
      date: daysAgo(3),
      paymentMethod: 'Card',
      vendor: 'Amazon Web Services',
      description: 'Production EC2 and RDS instances.',
      createdAt: daysAgo(3),
    },
    {
      id: 'exp-7',
      title: 'GitHub Enterprise & Figma licenses',
      amount: 2500,
      category: 'Software',
      date: daysAgo(5),
      paymentMethod: 'Card',
      vendor: 'GitHub / Figma',
      description: 'Design and developer tools seat subscriptions.',
      createdAt: daysAgo(5),
    },
    {
      id: 'exp-8',
      title: 'Office cleaning & water replenishment',
      amount: 750,
      category: 'Maintenance',
      date: daysAgo(6),
      paymentMethod: 'Cash',
      vendor: 'CleanCare Services',
      description: 'Weekly housekeeping maintenance.',
      createdAt: daysAgo(6),
    },
    {
      id: 'exp-9',
      title: 'Contractor frontend engineer payout',
      amount: 15000,
      category: 'Salary',
      date: daysAgo(10),
      paymentMethod: 'Bank Transfer',
      vendor: 'Dev Contractor',
      description: 'Component development payout.',
      createdAt: daysAgo(10),
    },
  ];

  // Recurring Expenses: Rent, Hosting, Domain, Software, Internet, Salary
  const recurringExpenses: RecurringExpense[] = [
    {
      id: 'rec-1',
      title: 'Office Space Rent',
      amount: 18000,
      category: 'Office',
      frequency: 'Monthly',
      startDate: '2026-01-01',
      nextDueDate: daysAhead(10),
      vendor: 'Innov8 Realty Pvt Ltd',
      active: true,
      notes: 'Includes power backup and parking privileges.',
      createdAt: daysAgo(60),
    },
    {
      id: 'rec-2',
      title: 'Production Cloud Hosting (AWS)',
      amount: 3500,
      category: 'Hosting',
      frequency: 'Monthly',
      startDate: '2026-01-05',
      nextDueDate: daysAhead(15),
      vendor: 'Amazon Web Services',
      active: true,
      notes: 'Autopay via corporate credit card.',
      createdAt: daysAgo(60),
    },
    {
      id: 'rec-3',
      title: 'Primary Domain Registrations',
      amount: 1200,
      category: 'Domain',
      frequency: 'Yearly',
      startDate: '2026-03-15',
      nextDueDate: '2027-03-15',
      vendor: 'Namecheap Inc',
      active: true,
      notes: 'Includes whois privacy protection.',
      createdAt: daysAgo(90),
    },
    {
      id: 'rec-4',
      title: 'Software Subscriptions (Figma + GitHub)',
      amount: 2500,
      category: 'Software',
      frequency: 'Monthly',
      startDate: '2026-02-01',
      nextDueDate: daysAhead(8),
      vendor: 'SaaS Platforms',
      active: true,
      notes: 'Standard 3 developer seats.',
      createdAt: daysAgo(40),
    },
    {
      id: 'rec-5',
      title: 'Commercial Fiber Internet',
      amount: 1499,
      category: 'Internet',
      frequency: 'Monthly',
      startDate: '2026-01-10',
      nextDueDate: daysAhead(18),
      vendor: 'Airtel Business',
      active: true,
      notes: 'Includes static IP address.',
      createdAt: daysAgo(50),
    },
    {
      id: 'rec-6',
      title: 'Junior Developer Salary',
      amount: 35000,
      category: 'Salary',
      frequency: 'Monthly',
      startDate: '2026-01-01',
      nextDueDate: daysAhead(9),
      vendor: 'Staff Payroll',
      active: true,
      notes: 'Credited directly via NEFT on the 1st.',
      createdAt: daysAgo(90),
    },
  ];

  // Notifications
  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      type: 'PAYMENT_OVERDUE',
      title: 'Payment Overdue: JKR Enterprises',
      message: '₹10,000 against INV-0021 was due on ' + daysAgo(1) + '. Click to send WhatsApp reminder.',
      date: todayStr,
      read: false,
      link: '/reminders',
    },
    {
      id: 'notif-2',
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received: ₹20,000',
      message: 'BN Creative Studio sent ₹20,000 via UPI for invoice INV-0026.',
      date: todayStr,
      read: false,
      link: '/payments',
    },
    {
      id: 'notif-3',
      type: 'RECURRING_DUE',
      title: 'Upcoming Recurring: Software Subscriptions',
      message: '₹2,500 for Figma & GitHub is scheduled in 8 days.',
      date: todayStr,
      read: true,
      link: '/expenses',
    },
    {
      id: 'notif-4',
      type: 'PAYMENT_DUE',
      title: 'Upcoming Due: TP Technologies',
      message: '₹20,000 balance against INV-0024 is due in 9 days.',
      date: daysAgo(1),
      read: true,
      link: '/receivables',
    },
  ];

  // Activity Logs
  const activityLogs: ActivityLog[] = [
    {
      id: 'act-1',
      action: 'Payment Received',
      description: 'Received ₹20,000 from BN Creative Studio for INV-0026 (UPI)',
      entityType: 'PAYMENT',
      entityId: 'pay-1',
      amount: 20000,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'act-2',
      action: 'Bill Created',
      description: 'Created invoice INV-0026 for BN Creative Studio for ₹25,000',
      entityType: 'INVOICE',
      entityId: 'inv-0026',
      amount: 25000,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'act-3',
      action: 'Expense Logged',
      description: 'Logged expense ₹500 for Petrol (Shell Fuel Station)',
      entityType: 'EXPENSE',
      entityId: 'exp-1',
      amount: 500,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'act-4',
      action: 'Payment Received',
      description: 'Received ₹19,000 from JKR Enterprises for INV-0022 (Bank Transfer)',
      entityType: 'PAYMENT',
      entityId: 'pay-2',
      amount: 19000,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'act-5',
      action: 'Bill Created',
      description: 'Created invoice INV-0022 for JKR Enterprises for ₹24,000',
      entityType: 'INVOICE',
      entityId: 'inv-0022',
      amount: 24000,
      timestamp: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
  ];

  return {
    settings: DEFAULT_SETTINGS,
    customers,
    invoices,
    payments,
    expenses,
    recurringExpenses,
    notifications,
    activityLogs,
  };
}

class LedgerDatabase {
  private data: LedgerData;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): LedgerData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.customers && parsed.invoices) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing ledger.json, reinitializing demo data:', e);
    }

    const demo = getInitialDemoData();
    this.saveToDisk(demo);
    return demo;
  }

  private saveToDisk(data: LedgerData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write ledger.json:', e);
    }
  }

  private persist() {
    this.saveToDisk(this.data);
  }

  public resetToDemo(): LedgerData {
    this.data = getInitialDemoData();
    this.persist();
    return this.data;
  }

  public exportBackup(): LedgerData {
    return this.data;
  }

  public importBackup(imported: LedgerData): boolean {
    if (!imported.customers || !imported.invoices) {
      return false;
    }
    this.data = imported;
    this.persist();
    return true;
  }

  // --- SETTINGS ---
  public getSettings(): BusinessSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<BusinessSettings>): BusinessSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }

  // --- RECALCULATE CUSTOMER STATS TRANSACTIONALLY ---
  private recalculateCustomer(customerId: string) {
    const cust = this.data.customers.find((c) => c.id === customerId);
    if (!cust) return;

    const customerInvoices = this.data.invoices.filter((inv) => inv.customerId === customerId);
    const totalBusiness = customerInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalPaid = customerInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalPending = customerInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

    const customerPayments = this.data.payments.filter((p) => p.customerId === customerId);
    let lastPayDate = cust.lastPaymentDate;
    if (customerPayments.length > 0) {
      const sorted = [...customerPayments].sort((a, b) => b.date.localeCompare(a.date));
      lastPayDate = sorted[0].date;
    }

    cust.totalBusiness = totalBusiness;
    cust.amountReceived = totalPaid;
    cust.pendingBalance = totalPending;
    cust.billsCount = customerInvoices.length;
    cust.lastPaymentDate = lastPayDate;
    cust.updatedAt = new Date().toISOString();
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getCustomer(id: string): { customer: Customer; invoices: Invoice[]; payments: Payment[] } | null {
    const customer = this.data.customers.find((c) => c.id === id);
    if (!customer) return null;
    const invoices = this.data.invoices.filter((i) => i.customerId === id);
    const payments = this.data.payments.filter((p) => p.customerId === id);
    return { customer, invoices, payments };
  }

  public createCustomer(input: { name: string; phone: string; email?: string; address?: string; notes?: string }): Customer {
    const newCust: Customer = {
      id: 'cust-' + Date.now().toString(36),
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim(),
      address: input.address?.trim(),
      notes: input.notes?.trim(),
      totalBusiness: 0,
      amountReceived: 0,
      pendingBalance: 0,
      billsCount: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    this.data.customers.unshift(newCust);

    this.logActivity('Customer Added', `Added new customer ${newCust.name}`, 'CUSTOMER', newCust.id);
    this.persist();
    return newCust;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.customers[idx] = { ...this.data.customers[idx], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    this.persist();
    return this.data.customers[idx];
  }

  public deleteCustomer(id: string): boolean {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const cust = this.data.customers[idx];
    // Remove customer and cascade or disallow if pending balance
    this.data.customers.splice(idx, 1);
    this.logActivity('Customer Deleted', `Deleted customer ${cust.name}`, 'CUSTOMER', id);
    this.persist();
    return true;
  }

  // --- INVOICES ---
  public getInvoices(): Invoice[] {
    return this.data.invoices;
  }

  public getNextInvoiceNumber(): string {
    const prefix = this.data.settings.invoicePrefix || 'INV-';
    const numbers = this.data.invoices
      .map((inv) => {
        const m = inv.invoiceNumber.replace(prefix, '');
        const n = parseInt(m, 10);
        return isNaN(n) ? 0 : n;
      })
      .filter((n) => n > 0);
    const max = numbers.length > 0 ? Math.max(...numbers) : 27;
    const next = max + 1;
    return `${prefix}${next.toString().padStart(4, '0')}`;
  }

  public createInvoice(payload: {
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
    paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';
    notes?: string;
    terms?: string;
  }): Invoice {
    let customer = this.data.customers.find((c) => c.id === payload.customerId);
    if (!customer) {
      // Create customer inline if not exists
      customer = this.createCustomer({
        name: payload.customerName || 'New Customer',
        phone: payload.customerPhone || '',
        email: payload.customerEmail,
        address: payload.customerAddress,
      });
    }

    const invoiceNumber = payload.invoiceNumber || this.getNextInvoiceNumber();

    // Calculate items
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    const items: InvoiceItem[] = payload.items.map((item, idx) => {
      const base = item.quantity * item.rate;
      const discount = base * ((item.discountPercent || 0) / 100);
      const afterDiscount = base - discount;
      const tax = afterDiscount * ((item.taxPercent || 0) / 100);
      const totalItemAmount = Math.round((afterDiscount + tax) * 100) / 100;

      subtotal += base;
      discountAmount += discount;
      taxAmount += tax;

      return {
        id: `item-${Date.now()}-${idx}`,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || 'Loads',
        rate: item.rate,
        discountPercent: item.discountPercent || 0,
        taxPercent: item.taxPercent || 0,
        amount: totalItemAmount,
      };
    });

    const grandTotal = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;
    const upfrontPaid = Math.min(Math.max(0, payload.paidAmount || 0), grandTotal);
    const balanceAmount = Math.round((grandTotal - upfrontPaid) * 100) / 100;

    let status: 'DRAFT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' = 'UNPAID';
    if (balanceAmount === 0) {
      status = 'PAID';
    } else if (upfrontPaid > 0) {
      status = 'PARTIALLY_PAID';
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (payload.dueDate < today) {
        status = 'OVERDUE';
      }
    }

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now().toString(36),
      invoiceNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      date: payload.date || new Date().toISOString().split('T')[0],
      dueDate: payload.dueDate,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      grandTotal,
      paidAmount: upfrontPaid,
      balanceAmount,
      status,
      notes: payload.notes || this.data.settings.defaultNotes,
      terms: payload.terms || this.data.settings.defaultTerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.invoices.unshift(newInvoice);

    // If upfront payment was made, record payment transaction
    if (upfrontPaid > 0) {
      const pay: Payment = {
        id: 'pay-' + Date.now().toString(36),
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        customerId: customer.id,
        customerName: customer.name,
        amount: upfrontPaid,
        date: newInvoice.date,
        paymentMethod: payload.paymentMethod || 'Cash',
        notes: 'Initial payment upon bill creation',
        createdAt: new Date().toISOString(),
      };
      this.data.payments.unshift(pay);
    }

    // Auto update customer ledger
    this.recalculateCustomer(customer.id);

    // Add activity log
    this.logActivity(
      'Bill Created',
      `Created bill ${newInvoice.invoiceNumber} for ${customer.name} (Total: ${this.data.settings.currencySymbol}${grandTotal})`,
      'INVOICE',
      newInvoice.id,
      grandTotal
    );

    // Overdue or payment notification check
    if (newInvoice.status === 'OVERDUE') {
      this.addNotification({
        type: 'PAYMENT_OVERDUE',
        title: `Payment Overdue: ${customer.name}`,
        message: `${this.data.settings.currencySymbol}${newInvoice.balanceAmount} pending against ${newInvoice.invoiceNumber}`,
        link: '/reminders',
      });
    }

    this.persist();
    return newInvoice;
  }

  public deleteInvoice(id: string): boolean {
    const idx = this.data.invoices.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    const inv = this.data.invoices[idx];
    const customerId = inv.customerId;

    // Remove invoice
    this.data.invoices.splice(idx, 1);
    // Remove linked payments
    this.data.payments = this.data.payments.filter((p) => p.invoiceId !== id);

    this.recalculateCustomer(customerId);
    this.logActivity('Bill Deleted', `Deleted bill ${inv.invoiceNumber} for ${inv.customerName}`, 'INVOICE', id);
    this.persist();
    return true;
  }

  // --- PAYMENTS ---
  public getPayments(): Payment[] {
    return this.data.payments;
  }

  public createPayment(payload: {
    invoiceId: string;
    amount: number;
    date: string;
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';
    referenceNumber?: string;
    notes?: string;
  }): { payment: Payment; invoice: Invoice } {
    const invoice = this.data.invoices.find((i) => i.id === payload.invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (payload.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (payload.amount > invoice.balanceAmount) {
      throw new Error(
        `Payment amount (${this.data.settings.currencySymbol}${payload.amount}) cannot exceed outstanding balance (${this.data.settings.currencySymbol}${invoice.balanceAmount})`
      );
    }

    const newPayment: Payment = {
      id: 'pay-' + Date.now().toString(36),
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      amount: payload.amount,
      date: payload.date || new Date().toISOString().split('T')[0],
      paymentMethod: payload.paymentMethod,
      referenceNumber: payload.referenceNumber?.trim(),
      notes: payload.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    this.data.payments.unshift(newPayment);

    // Update invoice paid & balance
    invoice.paidAmount = Math.round((invoice.paidAmount + payload.amount) * 100) / 100;
    invoice.balanceAmount = Math.round((invoice.grandTotal - invoice.paidAmount) * 100) / 100;

    if (invoice.balanceAmount <= 0) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTIALLY_PAID';
    }
    invoice.updatedAt = new Date().toISOString();

    // Recalculate customer
    this.recalculateCustomer(invoice.customerId);

    // Activity log
    this.logActivity(
      'Payment Received',
      `Received ${this.data.settings.currencySymbol}${payload.amount} from ${invoice.customerName} for ${invoice.invoiceNumber} (${payload.paymentMethod})`,
      'PAYMENT',
      newPayment.id,
      payload.amount
    );

    // Notification
    this.addNotification({
      type: invoice.status === 'PAID' ? 'INVOICE_PAID' : 'PAYMENT_RECEIVED',
      title: invoice.status === 'PAID' ? `Invoice Fully Paid: ${invoice.invoiceNumber}` : `Payment Received: ${this.data.settings.currencySymbol}${payload.amount}`,
      message: `${invoice.customerName} settled ${this.data.settings.currencySymbol}${payload.amount}. Remaining balance: ${this.data.settings.currencySymbol}${invoice.balanceAmount}`,
      link: '/payments',
    });

    this.persist();
    return { payment: newPayment, invoice };
  }

  public markInvoicePaid(
    invoiceId: string,
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other' = 'Cash',
    notes?: string
  ): { payment: Payment; invoice: Invoice } {
    const invoice = this.data.invoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.balanceAmount <= 0) {
      const existing = this.data.payments.find((p) => p.invoiceId === invoiceId) || {
        id: 'pay-' + Date.now().toString(36),
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        amount: invoice.grandTotal,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        notes: 'Already settled',
        createdAt: new Date().toISOString(),
      };
      return { payment: existing, invoice };
    }

    return this.createPayment({
      invoiceId: invoice.id,
      amount: invoice.balanceAmount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes: notes || 'Marked Paid (தந்துட்டாங்க) in Revenue & Balance Due',
    });
  }

  public deletePayment(id: string): boolean {
    const idx = this.data.payments.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const payment = this.data.payments[idx];
    const invoice = this.data.invoices.find((i) => i.id === payment.invoiceId);

    if (invoice) {
      invoice.paidAmount = Math.max(0, invoice.paidAmount - payment.amount);
      invoice.balanceAmount = Math.round((invoice.grandTotal - invoice.paidAmount) * 100) / 100;
      if (invoice.balanceAmount >= invoice.grandTotal) {
        invoice.status = 'UNPAID';
      } else if (invoice.balanceAmount > 0) {
        invoice.status = 'PARTIALLY_PAID';
      } else {
        invoice.status = 'PAID';
      }
      invoice.updatedAt = new Date().toISOString();
      this.recalculateCustomer(invoice.customerId);
    }

    this.data.payments.splice(idx, 1);
    this.logActivity('Payment Voided', `Voided payment ${payment.amount} for ${payment.invoiceNumber}`, 'PAYMENT', id);
    this.persist();
    return true;
  }

  // --- EXPENSES ---
  public getExpenses(): Expense[] {
    return this.data.expenses;
  }

  public createExpense(payload: {
    title: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other';
    vendor?: string;
    description?: string;
    isRecurring?: boolean;
    recurringExpenseId?: string;
  }): Expense {
    if (payload.amount <= 0) {
      throw new Error('Expense amount must be greater than zero');
    }

    const newExpense: Expense = {
      id: 'exp-' + Date.now().toString(36),
      title: payload.title.trim(),
      amount: payload.amount,
      category: payload.category.trim(),
      date: payload.date || new Date().toISOString().split('T')[0],
      paymentMethod: payload.paymentMethod,
      vendor: payload.vendor?.trim(),
      description: payload.description?.trim(),
      isRecurring: payload.isRecurring,
      recurringExpenseId: payload.recurringExpenseId,
      createdAt: new Date().toISOString(),
    };

    this.data.expenses.unshift(newExpense);

    this.logActivity(
      'Expense Logged',
      `Logged expense ${this.data.settings.currencySymbol}${payload.amount} for ${payload.title} (${payload.category})`,
      'EXPENSE',
      newExpense.id,
      payload.amount
    );

    if (payload.amount >= 10000) {
      this.addNotification({
        type: 'LARGE_EXPENSE',
        title: `High Expense: ${this.data.settings.currencySymbol}${payload.amount}`,
        message: `High value expense logged for ${payload.title} (${payload.category})`,
        link: '/expenses',
      });
    }

    this.persist();
    return newExpense;
  }

  public deleteExpense(id: string): boolean {
    const idx = this.data.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    const exp = this.data.expenses[idx];
    this.data.expenses.splice(idx, 1);
    this.logActivity('Expense Deleted', `Deleted expense ${exp.title} (${exp.amount})`, 'EXPENSE', id);
    this.persist();
    return true;
  }

  // --- RECURRING EXPENSES ---
  public getRecurringExpenses(): RecurringExpense[] {
    return this.data.recurringExpenses;
  }

  public createRecurringExpense(payload: {
    title: string;
    amount: number;
    category: string;
    frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
    startDate: string;
    nextDueDate: string;
    vendor?: string;
    notes?: string;
  }): RecurringExpense {
    const newRec: RecurringExpense = {
      id: 'rec-' + Date.now().toString(36),
      title: payload.title.trim(),
      amount: payload.amount,
      category: payload.category.trim(),
      frequency: payload.frequency,
      startDate: payload.startDate,
      nextDueDate: payload.nextDueDate,
      vendor: payload.vendor?.trim(),
      active: true,
      notes: payload.notes?.trim(),
      createdAt: new Date().toISOString(),
    };
    this.data.recurringExpenses.unshift(newRec);
    this.persist();
    return newRec;
  }

  public deleteRecurringExpense(id: string): boolean {
    const idx = this.data.recurringExpenses.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.data.recurringExpenses.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- REMINDERS & NOTIFICATIONS ---
  public getReminders(): Reminder[] {
    const today = new Date().toISOString().split('T')[0];
    const unpaidInvoices = this.data.invoices.filter((i) => i.balanceAmount > 0);

    return unpaidInvoices.map((inv) => {
      const dueDate = new Date(inv.dueDate);
      const nowDate = new Date(today);
      const diffTime = nowDate.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let status: 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' = 'UPCOMING';
      if (diffDays > 0) {
        status = 'OVERDUE';
      } else if (diffDays === 0) {
        status = 'DUE_TODAY';
      }

      return {
        id: 'rem-' + inv.id,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customerName: inv.customerName,
        customerPhone: inv.customerPhone || '+91 XXXXX XXXXX',
        customerEmail: inv.customerEmail,
        amount: inv.balanceAmount,
        dueDate: inv.dueDate,
        daysOverdue: Math.max(0, diffDays),
        status,
        createdAt: inv.createdAt,
      };
    });
  }

  public getNotifications(): NotificationItem[] {
    return this.data.notifications;
  }

  public markNotificationRead(id: string): void {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist();
    }
  }

  public clearNotifications(): void {
    this.data.notifications = [];
    this.persist();
  }

  private addNotification(item: Omit<NotificationItem, 'id' | 'date' | 'read'>) {
    const notif: NotificationItem = {
      id: 'notif-' + Date.now().toString(36),
      ...item,
      date: new Date().toISOString().split('T')[0],
      read: false,
    };
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 30) {
      this.data.notifications.pop();
    }
  }

  private logActivity(action: string, description: string, entityType: 'INVOICE' | 'PAYMENT' | 'CUSTOMER' | 'EXPENSE', entityId: string, amount?: number) {
    const log: ActivityLog = {
      id: 'act-' + Date.now().toString(36),
      action,
      description,
      entityType,
      entityId,
      amount,
      timestamp: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 50) {
      this.data.activityLogs.pop();
    }
  }

  public getActivityLogs(): ActivityLog[] {
    return this.data.activityLogs;
  }

  // --- DASHBOARD AGGREGATES ---
  public getDashboardMetrics(): DashboardMetrics {
    const today = new Date().toISOString().split('T')[0];

    // Today's Sales = sum of invoices created today
    const todaySales = this.data.invoices
      .filter((i) => i.date === today)
      .reduce((sum, i) => sum + i.grandTotal, 0);

    // Total Amount Received = all payments sum
    const amountReceived = this.data.payments.reduce((sum, p) => sum + p.amount, 0);

    // Total Expenses = sum of all expenses
    const expenses = this.data.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Total Pending = sum of balanceAmount of all invoices
    const pendingBalance = this.data.invoices.reduce((sum, i) => sum + i.balanceAmount, 0);

    // Net Profit = Amount Received - Expenses (As specified in prompt!)
    const netProfit = amountReceived - expenses;

    // Estimated Profit = Total Sales - Expenses (Optional accounting view as requested in prompt)
    const totalSales = this.data.invoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const estimatedProfit = totalSales - expenses;

    // Monthly chart generation (Past 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const revenueVsExpenseChart: DashboardMetrics['revenueVsExpenseChart'] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      const prefix = `${y}-${(mIdx + 1).toString().padStart(2, '0')}`;
      const mLabel = `${monthNames[mIdx]} ${y}`;

      const mRevenue = this.data.payments
        .filter((p) => p.date.startsWith(prefix))
        .reduce((sum, p) => sum + p.amount, 0);

      const mExpense = this.data.expenses
        .filter((e) => e.date.startsWith(prefix))
        .reduce((sum, e) => sum + e.amount, 0);

      revenueVsExpenseChart.push({
        month: mLabel,
        revenue: mRevenue,
        expenses: mExpense,
        profit: mRevenue - mExpense,
      });
    }

    // Top customers sorted by total business
    const topCustomers = [...this.data.customers]
      .sort((a, b) => b.totalBusiness - a.totalBusiness)
      .slice(0, 5);

    // Expense category breakdown
    const categoryTotals: Record<string, number> = {};
    for (const exp of this.data.expenses) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    }
    const expenseCategoryChart = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: expenses > 0 ? Math.round((amount / expenses) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalBilled: totalSales,
      todaySales,
      amountReceived,
      expenses,
      pendingBalance,
      netProfit,
      estimatedProfit,
      totalCustomers: this.data.customers.length,
      totalInvoices: this.data.invoices.length,
      revenueVsExpenseChart,
      expenseCategoryChart,
      recentBills: this.data.invoices.slice(0, 5),
      recentPayments: this.data.payments.slice(0, 5),
      pendingInvoices: this.data.invoices.filter((i) => i.balanceAmount > 0).slice(0, 5),
      upcomingReminders: this.getReminders().slice(0, 5),
      topCustomers,
      recentActivity: this.data.activityLogs.slice(0, 8),
    };
  }
}

export const db = new LedgerDatabase();
