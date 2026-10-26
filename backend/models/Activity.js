import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'invoice_created',
        'invoice_updated',
        'invoice_deleted',
        'payment_recorded',
        'customer_added',
        'customer_updated',
        'customer_deleted',
        'reminder_drafted',
        'reminder_sent',
        'follow_up_completed',
        'follow_up_rescheduled',
        'phone_call_logged'
      ]
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    customerName: {
      type: String,
      trim: true,
      default: ''
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: ''
    },
    user: {
      type: String,
      default: 'Alex Vance'
    },
    status: {
      type: String,
      enum: ['drafted', 'sent', 'delivered', 'failed', 'completed'],
      default: 'completed'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ businessId: 1, timestamp: -1 });

export default mongoose.model('Activity', activitySchema);
