// Initial mock data matching RecoverAI specifications

export const initialBusiness = {
  id: 'biz_001',
  name: 'Apex FinTech Solutions',
  legalName: 'Apex FinTech Solutions Pvt. Ltd.',
  email: 'billing@apexfintech.in',
  phone: '+91 98200 54321',
  address: '402, Cyber Tower B, Sector 62, Gurugram, Haryana 122002',
  currency: 'INR',
  currencySymbol: '₹',
  gstNumber: '07AAAAA0000A1Z5',
  defaultReminderTone: 'Friendly',
  reminderSchedule: '3 days before due, on due date, 7 days overdue',
  preferredChannel: 'Email',
  aiProvider: 'OpenAI (GPT-4o)',
  safePlaceholders: true
};

export const initialUser = {
  id: 'usr_001',
  name: 'Alex Vance',
  email: 'alex@apexfintech.in',
  role: 'Finance Director',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
};

export const initialCustomers = [
  {
    id: 'cust_001',
    name: 'Rahul Verma',
    company: 'Acme Technologies',
    email: 'rahul@acmetech.in',
    phone: '+91 98201 12345',
    address: 'DLF CyberCity, Phase 2, Gurugram, Haryana',
    paymentTerms: 'Net 30',
    notes: 'Key enterprise client. Requires purchase order reference on invoices.',
    totalInvoiced: 480000,
    totalPaid: 280000,
    totalOutstanding: 200000,
    totalOverdue: 200000,
    lastContactDate: '2026-10-18',
    status: 'Active'
  },
  {
    id: 'cust_002',
    name: 'Priya Sharma',
    company: 'Bright Solutions',
    email: 'priya@brightsol.com',
    phone: '+91 98112 56789',
    address: 'Indiranagar 100ft Road, Bengaluru, Karnataka',
    paymentTerms: 'Net 15',
    notes: 'Prompt payer. Prefers electronic bank transfer.',
    totalInvoiced: 170000,
    totalPaid: 170000,
    totalOutstanding: 0,
    totalOverdue: 0,
    lastContactDate: '2026-10-10',
    status: 'Active'
  },
  {
    id: 'cust_003',
    name: 'Amit Patel',
    company: 'Nova Enterprises',
    email: 'amit@novaenterprises.co',
    phone: '+91 98450 67890',
    address: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra',
    paymentTerms: 'Net 30',
    notes: 'Regular buyer but accounts department takes extra approvals.',
    totalInvoiced: 345000,
    totalPaid: 195000,
    totalOutstanding: 150000,
    totalOverdue: 150000,
    lastContactDate: '2026-10-19',
    status: 'Active'
  },
  {
    id: 'cust_004',
    name: 'Sneha Roy',
    company: 'BluePeak Digital',
    email: 'sneha@bluepeak.io',
    phone: '+91 97170 34567',
    address: 'Salt Lake Sector V, Kolkata, West Bengal',
    paymentTerms: 'Net 45',
    notes: 'Digital agency partner. Quarterly consolidated payments.',
    totalInvoiced: 310000,
    totalPaid: 100000,
    totalOutstanding: 210000,
    totalOverdue: 0,
    lastContactDate: '2026-10-05',
    status: 'Active'
  },
  {
    id: 'cust_005',
    name: 'Vikram Singh',
    company: 'Greenfield Traders',
    email: 'vikram@greenfieldtraders.in',
    phone: '+91 98300 89012',
    address: 'Industrial Area Phase 1, Chandigarh',
    paymentTerms: 'Net 15',
    notes: 'Wholesale distributor. Needs automated SMS reminders.',
    totalInvoiced: 230000,
    totalPaid: 140000,
    totalOutstanding: 90000,
    totalOverdue: 90000,
    lastContactDate: '2026-10-14',
    status: 'Active'
  },
  {
    id: 'cust_006',
    name: 'Karan Malhotra',
    company: 'Zenith Logistics',
    email: 'karan@zenithlog.com',
    phone: '+91 98765 43210',
    address: 'MIDC Industrial Estate, Pune, Maharashtra',
    paymentTerms: 'Net 30',
    notes: 'Supply chain contracts. Good payment consistency.',
    totalInvoiced: 292500,
    totalPaid: 100000,
    totalOutstanding: 192500,
    totalOverdue: 0,
    lastContactDate: '2026-10-21',
    status: 'Active'
  }
];

export const initialInvoices = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust_001',
    customerName: 'Acme Technologies',
    contactPerson: 'Rahul Verma',
    customerEmail: 'rahul@acmetech.in',
    invoiceDate: '2026-08-25',
    dueDate: '2026-09-24',
    totalAmount: 320000,
    amountPaid: 120000,
    remainingAmount: 200000,
    status: 'Overdue',
    daysOverdue: 30,
    notes: 'Consulting and infrastructure audit Q3',
    items: [
      { description: 'Cloud Architecture Audit', quantity: 1, unitPrice: 200000, amount: 200000 },
      { description: 'Security Hardening Sprints', quantity: 2, unitPrice: 60000, amount: 120000 }
    ]
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust_002',
    customerName: 'Bright Solutions',
    contactPerson: 'Priya Sharma',
    customerEmail: 'priya@brightsol.com',
    invoiceDate: '2026-09-25',
    dueDate: '2026-10-10',
    totalAmount: 85000,
    amountPaid: 85000,
    remainingAmount: 0,
    status: 'Paid',
    daysOverdue: 0,
    notes: 'Monthly Retainer - September 2026',
    items: [
      { description: 'SaaS Monthly Maintenance', quantity: 1, unitPrice: 85000, amount: 85000 }
    ]
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2026-003',
    customerId: 'cust_003',
    customerName: 'Nova Enterprises',
    contactPerson: 'Amit Patel',
    customerEmail: 'amit@novaenterprises.co',
    invoiceDate: '2026-09-02',
    dueDate: '2026-10-02',
    totalAmount: 195000,
    amountPaid: 45000,
    remainingAmount: 150000,
    status: 'Overdue',
    daysOverdue: 22,
    notes: 'ERP Custom Integration Phase 2',
    items: [
      { description: 'Custom API Connector', quantity: 1, unitPrice: 120000, amount: 120000 },
      { description: 'Database Schema Migration', quantity: 1, unitPrice: 75000, amount: 75000 }
    ]
  },
  {
    id: 'inv_004',
    invoiceNumber: 'INV-2026-004',
    customerId: 'cust_004',
    customerName: 'BluePeak Digital',
    contactPerson: 'Sneha Roy',
    customerEmail: 'sneha@bluepeak.io',
    invoiceDate: '2026-09-20',
    dueDate: '2026-11-05',
    totalAmount: 210000,
    amountPaid: 0,
    remainingAmount: 210000,
    status: 'Pending',
    daysOverdue: 0,
    notes: 'Annual Analytics Platform License',
    items: [
      { description: 'Enterprise License (12 months)', quantity: 1, unitPrice: 210000, amount: 210000 }
    ]
  },
  {
    id: 'inv_005',
    invoiceNumber: 'INV-2026-005',
    customerId: 'cust_005',
    customerName: 'Greenfield Traders',
    contactPerson: 'Vikram Singh',
    customerEmail: 'vikram@greenfieldtraders.in',
    invoiceDate: '2026-09-27',
    dueDate: '2026-10-12',
    totalAmount: 140000,
    amountPaid: 50000,
    remainingAmount: 90000,
    status: 'Overdue',
    daysOverdue: 12,
    notes: 'Supply Chain Tracker Deployment',
    items: [
      { description: 'Hardware Gateway Setup', quantity: 2, unitPrice: 35000, amount: 70000 },
      { description: 'On-site training sessions', quantity: 2, unitPrice: 35000, amount: 70000 }
    ]
  },
  {
    id: 'inv_006',
    invoiceNumber: 'INV-2026-006',
    customerId: 'cust_006',
    customerName: 'Zenith Logistics',
    contactPerson: 'Karan Malhotra',
    customerEmail: 'karan@zenithlog.com',
    invoiceDate: '2026-10-15',
    dueDate: '2026-11-15',
    totalAmount: 192500,
    amountPaid: 0,
    remainingAmount: 192500,
    status: 'Pending',
    daysOverdue: 0,
    notes: 'Fleet Optimization Module Upgrade',
    items: [
      { description: 'Fleet Routing Engine License', quantity: 1, unitPrice: 192500, amount: 192500 }
    ]
  }
];

export const initialFollowUps = [
  {
    id: 'flw_001',
    customerId: 'cust_001',
    customerName: 'Acme Technologies',
    invoiceId: 'inv_001',
    invoiceNumber: 'INV-2026-001',
    amountDue: 200000,
    scheduledDate: '2026-10-24',
    priority: 'High',
    channel: 'Email',
    status: 'Pending',
    lastContactDate: '2026-10-18',
    message: 'Hello Rahul, I hope you are having a productive week. This is a gentle reminder that invoice INV-2026-001 for ₹2,00,000 was due on 24 Sep 2026 and is currently 30 days overdue. Could you kindly provide an update on the payment processing schedule? Thank you.',
    createdDate: '2026-10-19'
  },
  {
    id: 'flw_002',
    customerId: 'cust_003',
    customerName: 'Nova Enterprises',
    invoiceId: 'inv_003',
    invoiceNumber: 'INV-2026-003',
    amountDue: 150000,
    scheduledDate: '2026-10-24',
    priority: 'High',
    channel: 'WhatsApp',
    status: 'Pending',
    lastContactDate: '2026-10-19',
    message: 'Hi Amit, following up on our previous note regarding invoice INV-2026-003 for ₹1,50,000 (due 02 Oct 2026). Please let us know if you need any additional billing documentation from our side to expedite clearance.',
    createdDate: '2026-10-20'
  },
  {
    id: 'flw_003',
    customerId: 'cust_005',
    customerName: 'Greenfield Traders',
    invoiceId: 'inv_005',
    invoiceNumber: 'INV-2026-005',
    amountDue: 90000,
    scheduledDate: '2026-10-24',
    priority: 'Medium',
    channel: 'Phone Call',
    status: 'Pending',
    lastContactDate: '2026-10-14',
    message: 'Call Vikram Singh regarding pending ₹90,000 balance for Supply Chain Tracker Deployment (INV-2026-005).',
    createdDate: '2026-10-21'
  },
  {
    id: 'flw_004',
    customerId: 'cust_004',
    customerName: 'BluePeak Digital',
    invoiceId: 'inv_004',
    invoiceNumber: 'INV-2026-004',
    amountDue: 210000,
    scheduledDate: '2026-11-01',
    priority: 'Low',
    channel: 'Email',
    status: 'Upcoming',
    lastContactDate: '2026-10-05',
    message: 'Friendly advance reminder for invoice INV-2026-004 due on 05 Nov 2026.',
    createdDate: '2026-10-22'
  },
  {
    id: 'flw_005',
    customerId: 'cust_002',
    customerName: 'Bright Solutions',
    invoiceId: 'inv_002',
    invoiceNumber: 'INV-2026-002',
    amountDue: 0,
    scheduledDate: '2026-10-10',
    priority: 'Low',
    channel: 'Email',
    status: 'Completed',
    lastContactDate: '2026-10-10',
    message: 'Payment received confirmation and thank you note sent for INV-2026-002.',
    createdDate: '2026-10-08'
  }
];

export const initialActivities = [
  {
    id: 'act_001',
    type: 'payment_recorded',
    description: 'Recorded partial payment of ₹50,000 for INV-2026-005',
    customerName: 'Greenfield Traders',
    invoiceNumber: 'INV-2026-005',
    user: 'Alex Vance',
    timestamp: '2026-10-24T11:30:00Z',
    status: 'completed'
  },
  {
    id: 'act_002',
    type: 'reminder_drafted',
    description: 'AI drafted high-priority payment reminder for Acme Technologies',
    customerName: 'Acme Technologies',
    invoiceNumber: 'INV-2026-001',
    user: 'Alex Vance',
    timestamp: '2026-10-24T10:15:00Z',
    status: 'drafted'
  },
  {
    id: 'act_003',
    type: 'reminder_sent',
    description: 'Sent email reminder for invoice INV-2026-003',
    customerName: 'Nova Enterprises',
    invoiceNumber: 'INV-2026-003',
    user: 'Alex Vance',
    timestamp: '2026-10-23T16:45:00Z',
    status: 'delivered'
  },
  {
    id: 'act_004',
    type: 'invoice_created',
    description: 'Generated new invoice INV-2026-006 for ₹1,92,500',
    customerName: 'Zenith Logistics',
    invoiceNumber: 'INV-2026-006',
    user: 'Alex Vance',
    timestamp: '2026-10-15T09:20:00Z',
    status: 'completed'
  },
  {
    id: 'act_005',
    type: 'payment_recorded',
    description: 'Recorded full payment of ₹85,000 for INV-2026-002',
    customerName: 'Bright Solutions',
    invoiceNumber: 'INV-2026-002',
    user: 'Alex Vance',
    timestamp: '2026-10-10T14:10:00Z',
    status: 'completed'
  },
  {
    id: 'act_006',
    type: 'customer_added',
    description: 'Onboarded new enterprise client Zenith Logistics',
    customerName: 'Zenith Logistics',
    invoiceNumber: null,
    user: 'Alex Vance',
    timestamp: '2026-10-08T11:00:00Z',
    status: 'completed'
  }
];

export const initialRecommendations = [
  {
    id: 'rec_001',
    title: 'Acme Technologies overdue by 30 days',
    text: 'Acme Technologies has an invoice overdue by 30 days. Consider sending a polite payment reminder.',
    reason: 'Invoice INV-2026-001 for ₹2,00,000 has passed the standard 30-day grace period. Early reminder improves recovery probability by 42%.',
    priority: 'High',
    actionLabel: 'Draft Reminder',
    invoiceId: 'inv_001',
    customerId: 'cust_001'
  },
  {
    id: 'rec_002',
    title: 'Multiple overdue pattern detected',
    text: 'Three customers have multiple overdue invoices. Review their payment history before contacting them.',
    reason: 'Nova Enterprises and Greenfield Traders show recurring late payment cycles. Consider offering a structured installment plan.',
    priority: 'Medium',
    actionLabel: 'Review History',
    invoiceId: 'inv_003',
    customerId: 'cust_003'
  },
  {
    id: 'rec_003',
    title: 'Receivables concentration alert',
    text: 'Your outstanding receivables increased this month. Prioritize high-value overdue invoices.',
    reason: '28.5% of total receivables (₹2,40,000) are currently overdue, locking essential working capital for ongoing operations.',
    priority: 'Medium',
    actionLabel: 'View High-Value Invoices',
    invoiceId: 'inv_001',
    customerId: 'cust_001'
  }
];

export const collectionTrendData = [
  { month: 'May', collected: 280000, outstanding: 690000 },
  { month: 'Jun', collected: 310000, outstanding: 720000 },
  { month: 'Jul', collected: 345000, outstanding: 760000 },
  { month: 'Aug', collected: 295000, outstanding: 810000 },
  { month: 'Sep', collected: 320000, outstanding: 790000 },
  { month: 'Oct', collected: 365800, outstanding: 842500 }
];

export const agingBuckets = [
  { range: '0-30 Days', amount: 402500, count: 2, percentage: 48 },
  { range: '31-60 Days', amount: 350000, count: 2, percentage: 41 },
  { range: '61-90 Days', amount: 90000, count: 1, percentage: 11 },
  { range: '90+ Days', amount: 0, count: 0, percentage: 0 }
];
