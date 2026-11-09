import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedAdminRequest } from '../../types';
import { Organization } from '../../models/Organization';
import { User } from '../../models/User';
import { Project } from '../../models/Project';
import { Scan } from '../../models/Scan';
import { Payment } from '../../models/Payment';

export class AdminDashboardController {
  public static async getStats(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const [
        totalOrgs,
        totalUsers,
        totalProjects,
        totalScans,
        scansRunning,
        scansFailed,
        scansCompleted,
        paidPayments,
        orgsByPlan,
      ] = await Promise.all([
        Organization.countDocuments(),
        User.countDocuments(),
        Project.countDocuments(),
        Scan.countDocuments(),
        Scan.countDocuments({ status: { $in: ['queued', 'cloning', 'extracting', 'analyzing'] } }),
        Scan.countDocuments({ status: 'failed' }),
        Scan.countDocuments({ status: 'completed' }),
        Payment.find({ status: 'paid' }).lean(),
        Organization.aggregate([
          { $group: { _id: '$plan', count: { $sum: 1 } } },
        ]),
      ]);

      // Calculate total revenue from paid payments
      const grossRevenueINR = paidPayments.reduce((sum, p) => sum + (p.amountINR || 0), 0);

      // Structure plan distribution
      const planCounts: Record<string, number> = {
        none: 0,
        single_scan: 0,
        developer: 0,
        team: 0,
        enterprise: 0,
      };

      for (const item of orgsByPlan) {
        if (item._id && planCounts.hasOwnProperty(item._id)) {
          planCounts[item._id] = item.count;
        }
      }

      // Calculate Monthly Recurring Revenue (MRR) from active recurring subscriptions
      const monthlyRecurringRevenueINR =
        planCounts.developer * 3999 +
        planCounts.team * 15999 +
        planCounts.enterprise * 39999;

      // Host and Node.js telemetry
      const mem = process.memoryUsage();
      const telemetry = {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMB: Math.round(mem.rss / (1024 * 1024)),
        memoryHeapUsedMB: Math.round(mem.heapUsed / (1024 * 1024)),
        memoryHeapTotalMB: Math.round(mem.heapTotal / (1024 * 1024)),
        nodeVersion: process.version,
        databaseState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      };

      res.status(200).json({
        success: true,
        stats: {
          totalOrgs,
          totalUsers,
          totalProjects,
          totalScans,
          scansRunning,
          scansFailed,
          scansCompleted,
          grossRevenueINR,
          monthlyRecurringRevenueINR,
          totalSettledPayments: paidPayments.length,
          planCounts,
          telemetry,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
