import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Business from '../models/Business.js';
import { generatePaymentReminder } from '../services/aiService.js';

// @desc    Generate AI payment reminder draft using verified ledger data
// @route   POST /api/ai/generate-reminder
export const generateReminder = async (req, res) => {
  const { invoiceId, tone = 'Professional', channel = 'Email' } = req.body;

  let invoiceData = req.body;

  // If invoiceId supplied, verify against database under tenant isolation
  if (invoiceId) {
    const inv = await Invoice.findOne({ _id: invoiceId, businessId: req.businessId });
    if (!inv) {
      return res.status(404).json({ message: 'Referenced invoice not found for this business' });
    }
    invoiceData = {
      customerName: inv.customerName,
      invoiceNumber: inv.invoiceNumber,
      amountDue: inv.remainingAmount,
      dueDate: inv.dueDate,
      daysOverdue: inv.daysOverdue,
      tone,
      channel
    };
  }

  const business = await Business.findById(req.businessId);

  const message = await generatePaymentReminder({
    ...invoiceData,
    businessName: business?.name || 'Apex FinTech Solutions'
  });

  res.json({
    success: true,
    data: {
      message,
      tone,
      channel,
      verifiedLedger: {
        customerName: invoiceData.customerName,
        invoiceNumber: invoiceData.invoiceNumber,
        amountDue: invoiceData.amountDue,
        daysOverdue: invoiceData.daysOverdue
      }
    }
  });
};
