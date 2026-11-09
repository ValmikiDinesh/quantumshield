import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { AuthenticatedAdminRequest } from '../../types';
import { Scan } from '../../models/Scan';
import { AdminAuthService } from '../../services/adminAuthService';

export class AdminScanController {
  public static async listScans(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { status, limit = 50 } = req.query;

      const filter: any = {};
      if (status && typeof status === 'string') filter.status = status;

      const scans = await Scan.find(filter)
        .populate('organizationId', 'name slug')
        .populate('projectId', 'name projectType')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      res.status(200).json({ success: true, scans });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getScan(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const scan = await Scan.findById(id)
        .populate('organizationId', 'name slug')
        .populate('projectId', 'name projectType')
        .lean();

      if (!scan) {
        res.status(404).json({ success: false, error: 'Scan not found.' });
        return;
      }

      res.status(200).json({ success: true, scan });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async abortScan(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const scan = await Scan.findById(id);
      if (!scan) {
        res.status(404).json({ success: false, error: 'Scan not found.' });
        return;
      }

      scan.status = 'failed';
      scan.errorMessage = 'Aborted by Super Administrator.';
      scan.completedAt = new Date();
      await scan.save();

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await AdminAuthService.recordAudit(
        req.admin!.adminId,
        req.admin!.email,
        'SCAN_ABORT',
        'Scan',
        String(scan._id),
        { previousStatus: scan.status },
        clientIp
      );

      res.status(200).json({ success: true, message: 'Scan successfully aborted.', scan });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async purgeTempStorage(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const tmpDir = os.tmpdir();
      const files = await fs.promises.readdir(tmpDir);
      const now = Date.now();
      const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

      let purgedCount = 0;
      let reclaimedBytes = 0;

      for (const file of files) {
        if (file.startsWith('quantumshield-') || file.startsWith('qs-upload-')) {
          const fullPath = path.join(tmpDir, file);
          try {
            const stat = await fs.promises.stat(fullPath);
            if (now - stat.mtimeMs > MAX_AGE_MS) {
              if (stat.isDirectory()) {
                await fs.promises.rm(fullPath, { recursive: true, force: true });
              } else {
                await fs.promises.unlink(fullPath);
              }
              purgedCount++;
              reclaimedBytes += stat.size;
            }
          } catch {
            // Ignore in-use files
          }
        }
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await AdminAuthService.recordAudit(
        req.admin!.adminId,
        req.admin!.email,
        'PURGE_TEMP_STORAGE',
        'System',
        undefined,
        { purgedCount, reclaimedBytes },
        clientIp
      );

      res.status(200).json({
        success: true,
        message: `Purged ${purgedCount} temporary items.`,
        purgedCount,
        reclaimedBytes,
        reclaimedMB: Math.round(reclaimedBytes / (1024 * 1024)),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
