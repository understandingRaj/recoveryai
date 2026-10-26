import express from 'express';
import {
  getDashboardSummary,
  getCollectionTrend,
  getReceivablesReport
} from '../controllers/reportController.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Dashboard summary and trend endpoints
router.get('/dashboard/summary', getDashboardSummary);
router.get('/dashboard/collection-trend', getCollectionTrend);
router.get('/reports/receivables', getReceivablesReport);

// Chronological Activity Feed
router.get('/activities', async (req, res) => {
  const { type, search } = req.query;
  const query = { businessId: req.businessId };

  if (type && type !== 'All') {
    query.type = type;
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { invoiceNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const activities = await Activity.find(query).sort({ timestamp: -1 }).limit(100);

  res.json({
    success: true,
    count: activities.length,
    data: activities
  });
});

export default router;
