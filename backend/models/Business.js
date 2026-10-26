import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true
    },
    legalName: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Business email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    currency: {
      type: String,
      default: 'INR'
    },
    currencySymbol: {
      type: String,
      default: '₹'
    },
    gstNumber: {
      type: String,
      trim: true,
      default: ''
    },
    defaultReminderTone: {
      type: String,
      enum: ['Friendly', 'Professional', 'Firm but polite'],
      default: 'Professional'
    },
    reminderSchedule: {
      type: String,
      default: '3 days before due, on due date, 7 days overdue'
    },
    preferredChannel: {
      type: String,
      enum: ['Email', 'WhatsApp', 'SMS'],
      default: 'Email'
    },
    aiProvider: {
      type: String,
      default: 'OpenAI (GPT-4o)'
    },
    safePlaceholders: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Business', businessSchema);
