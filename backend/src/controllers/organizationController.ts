import { Response } from 'express';
import { z } from 'zod';
import { Organization, PLAN_LIMITS } from '../models/Organization';
import { Project } from '../models/Project';
import { Scan } from '../models/Scan';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest, PlanTier } from '../types';

export const updatePlanSchema = z.object({
  plan: z.enum(['single_scan', 'developer', 'team', 'enterprise']),
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
              tier: 'single_scan',
              name: 'Single Scan',
              priceMonthly: 4,
              priceMonthlyINR: 299,
              isOneTime: true,
              taxExempt: true,
              features: [
                '1 Full Repository Audit',
                'Dual-Shield Rule Catalog (Secrets + SAST + PQC)',
                'Zero-Leak Secret Masking (AWS, UPI, Cards)',
                'Executive PDF Audit Report Download',
                'Plain-English AI Remediation Checklist',
              ],
              active: org.plan === 'single_scan',
            },
            {
              tier: 'developer',
              name: 'Developer Pro',
              priceMonthly: 49,
              priceMonthlyINR: 3999,
              taxExempt: true,
              features: [
                'Includes all Single Scan features, plus:',
                '10 Repositories / Projects',
                '75 Automated Scans / month',
                'Scan Comparison Tool (Track Diffs)',
                'Automated AI Security Advisory Engine',
                'Historical Scan Auditing & Metrics',
              ],
              active: org.plan === 'developer',
            },
            {
              tier: 'team',
              name: 'Team Security',
              priceMonthly: 199,
              priceMonthlyINR: 15999,
              taxExempt: true,
              features: [
                'Includes all Developer Pro features, plus:',
                '50 Repositories / Projects',
                '300 Automated Scans / month',
                'Multi-User Team Collaboration & RBAC',
                'Full SOC 2, ISO 27001, PCI-DSS & DPDP Mapping',
                'Audit Trail Logs for Compliance',
              ],
              active: org.plan === 'team',
            },
            {
              tier: 'enterprise',
              name: 'Enterprise Shield',
              priceMonthly: 999,
              priceMonthlyINR: 39999,
              taxExempt: true,
              features: [
                'Includes all Team Security features, plus:',
                '500 Repositories / Projects',
                '5,000 Automated Scans / month',
                'Custom SAST Rules & Regex Catalog',
                'Dedicated Compliance SLA & Support',
                'Custom Security Architecture Reviews',
              ],
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
