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
      enum: ['free', 'developer', 'team', 'enterprise'],
      default: 'free',
    },
    maxProjects: { type: Number, default: 3 },
    maxScansPerMonth: { type: Number, default: 15 },
  },
  { timestamps: true }
);

export const PLAN_LIMITS: Record<PlanTier, { maxProjects: number; maxScansPerMonth: number }> = {
  free: { maxProjects: 3, maxScansPerMonth: 15 },
  developer: { maxProjects: 10, maxScansPerMonth: 75 },
  team: { maxProjects: 50, maxScansPerMonth: 300 },
  enterprise: { maxProjects: 500, maxScansPerMonth: 5000 },
};

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
