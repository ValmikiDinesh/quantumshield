import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSetting extends Document {
  key: string;
  value: any;
  updatedBy?: string;
  updatedAt: Date;
}

const PlatformSettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const PlatformSetting = mongoose.model<IPlatformSetting>('PlatformSetting', PlatformSettingSchema);
