import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { Scan } from '../models/Scan';
import { Organization, PLAN_LIMITS } from '../models/Organization';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest, ProjectDTO, ScanSummaryDTO } from '../types';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(80),
  description: z.string().max(500).optional().default(''),
  projectType: z.enum(['web', 'api', 'mobile', 'library', 'infrastructure', 'other']).default('web'),
  tags: z.array(z.string()).optional().default([]),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  projectType: z.enum(['web', 'api', 'mobile', 'library', 'infrastructure', 'other']).optional(),
  tags: z.array(z.string()).optional(),
});

export class ProjectController {
  public static async listProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const projects = await Project.find({ organizationId: orgId })
        .sort({ updatedAt: -1 })
        .populate('latestScanId');

      const dtos: ProjectDTO[] = projects.map(p => {
        let latestScanDTO: ScanSummaryDTO | null = null;
        if (p.latestScanId && typeof p.latestScanId === 'object') {
          const s: any = p.latestScanId;
          latestScanDTO = {
            id: s._id.toString(),
            projectId: p._id.toString(),
            status: s.status,
            uploadedFileName: s.uploadedFileName,
            fileCount: s.fileCount,
            supportedFileCount: s.supportedFileCount,
            durationMs: s.durationMs,
            findingsCount: s.findingsCount,
            criticalCount: s.criticalCount,
            highCount: s.highCount,
            mediumCount: s.mediumCount,
            lowCount: s.lowCount,
            infoCount: s.infoCount,
            readinessScore: s.readinessScore,
            riskLevel: s.riskLevel,
            createdAt: s.createdAt.toISOString(),
          };
        }

        return {
          id: p._id.toString(),
          name: p.name,
          description: p.description,
          projectType: p.projectType,
          organizationId: p.organizationId.toString(),
          createdBy: p.createdBy.toString(),
          scanCount: p.scanCount,
          latestScan: latestScanDTO,
          tags: p.tags,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      });

      res.status(200).json({ success: true, data: dtos });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const org = await Organization.findById(orgId);
      if (!org) {
        res.status(404).json({ success: false, error: 'Organization not found' });
        return;
      }

      const currentProjectCount = await Project.countDocuments({ organizationId: orgId });
      if (currentProjectCount >= org.maxProjects) {
        res.status(403).json({
          success: false,
          error: `Project limit reached for ${org.plan.toUpperCase()} tier (${org.maxProjects} projects). Upgrade plan to add more.`,
        });
        return;
      }

      const existing = await Project.findOne({ organizationId: orgId, name: req.body.name.trim() });
      if (existing) {
        res.status(400).json({
          success: false,
          error: 'A project with this name already exists in your organization.',
        });
        return;
      }

      const project = await Project.create({
        name: req.body.name.trim(),
        description: req.body.description || '',
        projectType: req.body.projectType || 'web',
        organizationId: orgId,
        createdBy: req.user!.userId,
        tags: req.body.tags || [],
      });

      await AuditLog.create({
        organizationId: orgId,
        userId: req.user!.userId,
        action: 'PROJECT_CREATE',
        targetType: 'Project',
        targetId: project._id.toString(),
        metadata: { name: project.name },
      });

      res.status(201).json({
        success: true,
        data: {
          id: project._id.toString(),
          name: project.name,
          description: project.description,
          projectType: project.projectType,
          organizationId: project.organizationId.toString(),
          createdBy: project.createdBy.toString(),
          scanCount: 0,
          latestScan: null,
          tags: project.tags,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
      }

      const project = await Project.findOne({
        _id: id,
        organizationId: req.user!.organizationId,
      }).populate('latestScanId');

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      let latestScanDTO: ScanSummaryDTO | null = null;
      if (project.latestScanId && typeof project.latestScanId === 'object') {
        const s: any = project.latestScanId;
        latestScanDTO = {
          id: s._id.toString(),
          projectId: project._id.toString(),
          status: s.status,
          uploadedFileName: s.uploadedFileName,
          fileCount: s.fileCount,
          supportedFileCount: s.supportedFileCount,
          durationMs: s.durationMs,
          findingsCount: s.findingsCount,
          criticalCount: s.criticalCount,
          highCount: s.highCount,
          mediumCount: s.mediumCount,
          lowCount: s.lowCount,
          infoCount: s.infoCount,
          readinessScore: s.readinessScore,
          riskLevel: s.riskLevel,
          createdAt: s.createdAt.toISOString(),
        };
      }

      res.status(200).json({
        success: true,
        data: {
          id: project._id.toString(),
          name: project.name,
          description: project.description,
          projectType: project.projectType,
          organizationId: project.organizationId.toString(),
          createdBy: project.createdBy.toString(),
          scanCount: project.scanCount,
          latestScan: latestScanDTO,
          tags: project.tags,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await Project.findOne({
        _id: id,
        organizationId: req.user!.organizationId,
      });

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      if (req.body.name) project.name = req.body.name.trim();
      if (req.body.description !== undefined) project.description = req.body.description;
      if (req.body.projectType) project.projectType = req.body.projectType;
      if (req.body.tags) project.tags = req.body.tags;

      await project.save();

      res.status(200).json({
        success: true,
        data: {
          id: project._id.toString(),
          name: project.name,
          description: project.description,
          projectType: project.projectType,
          organizationId: project.organizationId.toString(),
          createdBy: project.createdBy.toString(),
          scanCount: project.scanCount,
          tags: project.tags,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await Project.findOneAndDelete({
        _id: id,
        organizationId: req.user!.organizationId,
      });

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      // Delete associated scans
      await Scan.deleteMany({ projectId: id });

      await AuditLog.create({
        organizationId: req.user!.organizationId,
        userId: req.user!.userId,
        action: 'PROJECT_DELETE',
        targetType: 'Project',
        targetId: id,
        metadata: { name: project.name },
      });

      res.status(200).json({ success: true, message: 'Project and all associated scan data deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
