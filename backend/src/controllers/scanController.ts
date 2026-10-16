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
      let demoFileName = 'demo-repository.zip';

      if (demoType === 'hybrid-pqc') {
        demoFileName = 'quantumshield-pqc-service-demo.zip';
        demoFiles = [
          {
            filePath: 'src/pqc/kem.ts',
            relativePath: 'src/pqc/kem.ts',
            content: `
// NIST FIPS 203 ML-KEM Integration
import { MLKEM768KeyPair } from '@quantumshield/pqc';
export class PostQuantumKEX {
  public async establishSession() {
    const kem = new ML-KEM-768();
    const hybridGroup = "X25519MLKEM768";
    return { kem, hybridGroup };
  }
}
            `.trim(),
            extension: '.ts',
            sizeBytes: 250,
          },
          {
            filePath: 'src/pqc/signer.ts',
            relativePath: 'src/pqc/signer.ts',
            content: `
// NIST FIPS 204 ML-DSA and FIPS 205 SLH-DSA
export function signPayload(data: Buffer) {
  const scheme = "ML-DSA-65";
  const backupScheme = "SLH-DSA";
  return { scheme, backupScheme };
}
            `.trim(),
            extension: '.ts',
            sizeBytes: 220,
          },
          {
            filePath: 'package.json',
            relativePath: 'package.json',
            content: JSON.stringify(
              {
                name: 'pqc-hybrid-demo',
                dependencies: {
                  'openquantumsafe': '^0.9.0',
                  'crystals-kyber-js': '^1.0.0',
                },
              },
              null,
              2
            ),
            extension: '.json',
            sizeBytes: 150,
          },
        ];
      } else if (demoType === 'clean-app') {
        demoFileName = 'clean-web-service.zip';
        demoFiles = [
          {
            filePath: 'src/index.ts',
            relativePath: 'src/index.ts',
            content: `
export function formatCurrency(amount: number): string {
  return '$' + amount.toFixed(2);
}
export function parseQuery(query: string): Record<string, string> {
  return {};
}
            `.trim(),
            extension: '.ts',
            sizeBytes: 180,
          },
          {
            filePath: 'package.json',
            relativePath: 'package.json',
            content: JSON.stringify({ name: 'clean-service', dependencies: { express: '^4.19.2' } }, null, 2),
            extension: '.json',
            sizeBytes: 120,
          },
        ];
      } else {
        // Default: classical-vulnerable
        demoFileName = 'enterprise-legacy-crypto-repo.zip';
        demoFiles = [
          {
            filePath: 'src/auth/jwtService.ts',
            relativePath: 'src/auth/jwtService.ts',
            content: `
import jwt from 'jsonwebtoken';
export function generateToken(user: any, privateKey: string) {
  return jwt.sign({ sub: user.id }, privateKey, { algorithm: 'RS256', expiresIn: '30d' });
}
            `.trim(),
            extension: '.ts',
            sizeBytes: 220,
          },
          {
            filePath: 'src/crypto/rsaKeyManager.ts',
            relativePath: 'src/crypto/rsaKeyManager.ts',
            content: `
import crypto from 'crypto';
export function createCustomerKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  return { publicKey, privateKey };
}
export function decryptSecretPayload(privateKey: string, buffer: Buffer) {
  return crypto.privateDecrypt({
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
  }, buffer);
}
            `.trim(),
            extension: '.ts',
            sizeBytes: 450,
          },
          {
            filePath: 'src/network/ecdhKex.ts',
            relativePath: 'src/network/ecdhKex.ts',
            content: `
import crypto from 'crypto';
export function negotiateSessionSecret() {
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  return ecdh;
}
            `.trim(),
            extension: '.ts',
            sizeBytes: 210,
          },
          {
            filePath: 'src/legacy/checksum.ts',
            relativePath: 'src/legacy/checksum.ts',
            content: `
import crypto from 'crypto';
export function computeLegacyHash(data: string) {
  return crypto.createHash('md5').update(data).digest('hex');
}
            `.trim(),
            extension: '.ts',
            sizeBytes: 180,
          },
          {
            filePath: 'package.json',
            relativePath: 'package.json',
            content: JSON.stringify(
              {
                name: 'legacy-crypto-app',
                dependencies: {
                  'jsonwebtoken': '^9.0.0',
                  'node-rsa': '^1.1.1',
                  'elliptic': '^6.5.4',
                },
              },
              null,
              2
            ),
            extension: '.json',
            sizeBytes: 200,
          },
        ];
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
