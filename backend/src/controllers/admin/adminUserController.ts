import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedAdminRequest } from '../../types';
import { User } from '../../models/User';
import { Organization } from '../../models/Organization';
import { AdminAuthService } from '../../services/adminAuthService';

export class AdminUserController {
  public static async listUsers(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { search, role } = req.query;

      const filter: any = {};
      if (search && typeof search === 'string') {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ email: regex }, { name: regex }];
      }
      if (role && typeof role === 'string') {
        filter.role = role;
      }

      const users = await User.find(filter)
        .populate('organizationId', 'name plan status slug')
        .sort({ createdAt: -1 })
        .select('-passwordHash')
        .lean();

      res.status(200).json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async resetPassword(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await user.save();

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await AdminAuthService.recordAudit(
        req.admin!.adminId,
        req.admin!.email,
        'USER_PASSWORD_RESET',
        'User',
        String(user._id),
        { targetEmail: user.email },
        clientIp
      );

      res.status(200).json({ success: true, message: `Password reset successfully for ${user.email}.` });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteUser(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      // Check if user is the sole member of an organization
      const count = await User.countDocuments({ organizationId: user.organizationId });
      if (count <= 1) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete the sole user of an organization. Suspend or delete the organization instead.',
        });
        return;
      }

      await User.findByIdAndDelete(id);

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await AdminAuthService.recordAudit(
        req.admin!.adminId,
        req.admin!.email,
        'USER_DELETE',
        'User',
        String(id),
        { deletedUserEmail: user.email, organizationId: String(user.organizationId) },
        clientIp
      );

      res.status(200).json({ success: true, message: 'User successfully deleted.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
