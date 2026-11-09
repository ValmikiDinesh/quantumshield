import mongoose, { Schema, Document } from 'mongoose';

export type AdminAuditTargetType = 'Organization' | 'User' | 'Payment' | 'Scan' | 'System' | 'Setting';

export interface IAdminAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  action: string;
  targetType: AdminAuditTargetType;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AdminAuditLogSchema: Schema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'SuperAdmin',
      required: true,
      index: true,
    },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: ['Organization', 'User', 'Payment', 'Scan', 'System', 'Setting'],
      required: true,
      index: true,
    },
    targetId: { type: String, index: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AdminAuditLog = mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);
