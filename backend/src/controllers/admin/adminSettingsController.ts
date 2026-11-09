import { Request, Response } from 'express';
import { AuthenticatedAdminRequest } from '../../types';
import { PlatformSetting } from '../../models/PlatformSetting';
import { AdminAuthService } from '../../services/adminAuthService';

export class AdminSettingsController {
  public static async getSettings(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const settings = await PlatformSetting.find().lean();
      const settingsMap: Record<string, any> = {
        maintenanceMode: { enabled: false, message: 'System maintenance in progress.' },
        scanQueuePaused: { enabled: false, reason: 'Scanning engine temporarily paused.' },
        broadcastAnnouncement: { enabled: false, title: '', message: '', severity: 'info' },
      };

      for (const s of settings) {
        settingsMap[s.key] = s.value;
      }

      res.status(200).json({ success: true, settings: settingsMap });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateSetting(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { key, value } = req.body;
      if (!key) {
        res.status(400).json({ success: false, error: 'Setting key is required.' });
        return;
      }

      const updated = await PlatformSetting.findOneAndUpdate(
        { key },
        { key, value, updatedBy: req.admin!.email },
        { upsert: true, new: true }
      );

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await AdminAuthService.recordAudit(
        req.admin!.adminId,
        req.admin!.email,
        'PLATFORM_SETTING_UPDATE',
        'Setting',
        key,
        { key, value },
        clientIp
      );

      res.status(200).json({ success: true, setting: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Public endpoint for customer frontend to fetch active banners
   */
  public static async getPublicAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const [maintenance, announcement, scanPause] = await Promise.all([
        PlatformSetting.findOne({ key: 'maintenanceMode' }).lean(),
        PlatformSetting.findOne({ key: 'broadcastAnnouncement' }).lean(),
        PlatformSetting.findOne({ key: 'scanQueuePaused' }).lean(),
      ]);

      res.status(200).json({
        success: true,
        maintenance: maintenance?.value || { enabled: false },
        announcement: announcement?.value || { enabled: false },
        scanPause: scanPause?.value || { enabled: false },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
