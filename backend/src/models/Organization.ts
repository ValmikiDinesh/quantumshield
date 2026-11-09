import mongoose, { Schema, Document } from 'mongoose';
import { PlanTier } from '../types';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  plan: PlanTier;
  maxProjects: number;
  maxScansPerMonth: number;
  status: 'active' | 'suspended';
  suspendedReason?: string;
  suspendedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    plan: {
      type: String,
      enum: ['none', 'single_scan', 'developer', 'team', 'enterprise'],
      default: 'none',
    },
    maxProjects: { type: Number, default: 1 },
    maxScansPerMonth: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    suspendedReason: { type: String },
    suspendedAt: { type: Date },
  },
  { timestamps: true }
);

export const PLAN_LIMITS: Record<PlanTier, { maxProjects: number; maxScansPerMonth: number }> = {
  none: { maxProjects: 1, maxScansPerMonth: 0 },
  single_scan: { maxProjects: 1, maxScansPerMonth: 1 },
  developer: { maxProjects: 10, maxScansPerMonth: 75 },
  team: { maxProjects: 50, maxScansPerMonth: 300 },
  enterprise: { maxProjects: 500, maxScansPerMonth: 5000 },
};

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
