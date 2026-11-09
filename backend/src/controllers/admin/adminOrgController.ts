import { Response } from 'express';
import { AuthenticatedAdminRequest } from '../../types';
import { Organization, PLAN_LIMITS } from '../../models/Organization';
import { User } from '../../models/User';
import { Project } from '../../models/Project';
import { Scan } from '../../models/Scan';
import { Payment } from '../../models/Payment';
import { AdminAuthService } from '../../services/adminAuthService';

export class AdminOrgController {
  public static async listOrganizations(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { search, plan, status } = req.query;

      const filter: any = {};
      if (search && typeof search === 'string') {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: regex }, { slug: regex }];
      }
      if (plan && typeof plan === 'string') {
        filter.plan = plan;
      }
      if (status && typeof status === 'string') {
        filter.status = status;
      }

      const orgs = await Organization.find(filter).sort({ createdAt: -1 }).lean();

      // Enrich with project counts and user counts
      const enriched = await Promise.all(
        orgs.map(async (org) => {
          const [userCount, projectCount, scanCount] = await Promise.all([
            User.countDocuments({ organizationId: org._id }),
            Project.countDocuments({ organizationId: org._id }),
            Scan.countDocuments({ organizationId: org._id }),
          ]);

          return {
            ...org,
            userCount,
            projectCount,
            scanCount,
          };
        })
      );

      res.status(200).json({ success: true, organizations: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getOrganization(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const org = await Organization.findById(id).lean();
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found.' });
        return;
      }

      const [users, projects, scans, payments] = await Promise.all([
        User.find({ organizationId: id }).select('-passwordHash').lean(),
        Project.find({ organizationId: id }).sort({ createdAt: -1 }).lean(),
        Scan.find({ organizationId: id }).sort({ createdAt: -1 }).limit(10).lean(),
        Payment.find({ organizationId: id }).sort({ createdAt: -1 }).lean(),
      ]);

      res.status(200).json({
        success: true,
        organization: org,
        users,
        projects,
        scans,
        payments,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updatePlan(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { plan, maxProjects, maxScansPerMonth, reason } = req.body;

      const org = await Organization.findById(id);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found.' });
        return;
      }

      const previousState = {
        plan: org.plan,
        maxProjects: org.maxProjects,
        maxScansPerMonth: org.maxScansPerMonth,
      };

      if (plan) {
        org.plan = plan;
        if (PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]) {
          org.maxProjects = maxProjects ?? PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].maxProjects;
          org.maxScansPerMonth = maxScansPerMonth ?? PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].maxScansPerMonth;
        }
      }

      if (typeof maxProjects === 'number') org.maxProjects = maxProjects;
      if (typeof maxScansPerMonth === 'number') org.maxScansPerMonth = maxScansPerMonth;

      await org.save();

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await AdminAuthService.recordAudit(
        req.admin!.adminId,
        req.admin!.email,
        'ORG_PLAN_OVERRIDE',
        'Organization',
        String(org._id),
        {
          previousState,
          newState: {
            plan: org.plan,
            maxProjects: org.maxProjects,
            maxScansPerMonth: org.maxScansPerMonth,
          },
          reason: reason || 'Manual operator adjustment',
        },
        clientIp
      );

      res.status(200).json({ success: true, organization: org });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async updateStatus(req: AuthenticatedAdminRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!['active', 'suspended'].includes(status)) {
        res.status(400).json({ success: false, error: 'Status must be active or suspended.' });
        return;
      }

      const org = await Organization.findById(id);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found.' });
        return;
      }

      const previousStatus = org.status;
      org.status = status;
      org.suspendedReason = status === 'suspended' ? reason || 'Administrative suspension' : undefined;
      org.suspendedAt = status === 'suspended' ? new Date() : undefined;
      await org.save();

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      await AdminAuthService.recordAudit(
        req.admin!.adminId,
        req.admin!.email,
        status === 'suspended' ? 'ORG_SUSPEND' : 'ORG_ACTIVATE',
        'Organization',
        String(org._id),
        {
          previousStatus,
          newStatus: status,
          reason,
        },
        clientIp
      );

      res.status(200).json({ success: true, organization: org });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
