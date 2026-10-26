import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Activity from '../models/Activity.js';
import { calculateRemainingAmount, computeInvoiceStatus, calculateDaysOverdue } from '../utils/invoiceCalculations.js';

// @desc    Get all invoices for tenant with filtering and search
// @route   GET /api/invoices
export const getInvoices = async (req, res) => {
  const { search, status, overduePeriod, sortField = 'dueDate', sortOrder = 'asc' } = req.query;
  const query = { businessId: req.businessId };

  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  const sort = {};
  sort[sortField] = sortOrder === 'desc' ? -1 : 1;

  let invoices = await Invoice.find(query).sort(sort);

  // Filter by aging period if requested
  if (overduePeriod && overduePeriod !== 'All') {
    invoices = invoices.filter((inv) => {
      if (overduePeriod === 'overdue') return inv.status === 'Overdue';
      if (overduePeriod === '1-30') return inv.daysOverdue >= 1 && inv.daysOverdue <= 30;
      if (overduePeriod === '31-60') return inv.daysOverdue >= 31 && inv.daysOverdue <= 60;
      if (overduePeriod === '60+') return inv.daysOverdue > 60;
      return true;
    });
  }

  res.json({
    success: true,
    count: invoices.length,
    data: invoices
  });
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  res.json({
    success: true,
    data: invoice
  });
};

// @desc    Create new invoice
// @route   POST /api/invoices
export const createInvoice = async (req, res) => {
  const { customerId, customerName, customerEmail, invoiceNumber, invoiceDate, dueDate, totalAmount, amountPaid, notes } = req.body;

  if (!customerName || !invoiceNumber || !dueDate || totalAmount === undefined) {
    return res.status(400).json({ message: 'Please provide customer name, invoice number, due date, and total amount' });
  }

  const parsedTotal = Number(totalAmount);
  const parsedPaid = Number(amountPaid) || 0;

  if (isNaN(parsedTotal) || parsedTotal <= 0) {
    return res.status(400).json({ message: 'Total amount must be a positive number' });
  }

  if (isNaN(parsedPaid) || parsedPaid < 0) {
    return res.status(400).json({ message: 'Amount paid cannot be negative' });
  }

  // Recalculate financial fields on backend
  const remainingAmount = calculateRemainingAmount(parsedTotal, parsedPaid);
  const status = computeInvoiceStatus(parsedTotal, parsedPaid, dueDate);
  const daysOverdue = calculateDaysOverdue(dueDate, status);

  const invoice = await Invoice.create({
    businessId: req.businessId,
    customerId,
    customerName,
    customerEmail: customerEmail || '',
    invoiceNumber,
    invoiceDate: invoiceDate || new Date(),
    dueDate,
    totalAmount: parsedTotal,
    amountPaid: parsedPaid,
    remainingAmount,
    status,
    daysOverdue,
    notes: notes || ''
  });

  await Activity.create({
    businessId: req.businessId,
    type: 'invoice_created',
    description: `Created invoice ${invoice.invoiceNumber} for ₹${parsedTotal.toLocaleString('en-IN')}`,
    customerName: invoice.customerName,
    invoiceNumber: invoice.invoiceNumber,
    user: req.user?.name || 'Alex Vance',
    status: 'completed'
  });

  res.status(201).json({
    success: true,
    data: invoice
  });
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
export const updateInvoice = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const { customerName, customerEmail, invoiceNumber, invoiceDate, dueDate, totalAmount, amountPaid, notes } = req.body;

  if (totalAmount !== undefined) {
    const parsedTotal = Number(totalAmount);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      return res.status(400).json({ message: 'Total amount must be positive' });
    }
    invoice.totalAmount = parsedTotal;
  }

  if (amountPaid !== undefined) {
    const parsedPaid = Number(amountPaid);
    if (isNaN(parsedPaid) || parsedPaid < 0) {
      return res.status(400).json({ message: 'Amount paid cannot be negative' });
    }
    invoice.amountPaid = parsedPaid;
  }

  if (customerName) invoice.customerName = customerName;
  if (customerEmail !== undefined) invoice.customerEmail = customerEmail;
  if (invoiceNumber) invoice.invoiceNumber = invoiceNumber;
  if (invoiceDate) invoice.invoiceDate = invoiceDate;
  if (dueDate) invoice.dueDate = dueDate;
  if (notes !== undefined) invoice.notes = notes;

  // Recalculate
  invoice.remainingAmount = calculateRemainingAmount(invoice.totalAmount, invoice.amountPaid);
  invoice.status = computeInvoiceStatus(invoice.totalAmount, invoice.amountPaid, invoice.dueDate);
  invoice.daysOverdue = calculateDaysOverdue(invoice.dueDate, invoice.status);

  await invoice.save();

  await Activity.create({
    businessId: req.businessId,
    type: 'invoice_updated',
    description: `Updated invoice ${invoice.invoiceNumber}`,
    customerName: invoice.customerName,
    invoiceNumber: invoice.invoiceNumber,
    user: req.user?.name || 'Alex Vance',
    status: 'completed'
  });

  res.json({
    success: true,
    data: invoice
  });
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
export const deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const invNum = invoice.invoiceNumber;
  const custName = invoice.customerName;

  await invoice.deleteOne();

  await Activity.create({
    businessId: req.businessId,
    type: 'invoice_deleted',
    description: `Deleted invoice ${invNum}`,
    customerName: custName,
    invoiceNumber: invNum,
    user: req.user?.name || 'Alex Vance',
    status: 'completed'
  });

  res.json({
    success: true,
    message: 'Invoice deleted successfully'
  });
};

// @desc    Import multiple invoices from CSV parsed payload
// @route   POST /api/invoices/import-csv
export const importInvoicesCsv = async (req, res) => {
  const { invoices } = req.body;

  if (!Array.isArray(invoices) || invoices.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of invoice records to import' });
  }

  const createdRecords = [];

  for (const item of invoices) {
    const total = Number(item.totalAmount) || 0;
    const paid = Number(item.amountPaid) || 0;
    const dueDate = item.dueDate || new Date();

    if (total <= 0 || !item.invoiceNumber || !item.customerName) continue;

    const remaining = calculateRemainingAmount(total, paid);
    const status = computeInvoiceStatus(total, paid, dueDate);
    const daysOverdue = calculateDaysOverdue(dueDate, status);

    const doc = await Invoice.create({
      businessId: req.businessId,
      customerId: item.customerId,
      customerName: item.customerName,
      customerEmail: item.customerEmail || '',
      invoiceNumber: item.invoiceNumber,
      invoiceDate: item.invoiceDate || new Date(),
      dueDate,
      totalAmount: total,
      amountPaid: paid,
      remainingAmount: remaining,
      status,
      daysOverdue,
      notes: item.notes || 'Imported via CSV'
    });

    createdRecords.push(doc);
  }

  await Activity.create({
    businessId: req.businessId,
    type: 'invoice_created',
    description: `Batch imported ${createdRecords.length} invoices via CSV`,
    user: req.user?.name || 'Alex Vance',
    status: 'completed'
  });

  res.status(201).json({
    success: true,
    count: createdRecords.length,
    data: createdRecords
  });
};
