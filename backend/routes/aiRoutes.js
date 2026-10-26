import express from 'express';
import rateLimit from 'express-rate-limit';
import { generateReminder } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiter for AI synthesis
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per 5 minutes
  message: { message: 'AI generation rate limit reached. Please wait a moment before generating more reminders.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.use(protect);

router.post('/generate-reminder', aiLimiter, generateReminder);

export default router;
