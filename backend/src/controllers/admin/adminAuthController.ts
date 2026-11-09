import { Response } from 'express';
import { AuthenticatedAdminRequest } from '../../types';
import { AdminAuthService } from '../../services/adminAuthService';
import { SuperAdmin } from '../../models/SuperAdmin';

export class AdminAuthController {
  public static async login(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const result = await AdminAuthService.login(email, password, clientIp);

      res.status(200).json({
        success: true,
        token: result.token,
        admin: result.admin,
      });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message || 'Login failed.' });
    }
  }

  public static async getProfile(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const admin = await SuperAdmin.findById(req.admin.adminId);
      if (!admin) {
        res.status(404).json({ success: false, error: 'Admin account not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          lastLoginAt: admin.lastLoginAt,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async impersonateTenant(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { organizationId } = req.body;
      if (!organizationId) {
        res.status(400).json({ success: false, error: 'organizationId is required.' });
        return;
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const result = await AdminAuthService.impersonateTenant(
        req.admin!.adminId,
        req.admin!.email,
        organizationId,
        clientIp
      );

      res.status(200).json({
        success: true,
        customerToken: result.customerToken,
        user: result.user,
        organization: result.organization,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
