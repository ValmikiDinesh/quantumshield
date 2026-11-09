import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SuperAdmin, ISuperAdmin, SuperAdminRole } from '../models/SuperAdmin';
import { AdminAuditLog, AdminAuditTargetType } from '../models/AdminAuditLog';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { env } from '../config/env';

export class AdminAuthService {
  /**
   * Writes an immutable audit entry
   */
  public static async recordAudit(
    adminId: string,
    adminEmail: string,
    action: string,
    targetType: AdminAuditTargetType,
    targetId?: string,
    details?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    try {
      await AdminAuditLog.create({
        adminId,
        adminEmail,
        action,
        targetType,
        targetId,
        details,
        ipAddress,
      });
    } catch (err) {
      console.error('[AdminAuditLog] Failed to record audit:', err);
    }
  }

  /**
   * Authenticates super administrator credentials
   */
  public static async login(
    email: string,
    passwordPlain: string,
    ipAddress?: string
  ): Promise<{ token: string; admin: Partial<ISuperAdmin> }> {
    const admin = await SuperAdmin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      throw new Error('Invalid administrative credentials.');
    }

    if (!admin.isActive) {
      throw new Error('Administrative account is deactivated.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, admin.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid administrative credentials.');
    }

    // Update login timestamp & IP
    admin.lastLoginAt = new Date();
    if (ipAddress) admin.lastLoginIp = ipAddress;
    await admin.save();

    const token = jwt.sign(
      {
        adminId: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isSuperAdmin: true,
      },
      env.JWT_ADMIN_SECRET,
      { expiresIn: env.ADMIN_SESSION_EXPIRES_IN }
    );

    await this.recordAudit(
      String(admin._id),
      admin.email,
      'ADMIN_LOGIN',
      'System',
      undefined,
      { ipAddress },
      ipAddress
    );

    return {
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
      },
    };
  }

  /**
   * Generates a temporary tenant customer token for support impersonation
   */
  public static async impersonateTenant(
    adminId: string,
    adminEmail: string,
    organizationId: string,
    ipAddress?: string
  ): Promise<{ customerToken: string; user: any; organization: any }> {
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw new Error('Organization not found.');
    }

    // Find owner or any active admin user in the organization
    let user = await User.findOne({ organizationId: org._id, role: 'owner' });
    if (!user) {
      user = await User.findOne({ organizationId: org._id });
    }

    if (!user) {
      throw new Error('No user accounts found under this organization.');
    }

    // Issue customer token valid for 30 minutes
    const customerToken = jwt.sign(
      {
        userId: String(user._id),
        organizationId: String(org._id),
        role: user.role,
        email: user.email,
        isImpersonated: true,
        impersonatedBy: adminEmail,
      },
      env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    await this.recordAudit(
      adminId,
      adminEmail,
      'IMPERSONATE_ORG',
      'Organization',
      String(org._id),
      {
        organizationName: org.name,
        targetUserEmail: user.email,
      },
      ipAddress
    );

    return {
      customerToken,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      organization: {
        id: String(org._id),
        name: org.name,
        plan: org.plan,
      },
    };
  }
}
