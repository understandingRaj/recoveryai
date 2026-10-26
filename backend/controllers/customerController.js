import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import Activity from '../models/Activity.js';

// @desc    Get all customers for tenant
// @route   GET /api/customers
export const getCustomers = async (req, res) => {
  const { search, terms, status } = req.query;
  const query = { businessId: req.businessId };

  if (search) {
    query.$or = [
      { company: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (terms && terms !== 'All') {
    query.paymentTerms = terms;
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  const customers = await Customer.find(query).sort({ company: 1 });

  // Calculate live balances from invoices
  const customerIds = customers.map((c) => c._id);
  const invoices = await Invoice.find({ businessId: req.businessId, customerId: { $in: customerIds } });

  const enriched = customers.map((c) => {
    const custInvoices = invoices.filter((i) => String(i.customerId) === String(c._id));
    const totalInvoiced = custInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = custInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalOutstanding = custInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
    const totalOverdue = custInvoices
      .filter((inv) => inv.status === 'Overdue')
      .reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

    return {
      ...c.toObject(),
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      totalOverdue
    };
  });

  res.json({
    success: true,
    count: enriched.length,
    data: enriched
  });
};

// @desc    Get single customer
// @route   GET /api/customers/:id
export const getCustomerById = async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const invoices = await Invoice.find({ businessId: req.businessId, customerId: customer._id }).sort({ dueDate: -1 });

  res.json({
    success: true,
    data: customer,
    invoices
  });
};

// @desc    Create new customer
// @route   POST /api/customers
export const createCustomer = async (req, res) => {
  const { name, company, email, phone, address, paymentTerms, notes } = req.body;

  if (!company && !name) {
    return res.status(400).json({ message: 'Company or Contact Name is required' });
  }

  const customer = await Customer.create({
    businessId: req.businessId,
    name: name || '',
    company: company || name,
    email: email || '',
    phone: phone || '',
    address: address || '',
    paymentTerms: paymentTerms || 'Net 30',
    notes: notes || ''
  });

  await Activity.create({
    businessId: req.businessId,
    type: 'customer_added',
    description: `Added client account ${customer.company}`,
    customerName: customer.company,
    user: req.user?.name || 'Alex Vance',
    status: 'completed'
  });

  res.status(201).json({
    success: true,
    data: customer
  });
};

// @desc    Update customer
// @route   PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
  let customer = await Customer.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  await Activity.create({
    businessId: req.businessId,
    type: 'customer_updated',
    description: `Updated customer details for ${customer.company}`,
    customerName: customer.company,
    user: req.user?.name || 'Alex Vance',
    status: 'completed'
  });

  res.json({
    success: true,
    data: customer
  });
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
export const deleteCustomer = async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  await customer.deleteOne();

  await Activity.create({
    businessId: req.businessId,
    type: 'customer_deleted',
    description: `Removed customer record for ${customer.company}`,
    customerName: customer.company,
    user: req.user?.name || 'Alex Vance',
    status: 'completed'
  });

  res.json({
    success: true,
    message: 'Customer removed successfully'
  });
};
