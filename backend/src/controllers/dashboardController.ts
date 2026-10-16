import { Response } from 'express';
import { Project } from '../models/Project';
import { Scan } from '../models/Scan';
import { AuthenticatedRequest, DashboardStatsDTO, ScanSummaryDTO, ProjectDTO } from '../types';

export class DashboardController {
  public static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user!.organizationId;

      const [totalProjects, totalScans, projects, recentScansRaw] = await Promise.all([
        Project.countDocuments({ organizationId: orgId }),
        Scan.countDocuments({ organizationId: orgId }),
        Project.find({ organizationId: orgId }).populate('latestScanId').sort({ updatedAt: -1 }),
        Scan.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(10),
      ]);

      let critical = 0, high = 0, medium = 0, low = 0, info = 0;
      let shorCount = 0, pqcCount = 0, symmetricCount = 0, legacyCount = 0;
      let totalScores = 0;
      let scoredProjectsCount = 0;

      const projectsNeedingReview: ProjectDTO[] = [];

      for (const p of projects) {
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

          totalScores += s.readinessScore;
          scoredProjectsCount++;

          if (s.readinessScore < 65 || s.criticalCount > 0 || s.highCount > 0) {
            projectsNeedingReview.push({
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
            });
          }
        }
      }

      // Aggregate findings counts across latest scans of all projects
      for (const p of projects) {
        if (p.latestScanId && typeof p.latestScanId === 'object') {
          const s: any = p.latestScanId;
          critical += s.criticalCount || 0;
          high += s.highCount || 0;
          medium += s.mediumCount || 0;
          low += s.lowCount || 0;
          info += s.infoCount || 0;

          if (s.readinessAssessment) {
            shorCount += s.readinessAssessment.shorVulnerableCount || 0;
            pqcCount += s.readinessAssessment.pqcDetectedCount || 0;
            legacyCount += s.readinessAssessment.legacyWeakCount || 0;
          }
        }
      }

      const recentScans: ScanSummaryDTO[] = recentScansRaw.map(s => ({
        id: s._id.toString(),
        projectId: s.projectId.toString(),
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
      }));

      const avgScore = scoredProjectsCount > 0 ? Math.round(totalScores / scoredProjectsCount) : 100;

      const stats: DashboardStatsDTO = {
        totalProjects,
        totalScans,
        findingsBySeverity: { critical, high, medium, low, info },
        algorithmInventorySummary: {
          asymmetricShorVulnerable: shorCount,
          pqcOrHybridDetected: pqcCount,
          symmetricOrHash: symmetricCount,
          legacyWeak: legacyCount,
        },
        recentScans,
        projectsNeedingReview: projectsNeedingReview.slice(0, 5),
        averageReadinessScore: avgScore,
      };

      res.status(200).json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
