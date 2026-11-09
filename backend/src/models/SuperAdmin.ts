import mongoose, { Schema, Document } from 'mongoose';

export type SuperAdminRole = 'superadmin' | 'support' | 'auditor';

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: SuperAdminRole;
  isActive: boolean;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['superadmin', 'support', 'auditor'],
      default: 'superadmin',
    },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
  },
  { timestamps: true }
);

SuperAdminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const SuperAdmin = mongoose.model<ISuperAdmin>('SuperAdmin', SuperAdminSchema);
