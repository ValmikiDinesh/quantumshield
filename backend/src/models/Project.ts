import mongoose, { Schema, Document } from 'mongoose';
import { ProjectType } from '../types';

export interface IProject extends Document {
  name: string;
  description: string;
  projectType: ProjectType;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  scanCount: number;
  latestScanId?: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    projectType: {
      type: String,
      enum: ['web', 'api', 'mobile', 'library', 'infrastructure', 'other'],
      default: 'web',
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scanCount: { type: Number, default: 0 },
    latestScanId: {
      type: Schema.Types.ObjectId,
      ref: 'Scan',
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

ProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
