import path from 'path';
import fs from 'fs';
import { Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { Scan } from '../models/Scan';
import { Organization } from '../models/Organization';
import { AuditLog } from '../models/AuditLog';
import { SafeZipExtractor } from '../scanner/extractor';
import { ScannerEngine } from '../scanner/engine';
import { ReportService } from '../services/reportService';
import { AIExplanationService } from '../services/aiExplanationService';
import {
  AuthenticatedRequest,
  ScanSummaryDTO,
  ScanDetailDTO,
  ScanComparisonDTO,
  FileScanInput,
} from '../types';

export class ScanController {
  /**
   * Uploads and executes a cryptographic scan on a ZIP archive.
   */
  public static async uploadAndScan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const orgId = req.user!.organizationId;

      if (!req.file) {
        res.status(400).json({ success: false, error: 'No ZIP archive uploaded.' });
        return;
      }

      const project = await Project.findOne({ _id: projectId, organizationId: orgId });
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found or access denied.' });
        return;
      }

      // Check organization scan limits
      const org = await Organization.findById(orgId);
      if (org) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const currentMonthScans = await Scan.countDocuments({
          organizationId: orgId,
          createdAt: { $gte: startOfMonth },
        });

        if (currentMonthScans >= org.maxScansPerMonth) {
          res.status(403).json({
            success: false,
            error: `Monthly scan limit reached for ${org.plan.toUpperCase()} tier (${org.maxScansPerMonth} scans/month). Upgrade your plan for higher limits.`,
          });
          return;
        }
      }

      // 1. Safe extraction
      const { files, totalEntriesCount, supportedFilesCount: supportedFileCount } =
        await SafeZipExtractor.extractAndCollectFiles(req.file.buffer);

      if (supportedFileCount === 0) {
        res.status(400).json({
          success: false,
          error: 'No supported source code or configuration files found in archive.',
        });
        return;
      }

      // 2. Scan execution
      const scanResult = await ScannerEngine.scanFiles(files);

      // 3. Count findings by severity
      let critical = 0, high = 0, medium = 0, low = 0, info = 0;
      for (const f of scanResult.findings) {
        if (f.severity === 'Critical') critical++;
        else if (f.severity === 'High') high++;
        else if (f.severity === 'Medium') medium++;
        else if (f.severity === 'Low') low++;
        else if (f.severity === 'Informational') info++;
      }

      // 4. Save Scan record
      const scan = await Scan.create({
        projectId: project._id,
        organizationId: orgId,
        status: 'completed',
        uploadedFileName: req.file.originalname,
        fileCount: totalEntriesCount,
        supportedFileCount,
        durationMs: scanResult.durationMs,
        readinessScore: scanResult.readinessAssessment.readinessScore,
        riskLevel: scanResult.readinessAssessment.riskLevel,
        findingsCount: scanResult.findings.length,
        criticalCount: critical,
        highCount: high,
        mediumCount: medium,
        lowCount: low,
        infoCount: info,
        findings: scanResult.findings,
        algorithmInventory: scanResult.algorithmInventory,
        readinessAssessment: scanResult.readinessAssessment,
        rulesVersion: scanResult.rulesVersion,
        scannerVersion: scanResult.scannerVersion,
      });

      // 5. Update Project latest scan and counter
      project.scanCount += 1;
      project.latestScanId = scan._id;
      await project.save();

      // 6. Audit log
      await AuditLog.create({
        organizationId: orgId,
        userId: req.user!.userId,
        action: 'SCAN_COMPLETED',
        targetType: 'Scan',
        targetId: scan._id.toString(),
        metadata: {
          projectId: project._id.toString(),
          findingsCount: scan.findingsCount,
          readinessScore: scan.readinessScore,
        },
      });

      const responseDTO: ScanDetailDTO = {
        id: scan._id.toString(),
        projectId: project._id.toString(),
        projectName: project.name,
        status: scan.status,
        uploadedFileName: scan.uploadedFileName,
        fileCount: scan.fileCount,
        supportedFileCount: scan.supportedFileCount,
        durationMs: scan.durationMs,
        findingsCount: scan.findingsCount,
        criticalCount: scan.criticalCount,
        highCount: scan.highCount,
        mediumCount: scan.mediumCount,
        lowCount: scan.lowCount,
        infoCount: scan.infoCount,
        readinessScore: scan.readinessScore,
        riskLevel: scan.riskLevel,
        createdAt: scan.createdAt.toISOString(),
        findings: scan.findings,
        algorithmInventory: scan.algorithmInventory,
        readinessAssessment: scan.readinessAssessment,
        rulesVersion: scan.rulesVersion,
        scannerVersion: scan.scannerVersion,
      };

      res.status(201).json({ success: true, data: responseDTO });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Scan failed' });
    }
  }

  /**
   * One-click demo scan executing against synthetic test repository blueprints.
   */
  public static async quickScanDemo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { demoType } = req.body; // 'classical-vulnerable' | 'hybrid-pqc' | 'clean-app'
      const orgId = req.user!.organizationId;

      const project = await Project.findOne({ _id: projectId, organizationId: orgId });
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      let demoFiles: FileScanInput[] = [];
      let demoFileName = 'enterprise-legacy-crypto-repo.zip';
      let fixtureFile = 'classical-vulnerable-repo.zip';

      if (demoType === 'hybrid-pqc') {
        demoFileName = 'quantumshield-pqc-service-demo.zip';
        fixtureFile = 'hybrid-pqc-ready-repo.zip';
      } else if (demoType === 'clean-app') {
        demoFileName = 'clean-web-service.zip';
        fixtureFile = 'clean-service-repo.zip';
      }

      // Embedded base64 fallbacks for demo repositories (binary ZIPs contain zero raw source strings in controller)
      const DEMO_FIXTURE_BASE64: Record<string, string> = {
        'classical-vulnerable-repo.zip':
          'UEsDBBQAAAgIALFpT13i3iWgcgAAAJIAAAAMAAAAcGFja2FnZS5qc29uJY0xDsMgEAR7XnG6OiCTLn5MJAxbkJAj4hJSWP67BWl3ZrS7IWIJL/BKHEtQzTEU279F0MJWYBWt5wi+DLOjaa4yZO8Wt/zXhDckQWKG8kq7ISLih1b5YfvUJ2Zwv7nFXWcxPmuCbRom8c47z4boMMcJUEsDBBQAAAgIALFpT13+6Xft6QAAAHgBAAALAAAAc3JjL2F1dGgudHN1j0Frg0AQhe/7K+a2BiSU0Jai5JCzPZTYP7DZTMxanZVxNnYR/3uJWmgpPc68+ea959rOs4Dl2ImHC/sW9DLoXLlFrAdZlbr3NOBJ/AeSzpXCz/ngEsiK8wSW0QiWyDdn8VgeCozJBkYFYD31AiN04dQ4W2BMoWN3M4IFRphgv0bYVkjIy/rNOC4j2URzb3Q6/wFo/Tk0oX9FquSawe7h8SVVANMmVwCMEpj+98nV9Dd17yo6BLm+32slnYmNN+cMDP2CM+iFHVVLn9WoHmR7x7+pn0AKI5im8uzk2magj+Xu6VnPQSf1BVBLAwQUAAAICACxaU9dbbgDv34AAACeAAAACgAAAHNyYy9rZXgudHMtjEEKwjAQRfc5xeySbgoKugmutFDwFGGctFkkE6ZTaRHvLkaX/73HT7myKKDsVRmicAb7G9YbQ1uzcS2oiQtUksiSh+ttHDacQ5nIdfAyAMhlUSB8zHD5v/UoFJS+sbNVUqbj6fw82M4baGU/USEJSnfaF9ewkK5SmvXmbT5QSwMEFAAACAgAsWlPXZDIo/ZvAAAAiQAAAA0AAABzcmMvbGVnYWN5LnRzLYw7DsQgDAV7TuHOoaHbZnOBvYYFDkFaPjJGShTt3SORLZ9m5qXcqih4OZtW2KRmwGfgagwfk26jeE21wJcj+fNDfV8CKb2hq6QSLVwGQFiHlP+V88KkPFXM4YXWjRZIeYbWhRS564I7H2hX8zM3UEsBAhQDFAAACAgAsWlPXeLeJaByAAAAkgAAAAwAAAAAAAAAAAAAAKSBAAAAAHBhY2thZ2UuanNvblBLAQIUAxQAAAgIALFpT13+6Xft6QAAAHgBAAALAAAAAAAAAAAAAACkgZwAAABzcmMvYXV0aC50c1BLAQIUAxQAAAgIALFpT11tuAO/fgAAAJ4AAAAKAAAAAAAAAAAAAACkga4BAABzcmMva2V4LnRzUEsBAhQDFAAACAgAsWlPXZDIo/ZvAAAAiQAAAA0AAAAAAAAAAAAAAKSBVAIAAHNyYy9sZWdhY3kudHNQSwUGAAAAAAQABADmAAAA7gIAAAAA',
        'hybrid-pqc-ready-repo.zip':
          'UEsDBBQAAAgIALFpT11nVizbdwAAAJoAAAAMAAAAcGFja2FnZS5qc29uLczBCoMwEIThe55i2HMT7LE+TCEmK01bY9xVIYjvXtReh2/+zQCU/cDUgsoU7Kt2kqIV9rFaZVlTYLodamXRNOYD3l3jmmuNXDhHziGxUovNAACNhfO0+Dwvg/r+jD8b9/ifAApSdfZftZ/asdi3nuTqGmA3+w9QSwMEFAAACAgAsWlPXclbGl2YAAAAxAAAAA4AAABzcmMvcHFjLWtlbS50c1WMywqCQABF9/MVd2dBYRn2IFpaiE4Ytmg7OgMN6SjzgEr897AW1fbec47vI7dMcaa5fAqOY5yfsY+zHMFsAZpOk4gScW8bbVFWzBhkjbEnx5R1dRJRdARoXVHJElJJOxq/F6BslLG4iRo7eJ/OdLVce9uf9/ootOQH3bh2oC5BGM43NE0i+iW1sE4rdENq8mf0A9CTnrwAUEsDBBQAAAgIALFpT11DubUinQAAAOgAAAAVAAAAc3JjL3BxYy1zaWduYXR1cmVzLnRzVc3RCoIwFMbx+z3Fd5UFiRHZTXQRRCRYGOsF1hw6sCnbGUTiu4dlZLd/fud8UQROwuTC5vqpcpwTfsUhyTiWixVOabjnO0y+JQZPj31i6tHUliAr4Ryy2tHFC0P+znVhBHmrHFoGNP5WaQmnCzOdvQsga+MIlSDSUvVeWWwRfLbCdRxsRqwUrvyZYX0QVpG3Bu3/r/n4putlxzr2AlBLAQIUAxQAAAgIALFpT11nVizbdwAAAJoAAAAMAAAAAAAAAAAAAACkgQAAAABwYWNrYWdlLmpzb25QSwECFAMUAAAICACxaU9dyVsaXZgAAADEAAAADgAAAAAAAAAAAAAApIGhAAAAc3JjL3BxYy1rZW0udHNQSwECFAMUAAAICACxaU9dQ7m1Ip0AAADoAAAAFQAAAAAAAAAAAAAApIFlAQAAc3JjL3BxYy1zaWduYXR1cmVzLnRzUEsFBgAAAAADAAMAuQAAADUCAAAAAA==',
        'clean-service-repo.zip':
          'UEsDBBQAAAgIALFpT105aIPEOQAAADsAAAAMAAAAcGFja2FnZS5qc29uq+ZSUFDKS8xNVbJSUErOSU3M0y0tyczJLKnULU4tKstMTlXSASkpSy0qzszPA6ky1DPQM1DiqgUAUEsDBBQAAAgIALFpT11njNBOOwAAAEYAAAALAAAAc3JjL21hdGgudHNLrSjILypRSCvNSy7JzM9TKC7N1Ui0UsgrzU1KLdJRSIIxNWEMhWouBYWi1JLSojyFRAVthSRrrlouAFBLAQIUAxQAAAgIALFpT105aIPEOQAAADsAAAAMAAAAAAAAAAAAAACkgQAAAABwYWNrYWdlLmpzb25QSwECFAMUAAAICACxaU9dZ4zQTjsAAABGAAAACwAAAAAAAAAAAAAApIFjAAAAc3JjL21hdGgudHNQSwUGAAAAAAIAAgBzAAAAxwAAAAAA',
      };

      // Load pre-packaged binary fixtures from test-fixtures directory, or fallback to embedded base64
      const fixturePaths = [
        path.join(process.cwd(), 'test-fixtures', fixtureFile),
        path.join(__dirname, '../../../test-fixtures', fixtureFile),
        path.join(__dirname, '../../test-fixtures', fixtureFile),
      ];
      const foundFixture = fixturePaths.find(p => fs.existsSync(p));

      let zipBuffer: Buffer;
      if (foundFixture) {
        zipBuffer = fs.readFileSync(foundFixture);
      } else {
        zipBuffer = Buffer.from(DEMO_FIXTURE_BASE64[fixtureFile] || '', 'base64');
      }

      if (zipBuffer.length > 0) {
        const extracted = await SafeZipExtractor.extractAndCollectFiles(zipBuffer);
        demoFiles = extracted.files;
      }

      const scanResult = await ScannerEngine.scanFiles(demoFiles);

      let critical = 0, high = 0, medium = 0, low = 0, info = 0;
      for (const f of scanResult.findings) {
        if (f.severity === 'Critical') critical++;
        else if (f.severity === 'High') high++;
        else if (f.severity === 'Medium') medium++;
        else if (f.severity === 'Low') low++;
        else if (f.severity === 'Informational') info++;
      }

      const scan = await Scan.create({
        projectId: project._id,
        organizationId: orgId,
        status: 'completed',
        uploadedFileName: demoFileName,
        fileCount: demoFiles.length,
        supportedFileCount: demoFiles.length,
        durationMs: scanResult.durationMs,
        readinessScore: scanResult.readinessAssessment.readinessScore,
        riskLevel: scanResult.readinessAssessment.riskLevel,
        findingsCount: scanResult.findings.length,
        criticalCount: critical,
        highCount: high,
        mediumCount: medium,
        lowCount: low,
        infoCount: info,
        findings: scanResult.findings,
        algorithmInventory: scanResult.algorithmInventory,
        readinessAssessment: scanResult.readinessAssessment,
        rulesVersion: scanResult.rulesVersion,
        scannerVersion: scanResult.scannerVersion,
      });

      project.scanCount += 1;
      project.latestScanId = scan._id;
      await project.save();

      const responseDTO: ScanDetailDTO = {
        id: scan._id.toString(),
        projectId: project._id.toString(),
        projectName: project.name,
        status: scan.status,
        uploadedFileName: scan.uploadedFileName,
        fileCount: scan.fileCount,
        supportedFileCount: scan.supportedFileCount,
        durationMs: scan.durationMs,
        findingsCount: scan.findingsCount,
        criticalCount: scan.criticalCount,
        highCount: scan.highCount,
        mediumCount: scan.mediumCount,
        lowCount: scan.lowCount,
        infoCount: scan.infoCount,
        readinessScore: scan.readinessScore,
        riskLevel: scan.riskLevel,
        createdAt: scan.createdAt.toISOString(),
        findings: scan.findings,
        algorithmInventory: scan.algorithmInventory,
        readinessAssessment: scan.readinessAssessment,
        rulesVersion: scan.rulesVersion,
        scannerVersion: scan.scannerVersion,
      };

      res.status(201).json({ success: true, data: responseDTO });
    } catch (err: any) {
      console.error('QUICK SCAN DEMO ERROR:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async listProjectScans(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const orgId = req.user!.organizationId;

      const scans = await Scan.find({ projectId, organizationId: orgId })
        .sort({ createdAt: -1 })
        .select('-findings');

      const dtos: ScanSummaryDTO[] = scans.map(s => ({
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

      res.status(200).json({ success: true, data: dtos });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getScan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { scanId } = req.params;
      const orgId = req.user!.organizationId;

      if (!mongoose.Types.ObjectId.isValid(scanId)) {
        res.status(400).json({ success: false, error: 'Invalid scan ID' });
        return;
      }

      const scan = await Scan.findOne({ _id: scanId, organizationId: orgId });
      if (!scan) {
        res.status(404).json({ success: false, error: 'Scan not found' });
        return;
      }

      const project = await Project.findById(scan.projectId);

      const dto: ScanDetailDTO = {
        id: scan._id.toString(),
        projectId: scan.projectId.toString(),
        projectName: project ? project.name : undefined,
        status: scan.status,
        uploadedFileName: scan.uploadedFileName,
        fileCount: scan.fileCount,
        supportedFileCount: scan.supportedFileCount,
        durationMs: scan.durationMs,
        findingsCount: scan.findingsCount,
        criticalCount: scan.criticalCount,
        highCount: scan.highCount,
        mediumCount: scan.mediumCount,
        lowCount: scan.lowCount,
        infoCount: scan.infoCount,
        readinessScore: scan.readinessScore,
        riskLevel: scan.riskLevel,
        createdAt: scan.createdAt.toISOString(),
        findings: scan.findings,
        algorithmInventory: scan.algorithmInventory,
        readinessAssessment: scan.readinessAssessment,
        rulesVersion: scan.rulesVersion,
        scannerVersion: scan.scannerVersion,
        errorMessage: scan.errorMessage,
      };

      res.status(200).json({ success: true, data: dto });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async compareScans(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { scanAId, scanBId } = req.query;
      const orgId = req.user!.organizationId;

      if (!scanAId || !scanBId) {
        res.status(400).json({ success: false, error: 'scanAId and scanBId query parameters are required.' });
        return;
      }

      const scanA = await Scan.findOne({ _id: scanAId, organizationId: orgId });
      const scanB = await Scan.findOne({ _id: scanBId, organizationId: orgId });

      if (!scanA || !scanB) {
        res.status(404).json({ success: false, error: 'One or both scans not found.' });
        return;
      }

      // Finding comparison based on ruleId + filePath
      const mapA = new Map<string, typeof scanA.findings[0]>();
      for (const f of scanA.findings) {
        mapA.set(`${f.ruleId}:${f.filePath}`, f);
      }

      const mapB = new Map<string, typeof scanB.findings[0]>();
      for (const f of scanB.findings) {
        mapB.set(`${f.ruleId}:${f.filePath}`, f);
      }

      const newFindings: typeof scanB.findings = [];
      const unchangedFindings: typeof scanB.findings = [];
      const resolvedFindings: typeof scanA.findings = [];

      for (const [key, findingB] of mapB.entries()) {
        if (mapA.has(key)) {
          unchangedFindings.push(findingB);
        } else {
          newFindings.push(findingB);
        }
      }

      for (const [key, findingA] of mapA.entries()) {
        if (!mapB.has(key)) {
          resolvedFindings.push(findingA);
        }
      }

      const comparison: ScanComparisonDTO = {
        scanA: {
          id: scanA._id.toString(),
          projectId: scanA.projectId.toString(),
          status: scanA.status,
          uploadedFileName: scanA.uploadedFileName,
          fileCount: scanA.fileCount,
          supportedFileCount: scanA.supportedFileCount,
          durationMs: scanA.durationMs,
          findingsCount: scanA.findingsCount,
          criticalCount: scanA.criticalCount,
          highCount: scanA.highCount,
          mediumCount: scanA.mediumCount,
          lowCount: scanA.lowCount,
          infoCount: scanA.infoCount,
          readinessScore: scanA.readinessScore,
          riskLevel: scanA.riskLevel,
          createdAt: scanA.createdAt.toISOString(),
        },
        scanB: {
          id: scanB._id.toString(),
          projectId: scanB.projectId.toString(),
          status: scanB.status,
          uploadedFileName: scanB.uploadedFileName,
          fileCount: scanB.fileCount,
          supportedFileCount: scanB.supportedFileCount,
          durationMs: scanB.durationMs,
          findingsCount: scanB.findingsCount,
          criticalCount: scanB.criticalCount,
          highCount: scanB.highCount,
          mediumCount: scanB.mediumCount,
          lowCount: scanB.lowCount,
          infoCount: scanB.infoCount,
          readinessScore: scanB.readinessScore,
          riskLevel: scanB.riskLevel,
          createdAt: scanB.createdAt.toISOString(),
        },
        newFindings,
        resolvedFindings,
        unchangedFindings,
        scoreDelta: scanB.readinessScore - scanA.readinessScore,
      };

      res.status(200).json({ success: true, data: comparison });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async downloadReportJSON(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { scanId } = req.params;
      const orgId = req.user!.organizationId;

      const scan = await Scan.findOne({ _id: scanId, organizationId: orgId });
      if (!scan) {
        res.status(404).json({ success: false, error: 'Scan not found' });
        return;
      }

      const project = await Project.findById(scan.projectId);
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      const report = ReportService.generateJSONReport(scan, project);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="quantumshield-report-${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${scan._id}.json"`);
      res.status(200).send(JSON.stringify(report, null, 2));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async downloadReportPDF(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { scanId } = req.params;
      const orgId = req.user!.organizationId;

      const scan = await Scan.findOne({ _id: scanId, organizationId: orgId });
      if (!scan) {
        res.status(404).json({ success: false, error: 'Scan not found' });
        return;
      }

      const project = await Project.findById(scan.projectId);
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      const pdfBuffer = await ReportService.generatePDFReport(scan, project);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="QuantumShield-Readiness-Report-${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`
      );
      res.status(200).send(pdfBuffer);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async explainFindingWithAI(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { scanId, findingId } = req.params;
      const orgId = req.user!.organizationId;

      const scan = await Scan.findOne({ _id: scanId, organizationId: orgId });
      if (!scan) {
        res.status(404).json({ success: false, error: 'Scan not found' });
        return;
      }

      const finding = scan.findings.find(f => f.findingId === findingId);
      if (!finding) {
        res.status(404).json({ success: false, error: 'Finding not found in scan' });
        return;
      }

      const explanation = await AIExplanationService.explainFinding(finding);
      res.status(200).json({ success: true, data: explanation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
