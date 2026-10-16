import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Project } from '../models/Project';
import { Scan } from '../models/Scan';
import { AuthenticatedRequest } from '../types';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(1, 'Reset code is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.register({
        ...req.body,
        ip: req.ip,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Registration failed',
      });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.login({
        ...req.body,
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        error: err.message || 'Login failed',
      });
    }
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        data: result,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to process forgot password request',
      });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, code, newPassword } = req.body;
      const result = await AuthService.resetPassword(email, code, newPassword);
      res.status(200).json({
        success: true,
        data: result,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Password reset failed',
      });
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const org = await Organization.findById(user.organizationId);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found' });
        return;
      }

      const projectsCount = await Project.countDocuments({ organizationId: org._id });
      const scansCount = await Scan.countDocuments({ organizationId: org._id });

      res.status(200).json({
        success: true,
        data: {
          user: AuthService.mapUserDTO(user, org.name),
          organization: AuthService.mapOrgDTO(org, projectsCount, scansCount),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    // In stateless JWT architectures, client clears token; server returns acknowledgment
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }
}
