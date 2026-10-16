import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Organization, IOrganization, PLAN_LIMITS } from '../models/Organization';
import { AuditLog } from '../models/AuditLog';
import { env } from '../config/env';
import { AuthenticatedUser, UserDTO, OrganizationDTO } from '../types';

export class AuthService {
  public static async register(data: {
    name: string;
    email: string;
    password: string;
    organizationName?: string;
    ip?: string;
  }): Promise<{ user: UserDTO; organization: OrganizationDTO; token: string }> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const orgName = data.organizationName?.trim() || `${data.name.trim()}'s Organization`;
    const slugBase = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const organization = await Organization.create({
      name: orgName,
      slug,
      plan: 'free',
      maxProjects: PLAN_LIMITS.free.maxProjects,
      maxScansPerMonth: PLAN_LIMITS.free.maxScansPerMonth,
    });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: 'owner',
      organizationId: organization._id,
    });

    await AuditLog.create({
      organizationId: organization._id,
      userId: user._id,
      action: 'USER_REGISTER',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: data.ip,
      metadata: { email: user.email },
    });

    const token = this.generateToken(user, organization._id.toString());

    return {
      user: this.mapUserDTO(user, organization.name),
      organization: this.mapOrgDTO(organization, 1, 0),
      token,
    };
  }

  public static async login(data: {
    email: string;
    password: string;
    ip?: string;
  }): Promise<{ user: UserDTO; organization: OrganizationDTO; token: string }> {
    const user = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const organization = await Organization.findById(user.organizationId);
    if (!organization) {
      throw new Error('Organization not found.');
    }

    await AuditLog.create({
      organizationId: organization._id,
      userId: user._id,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: data.ip,
    });

    const token = this.generateToken(user, organization._id.toString());

    return {
      user: this.mapUserDTO(user, organization.name),
      organization: this.mapOrgDTO(organization, 0, 0),
      token,
    };
  }

  public static async forgotPassword(email: string): Promise<{ message: string; resetCode?: string }> {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return {
        message: 'If an account exists with that email, password reset instructions have been issued.',
      };
    }

    // Generate secure 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000); // 1 hour validity
    await user.save();

    await AuditLog.create({
      organizationId: user.organizationId,
      userId: user._id,
      action: 'PASSWORD_RESET_REQUESTED',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { email: user.email },
    });

    return {
      message: 'Password reset code generated successfully.',
      resetCode,
    };
  }

  public static async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: code.trim(),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired password reset code. Please request a new one.');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await AuditLog.create({
      organizationId: user.organizationId,
      userId: user._id,
      action: 'PASSWORD_RESET_COMPLETED',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { email: user.email },
    });

    return {
      message: 'Password has been successfully reset. Please log in with your new password.',
    };
  }

  public static generateToken(user: IUser, organizationId: string): string {
    const payload: AuthenticatedUser = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  public static mapUserDTO(user: IUser, organizationName?: string): UserDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toString(),
      organizationName,
      createdAt: user.createdAt.toISOString(),
    };
  }

  public static mapOrgDTO(
    org: IOrganization,
    projectsCount: number = 0,
    scansCount: number = 0
  ): OrganizationDTO {
    return {
      id: org._id.toString(),
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      maxProjects: org.maxProjects,
      maxScansPerMonth: org.maxScansPerMonth,
      currentProjectsCount: projectsCount,
      currentScansCount: scansCount,
      createdAt: org.createdAt.toISOString(),
    };
  }
}
