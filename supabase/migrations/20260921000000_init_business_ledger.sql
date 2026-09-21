-- ==============================================================================
-- BUSINESS LEDGER DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    owner_name TEXT,
    tagline TEXT DEFAULT 'Billing • Customers • Expenses • Payments • Profit',
    phone TEXT,
    email TEXT,
    address TEXT,
    gst_number TEXT,
    currency_symbol TEXT DEFAULT '₹',
    currency_code TEXT DEFAULT 'INR',
    invoice_prefix TEXT DEFAULT 'INV-',
    financial_year TEXT DEFAULT '2026-2027',
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    default_terms TEXT,
    default_notes TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    notes TEXT,
    total_business NUMERIC(12, 2) DEFAULT 0.00,
    amount_received NUMERIC(12, 2) DEFAULT 0.00,
    pending_balance NUMERIC(12, 2) DEFAULT 0.00,
    bills_count INTEGER DEFAULT 0,
    last_payment_date DATE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE')),
    notes TEXT,
    terms TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_business_invoice_num UNIQUE (business_id, invoice_number)
);

-- 5. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) DEFAULT 0.00,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other')),
    reference_number TEXT,
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Expense Categories Table
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    date DATE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other')),
    vendor TEXT,
    description TEXT,
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_expense_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Recurring Expenses Table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('Weekly', 'Monthly', 'Quarterly', 'Yearly')),
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    vendor TEXT,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    amount NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for high-speed searches
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers (business_id, name, phone, email);
CREATE INDEX IF NOT EXISTS idx_invoices_lookup ON invoices (business_id, customer_id, date, status);
CREATE INDEX IF NOT EXISTS idx_payments_lookup ON payments (business_id, invoice_id, customer_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_lookup ON expenses (business_id, date, category);

-- Row Level Security (RLS) Enablement
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
