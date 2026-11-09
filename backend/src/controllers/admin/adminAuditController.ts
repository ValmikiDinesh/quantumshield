import { Response } from 'express';
import { AuthenticatedAdminRequest } from '../../types';
import { AdminAuditLog } from '../../models/AdminAuditLog';

export class AdminAuditController {
  public static async listAuditLogs(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { limit = 100, action } = req.query;

      const filter: any = {};
      if (action && typeof action === 'string') {
        filter.action = action;
      }

      const logs = await AdminAuditLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      res.status(200).json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
