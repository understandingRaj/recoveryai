import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
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
    paymentTerms: {
      type: String,
      enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'],
      default: 'Net 30'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active'
    },
    lastContactDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index for rapid search and tenant isolation
customerSchema.index({ businessId: 1, company: 1 });
customerSchema.index({ businessId: 1, email: 1 });

export default mongoose.model('Customer', customerSchema);
