import express from 'express';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// @desc    Get all payments for tenant
// @route   GET /api/payments
router.get('/', async (req, res) => {
  const payments = await Payment.find({ businessId: req.businessId })
    .populate('invoiceId', 'invoiceNumber customerName totalAmount')
    .sort({ paymentDate: -1 });

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});

export default router;
