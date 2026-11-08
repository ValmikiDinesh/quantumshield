import mongoose, { Schema, Document } from 'mongoose';
import { PlanTier } from '../types';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  plan: PlanTier;
  maxProjects: number;
  maxScansPerMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    plan: {
      type: String,
      enum: ['single_scan', 'developer', 'team', 'enterprise'],
      default: 'single_scan',
    },
    maxProjects: { type: Number, default: 1 },
    maxScansPerMonth: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const PLAN_LIMITS: Record<PlanTier, { maxProjects: number; maxScansPerMonth: number }> = {
  single_scan: { maxProjects: 1, maxScansPerMonth: 0 },
  developer: { maxProjects: 10, maxScansPerMonth: 75 },
  team: { maxProjects: 50, maxScansPerMonth: 300 },
  enterprise: { maxProjects: 500, maxScansPerMonth: 5000 },
};

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
