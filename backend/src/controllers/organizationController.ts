import { Response } from 'express';
import { z } from 'zod';
import { Organization, PLAN_LIMITS } from '../models/Organization';
import { Project } from '../models/Project';
import { Scan } from '../models/Scan';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest, PlanTier } from '../types';

export const updatePlanSchema = z.object({
  plan: z.enum(['free', 'developer', 'team', 'enterprise']),
});

export class OrganizationController {
  public static async getCurrent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const org = await Organization.findById(orgId);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found' });
        return;
      }

      const projectsCount = await Project.countDocuments({ organizationId: orgId });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const scansCount = await Scan.countDocuments({
        organizationId: orgId,
        createdAt: { $gte: startOfMonth },
      });

      res.status(200).json({
        success: true,
        data: {
          id: org._id.toString(),
          name: org.name,
          slug: org.slug,
          plan: org.plan,
          maxProjects: org.maxProjects,
          maxScansPerMonth: org.maxScansPerMonth,
          currentProjectsCount: projectsCount,
          currentScansCount: scansCount,
          createdAt: org.createdAt.toISOString(),
          pricingPlans: [
            {
              tier: 'free',
              name: 'Free Community',
              priceMonthly: 0,
              features: ['3 Projects', '15 Scans / month', 'Standard PQC Rules', 'JSON Export'],
              active: org.plan === 'free',
            },
            {
              tier: 'developer',
              name: 'Developer Pro',
              priceMonthly: 49,
              features: ['10 Projects', '75 Scans / month', 'Executive PDF Reports', 'Scan Comparison Tool', 'AI Remediation Explanations'],
              active: org.plan === 'developer',
            },
            {
              tier: 'team',
              name: 'Team Security',
              priceMonthly: 199,
              features: ['50 Projects', '300 Scans / month', 'Multi-user Collaboration', 'Audit Logs', 'Priority Scan Pipeline'],
              active: org.plan === 'team',
            },
            {
              tier: 'enterprise',
              name: 'Enterprise Shield',
              priceMonthly: 999,
              features: ['500 Projects', '5,000 Scans / month', 'Custom Cryptographic Rules', 'Dedicated Support', 'On-Premises Readiness'],
              active: org.plan === 'enterprise',
            },
          ],
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updatePlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { plan } = req.body as { plan: PlanTier };

      const org = await Organization.findById(orgId);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found' });
        return;
      }

      const limits = PLAN_LIMITS[plan];
      org.plan = plan;
      org.maxProjects = limits.maxProjects;
      org.maxScansPerMonth = limits.maxScansPerMonth;
      await org.save();

      await AuditLog.create({
        organizationId: orgId,
        userId: req.user!.userId,
        action: 'PLAN_UPDATED_MOCK_BILLING',
        targetType: 'Organization',
        targetId: org._id.toString(),
        metadata: { newPlan: plan, limits },
      });

      res.status(200).json({
        success: true,
        message: `Plan successfully updated to ${plan.toUpperCase()} tier (Simulated Billing Mode).`,
        data: {
          plan: org.plan,
          maxProjects: org.maxProjects,
          maxScansPerMonth: org.maxScansPerMonth,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { name } = req.body as { name: string };
      if (!name || !name.trim()) {
        res.status(400).json({ success: false, error: 'Organization name is required' });
        return;
      }

      const org = await Organization.findById(orgId);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found' });
        return;
      }

      org.name = name.trim();
      await org.save();

      res.status(200).json({
        success: true,
        message: 'Organization name successfully updated',
        data: {
          id: org._id.toString(),
          name: org.name,
          slug: org.slug,
          plan: org.plan,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
