import mongoose from 'mongoose';
import { calculateRemainingAmount, computeInvoiceStatus, calculateDaysOverdue } from '../utils/invoiceCalculations.js';

const invoiceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      index: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative']
    },
    remainingAmount: {
      type: Number,
      default: function () {
        return calculateRemainingAmount(this.totalAmount, this.amountPaid);
      }
    },
    daysOverdue: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Partially Paid', 'Overdue'],
      default: 'Pending'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Automatic recalculation hook on save
invoiceSchema.pre('save', function (next) {
  this.remainingAmount = calculateRemainingAmount(this.totalAmount, this.amountPaid);
  this.status = computeInvoiceStatus(this.totalAmount, this.amountPaid, this.dueDate);
  this.daysOverdue = calculateDaysOverdue(this.dueDate, this.status);
  next();
});

// Compound indexes
invoiceSchema.index({ businessId: 1, invoiceNumber: 1 });
invoiceSchema.index({ businessId: 1, status: 1 });
invoiceSchema.index({ businessId: 1, dueDate: 1 });

export default mongoose.model('Invoice', invoiceSchema);
