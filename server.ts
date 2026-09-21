import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Dashboard metrics
  app.get('/api/dashboard', (req, res) => {
    try {
      const metrics = db.getDashboardMetrics();
      res.json(metrics);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to compute dashboard' });
    }
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Customers
  app.get('/api/customers', (req, res) => {
    const search = (req.query.search as string)?.toLowerCase();
    let list = db.getCustomers();
    if (search) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.includes(search) ||
          (c.email && c.email.toLowerCase().includes(search))
      );
    }
    res.json(list);
  });

  app.get('/api/customers/:id', (req, res) => {
    const details = db.getCustomer(req.params.id);
    if (!details) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(details);
  });

  app.post('/api/customers', (req, res) => {
    try {
      const created = db.createCustomer(req.body);
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/customers/:id', (req, res) => {
    try {
      const updated = db.updateCustomer(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Customer not found' });
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/customers/:id', (req, res) => {
    try {
      const success = db.deleteCustomer(req.params.id);
      if (!success) return res.status(404).json({ error: 'Customer not found' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Invoices
  app.get('/api/invoices', (req, res) => {
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    let list = db.getInvoices();

    if (status && status !== 'ALL') {
      list = list.filter((i) => i.status === status);
    }
    if (customerId) {
      list = list.filter((i) => i.customerId === customerId);
    }
    res.json(list);
  });

  app.get('/api/invoices/next-number', (req, res) => {
    res.json({ nextInvoiceNumber: db.getNextInvoiceNumber() });
  });

  app.post('/api/invoices', (req, res) => {
    try {
      const created = db.createInvoice(req.body);
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to create invoice' });
    }
  });

  app.post('/api/invoices/:id/mark-paid', (req, res) => {
    try {
      const { paymentMethod, notes } = req.body || {};
      const result = db.markInvoicePaid(req.params.id, paymentMethod, notes);
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to mark invoice as paid' });
    }
  });

  app.delete('/api/invoices/:id', (req, res) => {
    try {
      const success = db.deleteInvoice(req.params.id);
      if (!success) return res.status(404).json({ error: 'Invoice not found' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Payments
  app.get('/api/payments', (req, res) => {
    res.json(db.getPayments());
  });

  app.post('/api/payments', (req, res) => {
    try {
      const result = db.createPayment(req.body);
      res.status(201).json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to record payment' });
    }
  });

  app.delete('/api/payments/:id', (req, res) => {
    try {
      const success = db.deletePayment(req.params.id);
      if (!success) return res.status(404).json({ error: 'Payment not found' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Expenses
  app.get('/api/expenses', (req, res) => {
    const category = req.query.category as string;
    const date = req.query.date as string;
    let list = db.getExpenses();
    if (category && category !== 'ALL') {
      list = list.filter((e) => e.category === category);
    }
    if (date) {
      list = list.filter((e) => e.date === date);
    }
    res.json(list);
  });

  app.post('/api/expenses', (req, res) => {
    try {
      const created = db.createExpense(req.body);
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to log expense' });
    }
  });

  app.delete('/api/expenses/:id', (req, res) => {
    try {
      const success = db.deleteExpense(req.params.id);
      if (!success) return res.status(404).json({ error: 'Expense not found' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Recurring Expenses
  app.get('/api/recurring-expenses', (req, res) => {
    res.json(db.getRecurringExpenses());
  });

  app.post('/api/recurring-expenses', (req, res) => {
    try {
      const created = db.createRecurringExpense(req.body);
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/recurring-expenses/:id', (req, res) => {
    try {
      const success = db.deleteRecurringExpense(req.params.id);
      if (!success) return res.status(404).json({ error: 'Recurring expense not found' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Reminders & Notifications
  app.get('/api/reminders', (req, res) => {
    res.json(db.getReminders());
  });

  app.get('/api/notifications', (req, res) => {
    res.json(db.getNotifications());
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    db.markNotificationRead(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/notifications/clear', (req, res) => {
    db.clearNotifications();
    res.json({ success: true });
  });

  // Backup & Demo reset
  app.get('/api/backup/export', (req, res) => {
    res.json(db.exportBackup());
  });

  app.post('/api/backup/import', (req, res) => {
    const ok = db.importBackup(req.body);
    if (!ok) return res.status(400).json({ error: 'Invalid backup file structure' });
    res.json({ success: true });
  });

  app.post('/api/seed/reset', (req, res) => {
    const data = db.resetToDemo();
    res.json({ success: true, data });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Business Ledger server running on port ${PORT}`);
  });
}

startServer();
