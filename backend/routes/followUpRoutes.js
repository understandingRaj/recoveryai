import express from 'express';
import {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  updateFollowUpStatus
} from '../controllers/followUpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFollowUps)
  .post(createFollowUp);

router.route('/:id')
  .put(updateFollowUp);

router.patch('/:id/status', updateFollowUpStatus);

export default router;
