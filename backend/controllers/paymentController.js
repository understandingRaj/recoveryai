import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Activity from '../models/Activity.js';
import { calculateRemainingAmount, computeInvoiceStatus, calculateDaysOverdue } from '../utils/invoiceCalculations.js';

// @desc    Record a payment against an invoice
// @route   POST /api/invoices/:id/payments
export const recordPayment = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const { amount, paymentDate, paymentMethod, reference, notes } = req.body;
  const payAmt = Number(amount);

  if (isNaN(payAmt) || payAmt <= 0) {
    return res.status(400).json({ message: 'Payment amount must be greater than zero' });
  }

  if (payAmt > invoice.remainingAmount) {
    return res.status(400).json({
      message: `Payment amount (₹${payAmt.toLocaleString('en-IN')}) cannot exceed remaining due amount (₹${invoice.remainingAmount.toLocaleString('en-IN')})`
    });
  }

  // Create payment record
  const payment = await Payment.create({
    businessId: req.businessId,
    invoiceId: invoice._id,
    customerId: invoice.customerId,
    amount: payAmt,
    paymentDate: paymentDate || new Date(),
    paymentMethod: paymentMethod || 'Bank Transfer',
    reference: reference || '',
    notes: notes || '',
    recordedBy: req.user?._id
  });

  // Recalculate invoice totals strictly on the backend
  invoice.amountPaid = Math.round((invoice.amountPaid + payAmt) * 100) / 100;
  invoice.remainingAmount = calculateRemainingAmount(invoice.totalAmount, invoice.amountPaid);
  invoice.status = computeInvoiceStatus(invoice.totalAmount, invoice.amountPaid, invoice.dueDate);
  invoice.daysOverdue = calculateDaysOverdue(invoice.dueDate, invoice.status);

  await invoice.save();

  // Audit activity log
  await Activity.create({
    businessId: req.businessId,
    type: 'payment_recorded',
    description: `Recorded payment of ₹${payAmt.toLocaleString('en-IN')} via ${paymentMethod || 'Bank Transfer'} for ${invoice.invoiceNumber}`,
    customerName: invoice.customerName,
    invoiceNumber: invoice.invoiceNumber,
    user: req.user?.name || 'Alex Vance',
    status: 'completed'
  });

  res.status(201).json({
    success: true,
    data: payment,
    invoice: {
      id: invoice._id,
      amountPaid: invoice.amountPaid,
      remainingAmount: invoice.remainingAmount,
      status: invoice.status,
      daysOverdue: invoice.daysOverdue
    }
  });
};

// @desc    Get all payment history for an invoice
// @route   GET /api/invoices/:id/payments
export const getInvoicePayments = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const payments = await Payment.find({ invoiceId: invoice._id, businessId: req.businessId }).sort({ paymentDate: -1 });

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
};
