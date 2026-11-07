import mongoose, { Schema, Document } from 'mongoose';
import { PlanTier } from '../types';

export interface IPayment extends Document {
  organizationId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  plan: PlanTier;
  amount: number; // in paise (e.g. 399900 = ₹3,999.00)
  amountINR: number; // in rupees
  currency: string;
  status: 'created' | 'paid' | 'failed';
  receipt: string;
  customerEmail: string;
  customerPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: false, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    plan: {
      type: String,
      enum: ['free', 'single_scan', 'developer', 'team', 'enterprise'],
      required: true,
    },
    amount: { type: Number, required: true },
    amountINR: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
      index: true,
    },
    receipt: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

