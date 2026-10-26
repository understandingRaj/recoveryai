import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  importInvoicesCsv
} from '../controllers/invoiceController.js';
import { recordPayment, getInvoicePayments } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/import-csv', importInvoicesCsv);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

// Payment endpoints under invoice
router.route('/:id/payments')
  .post(recordPayment)
  .get(getInvoicePayments);

export default router;
