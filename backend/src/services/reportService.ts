import PDFDocument from 'pdfkit';
import { IScan } from '../models/Scan';
import { IProject } from '../models/Project';

export class ReportService {
  /**
   * Generates a structured JSON export adhering to the QuantumShield schema.
   */
  public static generateJSONReport(scan: IScan, project: IProject): Record<string, any> {
    return {
      reportType: 'QuantumShield Post-Quantum Security Readiness Assessment',
      organization: 'Valmiki Softwares',
      product: 'QuantumShield',
      generatedAt: new Date().toISOString(),
      metadata: {
        projectId: project._id.toString(),
        projectName: project.name,
        projectType: project.projectType,
        scanId: scan._id.toString(),
        scanDate: scan.createdAt.toISOString(),
        uploadedFileName: scan.uploadedFileName,
        scannerVersion: scan.scannerVersion,
        rulesVersion: scan.rulesVersion,
        durationMs: scan.durationMs,
        filesAnalyzed: scan.supportedFileCount,
      },
      readinessAssessment: {
        score: scan.readinessScore,
        riskLevel: scan.riskLevel,
        shorVulnerableCount: scan.readinessAssessment.shorVulnerableCount,
        harvestNowDecryptLaterCount: scan.readinessAssessment.harvestNowDecryptLaterCount,
        authenticationVulnerableCount: scan.readinessAssessment.authenticationVulnerableCount,
        pqcDetectedCount: scan.readinessAssessment.pqcDetectedCount,
        legacyWeakCount: scan.readinessAssessment.legacyWeakCount,
        calculationMethod: scan.readinessAssessment.calculationMethod,
        disclaimer: scan.readinessAssessment.disclaimer,
      },
      summary: {
        totalFindings: scan.findingsCount,
        critical: scan.criticalCount,
        high: scan.highCount,
        medium: scan.mediumCount,
        low: scan.lowCount,
        info: scan.infoCount,
      },
      algorithmInventory: scan.algorithmInventory,
      findings: scan.findings,
      standardsGuidance: [
        {
          standard: 'NIST FIPS 203',
          algorithm: 'ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism)',
          useCase: 'General post-quantum public-key encryption and key establishment.',
          status: 'Final Standard (August 2024)',
        },
        {
          standard: 'NIST FIPS 204',
          algorithm: 'ML-DSA (Module-Lattice-Based Digital Signature Algorithm)',
          useCase: 'General post-quantum digital signatures for authentication and certificates.',
          status: 'Final Standard (August 2024)',
        },
        {
          standard: 'NIST FIPS 205',
          algorithm: 'SLH-DSA (Stateless Hash-Based Digital Signature Algorithm)',
          useCase: 'Stateless hash-based signatures for firmware verification and root CAs.',
          status: 'Final Standard (August 2024)',
        },
      ],
    };
  }

  /**
   * Generates an executive-ready PDF report buffer with professional enterprise styling.
   */
  public static async generatePDFReport(scan: IScan, project: IProject): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true,
        info: {
          Title: `QuantumShield Readiness Report - ${project.name}`,
          Author: 'Valmiki Softwares',
          Subject: 'Post-Quantum Cryptography Readiness Assessment',
          Keywords: 'PQC, Post-Quantum, Cryptography, NIST, ML-KEM, ML-DSA',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- STYLING CONSTANTS ---
      const NAVY = '#0B132B';
      const BLUE = '#2563EB';
      const DARK_GRAY = '#334155';
      const LIGHT_GRAY = '#64748B';
      const BORDER_COLOR = '#E2E8F0';

      // --- PAGE 1: HEADER BANNER ---
      doc.rect(0, 0, 595.28, 80).fill(NAVY);
      doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('QUANTUMSHIELD', 50, 24);
      doc.fontSize(10).font('Helvetica').fillColor('#93C5FD').text('Post-Quantum Cryptography Readiness Report', 50, 48);
      doc.fontSize(9).font('Helvetica').fillColor('#CBD5E1').text('Developed by Valmiki Softwares', 380, 48, { align: 'right', width: 165 });

      doc.moveDown(4);

      // --- PROJECT & SCAN METADATA ---
      doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold').text('Executive Summary', 50, 100);
      doc.strokeColor(BORDER_COLOR).lineWidth(1).moveTo(50, 118).lineTo(545, 118).stroke();

      const metaY = 126;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK_GRAY);
      doc.text(`Project: `, 50, metaY, { continued: true }).font('Helvetica').text(project.name);
      doc.font('Helvetica-Bold').text(`Scan Date: `, 50, metaY + 14, { continued: true }).font('Helvetica').text(new Date(scan.createdAt).toLocaleDateString() + ' ' + new Date(scan.createdAt).toLocaleTimeString());
      doc.font('Helvetica-Bold').text(`Target Archive: `, 50, metaY + 28, { continued: true }).font('Helvetica').text(scan.uploadedFileName);

      doc.font('Helvetica-Bold').text(`Scanner Version: `, 320, metaY, { continued: true }).font('Helvetica').text(`v${scan.scannerVersion} (Rules v${scan.rulesVersion})`);
      doc.font('Helvetica-Bold').text(`Files Analyzed: `, 320, metaY + 14, { continued: true }).font('Helvetica').text(`${scan.supportedFileCount} supported source files`);
      doc.font('Helvetica-Bold').text(`Scan Duration: `, 320, metaY + 28, { continued: true }).font('Helvetica').text(`${(scan.durationMs / 1000).toFixed(2)}s`);

      // --- READINESS SCORE CARD ---
      const scoreCardY = 175;
      doc.roundedRect(50, scoreCardY, 495, 75, 6).fill('#F8FAFC');
      doc.strokeColor(BORDER_COLOR).roundedRect(50, scoreCardY, 495, 75, 6).stroke();

      // Score circle / number
      doc.fillColor(BLUE).fontSize(28).font('Helvetica-Bold').text(`${scan.readinessScore}`, 70, scoreCardY + 15);
      doc.fontSize(10).fillColor(LIGHT_GRAY).font('Helvetica').text('/ 100 Readiness', 70, scoreCardY + 46);

      // Risk level badge
      let badgeColor = '#16A34A';
      if (scan.readinessScore < 40) badgeColor = '#DC2626';
      else if (scan.readinessScore < 65) badgeColor = '#EA580C';
      else if (scan.readinessScore < 85) badgeColor = '#D97706';

      doc.roundedRect(175, scoreCardY + 16, 170, 22, 4).fill(badgeColor);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text(scan.riskLevel.toUpperCase(), 180, scoreCardY + 22, { width: 160, align: 'center' });

      // Risk summary counters
      doc.fontSize(9).font('Helvetica').fillColor(DARK_GRAY);
      doc.text(`• Shor-Vulnerable Algorithms: ${scan.readinessAssessment.shorVulnerableCount}`, 360, scoreCardY + 14);
      doc.text(`• Harvest-Now-Decrypt-Later (HNDL): ${scan.readinessAssessment.harvestNowDecryptLaterCount}`, 360, scoreCardY + 28);
      doc.text(`• PQC / Hybrid Implementations: ${scan.readinessAssessment.pqcDetectedCount}`, 360, scoreCardY + 42);
      doc.text(`• Conventional Weak Ciphers: ${scan.readinessAssessment.legacyWeakCount}`, 360, scoreCardY + 56);

      // --- FINDINGS DISTRIBUTION SUMMARY ---
      const distY = 265;
      doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text('Findings Severity Breakdown', 50, distY);
      doc.strokeColor(BORDER_COLOR).moveTo(50, distY + 16).lineTo(545, distY + 16).stroke();

      const boxWidth = 90;
      const boxGap = 11;
      const boxes = [
        { label: 'CRITICAL', count: scan.criticalCount, color: '#DC2626' },
        { label: 'HIGH', count: scan.highCount, color: '#EA580C' },
        { label: 'MEDIUM', count: scan.mediumCount, color: '#D97706' },
        { label: 'LOW', count: scan.lowCount, color: '#2563EB' },
        { label: 'INFO', count: scan.infoCount, color: '#64748B' },
      ];

      boxes.forEach((box, idx) => {
        const bx = 50 + idx * (boxWidth + boxGap);
        doc.roundedRect(bx, distY + 25, boxWidth, 42, 4).fill('#F8FAFC');
        doc.strokeColor(box.color).lineWidth(1.5).roundedRect(bx, distY + 25, boxWidth, 42, 4).stroke();

        doc.fillColor(box.color).fontSize(16).font('Helvetica-Bold').text(`${box.count}`, bx, distY + 31, { align: 'center', width: boxWidth });
        doc.fillColor(DARK_GRAY).fontSize(8).font('Helvetica').text(box.label, bx, distY + 50, { align: 'center', width: boxWidth });
      });

      // --- ALGORITHM INVENTORY TABLE ---
      let currY = 345;
      const renderInventoryHeader = (y: number) => {
        doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text('Cryptographic Algorithm Inventory', 50, y);
        doc.strokeColor(BORDER_COLOR).moveTo(50, y + 16).lineTo(545, y + 16).stroke();
        doc.rect(50, y + 22, 495, 18).fill('#1E293B');
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
        doc.text('ALGORITHM', 55, y + 27, { width: 140 });
        doc.text('CATEGORY', 200, y + 27, { width: 70 });
        doc.text('QUANTUM STATUS', 275, y + 27, { width: 100 });
        doc.text('LOCATIONS', 380, y + 27, { width: 45 });
        doc.text('RECOMMENDED ACTION', 430, y + 27, { width: 110 });
        return y + 40;
      };

      currY = renderInventoryHeader(currY);

      if (!scan.algorithmInventory || scan.algorithmInventory.length === 0) {
        doc.fillColor(LIGHT_GRAY).fontSize(9).font('Helvetica').text('No cryptographic algorithms identified.', 55, currY + 8);
        currY += 25;
      } else {
        scan.algorithmInventory.forEach((item, idx) => {
          if (currY > 730) {
            doc.addPage();
            currY = renderInventoryHeader(60);
          }

          const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          doc.rect(50, currY, 495, 20).fill(rowBg);
          doc.strokeColor(BORDER_COLOR).rect(50, currY, 495, 20).stroke();

          doc.fillColor(DARK_GRAY).fontSize(8).font('Helvetica-Bold').text(item.algorithm, 55, currY + 6, { width: 140, ellipsis: true });
          doc.font('Helvetica').text(item.category.toUpperCase(), 200, currY + 6, { width: 70 });

          let statColor = '#DC2626';
          if (item.quantumStatus === 'quantum-resistant') statColor = '#16A34A';
          else if (item.quantumStatus === 'safe-grover-impact') statColor = '#2563EB';
          else if (item.quantumStatus === 'legacy-insecure') statColor = '#B91C1C';

          doc.fillColor(statColor).font('Helvetica-Bold').text(item.quantumStatus.toUpperCase(), 275, currY + 6, { width: 100 });
          doc.fillColor(DARK_GRAY).font('Helvetica').text(`${item.locationsCount}`, 380, currY + 6, { width: 45 });
          doc.text(item.recommendedReplacement || 'Standardize', 430, currY + 6, { width: 110, ellipsis: true });

          currY += 20;
        });
      }

      // --- PAGE BREAK FOR DETAILED FINDINGS ---
      doc.addPage();

      let findingY = 60;
      doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold').text('Detailed Findings & Migration Roadmap', 50, findingY);
      doc.strokeColor(BORDER_COLOR).moveTo(50, findingY + 18).lineTo(545, findingY + 18).stroke();
      findingY += 30;

      if (!scan.findings || scan.findings.length === 0) {
        doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica').text('No quantum or cryptographic issues found. Codebase demonstrates post-quantum readiness.', 50, findingY);
        findingY += 30;
      } else {
        scan.findings.forEach((f, idx) => {
          if (findingY > 680) {
            doc.addPage();
            findingY = 60;
            doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text('Detailed Findings (Continued)', 50, findingY);
            doc.strokeColor(BORDER_COLOR).moveTo(50, findingY + 16).lineTo(545, findingY + 16).stroke();
            findingY += 25;
          }

          doc.roundedRect(50, findingY, 495, 95, 4).fill('#FFFFFF');
          doc.strokeColor(BORDER_COLOR).roundedRect(50, findingY, 495, 95, 4).stroke();

          let sColor = '#EA580C';
          if (f.severity === 'Critical') sColor = '#DC2626';
          else if (f.severity === 'Medium') sColor = '#D97706';
          else if (f.severity === 'Low') sColor = '#2563EB';
          else if (f.severity === 'Informational') sColor = '#64748B';

          doc.roundedRect(50, findingY, 6, 95, 2).fill(sColor);

          doc.fillColor(NAVY).fontSize(10).font('Helvetica-Bold').text(`${idx + 1}. ${f.title}`, 65, findingY + 8, { width: 340 });
          doc.fillColor(sColor).fontSize(8).font('Helvetica-Bold').text(f.severity.toUpperCase(), 450, findingY + 8, { width: 85, align: 'right' });

          doc.fillColor(LIGHT_GRAY).fontSize(8).font('Helvetica').text(`Location: ${f.filePath}:${f.line} | Rule: ${f.ruleId} | Classification: ${f.classification}`, 65, findingY + 22);

          doc.fillColor(DARK_GRAY).fontSize(8).font('Helvetica').text(`Quantum Relevance: ${f.quantumMigrationRelevance}`, 65, findingY + 36, { width: 465, ellipsis: true });
          doc.fillColor(BLUE).fontSize(8).font('Helvetica-Bold').text(`Remediation: `, 65, findingY + 58, { continued: true })
            .font('Helvetica').fillColor(DARK_GRAY).text(f.recommendedRemediation, { width: 465, ellipsis: true });

          findingY += 105;
        });
      }

      // --- STANDARDS & DISCLAIMER ---
      if (findingY > 640) {
        doc.addPage();
        findingY = 60;
      }

      doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text('NIST Standards References & Compliance Guidance', 50, findingY);
      doc.strokeColor(BORDER_COLOR).moveTo(50, findingY + 14).lineTo(545, findingY + 14).stroke();

      findingY += 22;
      doc.fontSize(8).font('Helvetica').fillColor(DARK_GRAY);
      doc.text('• NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM) for quantum-resistant key establishment.', 50, findingY);
      doc.text('• NIST FIPS 204: Module-Lattice-Based Digital Signature Algorithm (ML-DSA) for general purpose post-quantum signatures.', 50, findingY + 12);
      doc.text('• NIST FIPS 205: Stateless Hash-Based Digital Signature Algorithm (SLH-DSA) for high-assurance firmware and CA signing.', 50, findingY + 24);

      findingY += 45;
      doc.roundedRect(50, findingY, 495, 45, 4).fill('#F1F5F9');
      doc.fillColor(LIGHT_GRAY).fontSize(7).font('Helvetica').text(
        'LEGAL & ENGINEERING DISCLAIMER: This assessment is an automated readiness analysis prepared by QuantumShield (Valmiki Softwares). ' +
        'It identifies known cryptographic patterns and provides migration priorities aligning with NIST FIPS 203/204/205. ' +
        'This report does not constitute a formal mathematical proof, third-party security certification, or guarantee against cryptanalytic exploitation.',
        60,
        findingY + 8,
        { width: 475, align: 'justify' }
      );

      // --- MULTI-PAGE RUNNING HEADER & FOOTER STAMPING ---
      const pageRange = doc.bufferedPageRange();
      const totalPages = pageRange.count;

      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);

        // Header on pages 2+
        if (i > 0) {
          doc.fontSize(8).font('Helvetica').fillColor(LIGHT_GRAY).text(
            `QuantumShield™ Readiness Assessment  |  ${project.name}`,
            50,
            25,
            { width: 350 }
          );
          doc.text('Valmiki Softwares', 400, 25, { width: 145, align: 'right' });
          doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(50, 38).lineTo(545, 38).stroke();
        }

        // Running Footer on ALL pages
        doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(50, 805).lineTo(545, 805).stroke();
        doc.fontSize(8).font('Helvetica').fillColor(LIGHT_GRAY).text(
          `QuantumShield Post-Quantum Security Platform  •  Developed by Valmiki Softwares`,
          50,
          812,
          { width: 350 }
        );
        doc.fontSize(8).font('Helvetica-Bold').fillColor(DARK_GRAY).text(
          `Page ${i + 1} of ${totalPages}`,
          450,
          812,
          { width: 95, align: 'right' }
        );
      }

      doc.end();
    });
  }
}
