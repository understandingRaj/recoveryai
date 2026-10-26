import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema(
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
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      index: true
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: ''
    },
    amountDue: {
      type: Number,
      default: 0
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    channel: {
      type: String,
      enum: ['Email', 'WhatsApp', 'Phone', 'SMS'],
      default: 'Email'
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Rescheduled', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    completedNotes: {
      type: String,
      trim: true,
      default: ''
    },
    lastContactDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

followUpSchema.index({ businessId: 1, scheduledDate: 1, status: 1 });

export default mongoose.model('FollowUp', followUpSchema);
