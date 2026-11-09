import { Request } from 'express';
export * from './shared';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  organizationId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface AuthenticatedSuperAdmin {
  adminId: string;
  email: string;
  name: string;
  role: 'superadmin' | 'support' | 'auditor';
  isSuperAdmin: true;
}

export interface AuthenticatedAdminRequest extends Request {
  admin?: AuthenticatedSuperAdmin;
}

export interface FileScanInput {
  filePath: string;
  relativePath: string;
  content: string;
  extension: string;
  sizeBytes: number;
}
