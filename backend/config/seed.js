import Business from '../models/Business.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import FollowUp from '../models/FollowUp.js';
import Activity from '../models/Activity.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    const businessCount = await Business.countDocuments();
    if (businessCount > 0) {
      return; // Already populated
    }

    console.log('[Seed] Seeding initial baseline tenant data into MongoDB...');

    // 1. Business
    const business = await Business.create({
      name: 'Apex FinTech Solutions',
      legalName: 'Apex FinTech Solutions Pvt. Ltd.',
      email: 'billing@apexfintech.in',
      phone: '+91 98200 54321',
      address: '402, Cyber Tower B, Sector 62, Gurugram, Haryana 122002',
      currency: 'INR',
      currencySymbol: '₹',
      gstNumber: '07AAAAA0000A1Z5',
      defaultReminderTone: 'Professional',
      reminderSchedule: '3 days before due, on due date, 7 days overdue',
      preferredChannel: 'Email',
      aiProvider: 'OpenAI (GPT-4o)',
      safePlaceholders: true
    });

    // 2. User
    const user = await User.create({
      businessId: business._id,
      name: 'Alex Vance',
      email: 'alex@apexfintech.in',
      password: 'Password123!',
      role: 'Finance Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
    });

    // 3. Customers
    const customersData = [
      {
        businessId: business._id,
        name: 'Rahul Verma',
        company: 'Acme Technologies',
        email: 'rahul@acmetech.in',
        phone: '+91 98201 12345',
        address: 'DLF CyberCity, Phase 2, Gurugram, Haryana',
        paymentTerms: 'Net 30',
        notes: 'Enterprise account. Requires PO reference.',
        status: 'Active'
      },
      {
        businessId: business._id,
        name: 'Priya Sharma',
        company: 'Bright Solutions',
        email: 'priya@brightsol.com',
        phone: '+91 98112 56789',
        address: 'Indiranagar 100ft Road, Bengaluru, Karnataka',
        paymentTerms: 'Net 15',
        notes: 'Prompt payer. Electronic bank transfer.',
        status: 'Active'
      },
      {
        businessId: business._id,
        name: 'Amit Patel',
        company: 'Nova Enterprises',
        email: 'amit@novaenterprises.co',
        phone: '+91 98450 67890',
        address: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra',
        paymentTerms: 'Net 30',
        notes: 'Requires dual approvals.',
        status: 'Active'
      },
      {
        businessId: business._id,
        name: 'Sneha Roy',
        company: 'BluePeak Digital',
        email: 'sneha@bluepeak.io',
        phone: '+91 97170 34567',
        address: 'Salt Lake Sector V, Kolkata, West Bengal',
        paymentTerms: 'Net 45',
        notes: 'Digital agency partner.',
        status: 'Active'
      },
      {
        businessId: business._id,
        name: 'Vikram Singh',
        company: 'Greenfield Traders',
        email: 'vikram@greenfieldtraders.in',
        phone: '+91 98300 89012',
        address: 'Industrial Area Phase 1, Chandigarh',
        paymentTerms: 'Net 15',
        notes: 'Prefers UPI & WhatsApp reminders.',
        status: 'Active'
      }
    ];

    const createdCustomers = await Customer.insertMany(customersData);

    // 4. Invoices
    const invoicesData = [
      {
        businessId: business._id,
        customerId: createdCustomers[0]._id,
        customerName: 'Acme Technologies',
        customerEmail: 'rahul@acmetech.in',
        invoiceNumber: 'INV-2026-089',
        invoiceDate: new Date('2026-09-01'),
        dueDate: new Date('2026-10-01'),
        totalAmount: 200000,
        amountPaid: 0,
        notes: 'Enterprise platform infrastructure annual subscription'
      },
      {
        businessId: business._id,
        customerId: createdCustomers[2]._id,
        customerName: 'Nova Enterprises',
        customerEmail: 'amit@novaenterprises.co',
        invoiceNumber: 'INV-2026-092',
        invoiceDate: new Date('2026-09-15'),
        dueDate: new Date('2026-10-15'),
        totalAmount: 150000,
        amountPaid: 0,
        notes: 'API integration sprint and data synchronization pipeline'
      },
      {
        businessId: business._id,
        customerId: createdCustomers[3]._id,
        customerName: 'BluePeak Digital',
        customerEmail: 'sneha@bluepeak.io',
        invoiceNumber: 'INV-2026-098',
        invoiceDate: new Date('2026-10-01'),
        dueDate: new Date('2026-11-15'),
        totalAmount: 210000,
        amountPaid: 0,
        notes: 'Digital commerce optimization and analytics tracking'
      },
      {
        businessId: business._id,
        customerId: createdCustomers[4]._id,
        customerName: 'Greenfield Traders',
        customerEmail: 'vikram@greenfieldtraders.in',
        invoiceNumber: 'INV-2026-104',
        invoiceDate: new Date('2026-10-10'),
        dueDate: new Date('2026-10-25'),
        totalAmount: 82500,
        amountPaid: 0,
        notes: 'Inventory management gateway deployment'
      },
      {
        businessId: business._id,
        customerId: createdCustomers[1]._id,
        customerName: 'Bright Solutions',
        customerEmail: 'priya@brightsol.com',
        invoiceNumber: 'INV-2026-081',
        invoiceDate: new Date('2026-08-20'),
        dueDate: new Date('2026-09-05'),
        totalAmount: 170000,
        amountPaid: 170000,
        notes: 'Cloud migration sprints retainer - Settled in full'
      }
    ];

    for (const inv of invoicesData) {
      await Invoice.create(inv);
    }

    // 5. Follow-ups
    await FollowUp.create({
      businessId: business._id,
      customerId: createdCustomers[0]._id,
      customerName: 'Acme Technologies',
      invoiceNumber: 'INV-2026-089',
      amountDue: 200000,
      scheduledDate: new Date(),
      priority: 'High',
      channel: 'Email',
      message: 'Reminder for overdue invoice INV-2026-089 (₹2,00,000)',
      status: 'Pending'
    });

    console.log('[Seed] Database successfully populated with initial demo records.');
  } catch (err) {
    console.warn('[Seed] Notice during seed check:', err.message);
  }
};
