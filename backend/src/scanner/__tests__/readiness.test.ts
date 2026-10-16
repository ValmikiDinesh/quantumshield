import { describe, it, expect } from 'vitest';
import { ReadinessAssessor } from '../readinessAssessor';
import { FindingDTO } from '../../types';

describe('ReadinessAssessor Unit Tests', () => {
  it('assigns 100 score and Post-Quantum Prepared status to clean repositories', () => {
    const findings: FindingDTO[] = [];
    const inventory = ReadinessAssessor.buildAlgorithmInventory(findings);
    const assessment = ReadinessAssessor.assessReadiness(findings, inventory);

    expect(assessment.readinessScore).toBe(100);
    expect(assessment.riskLevel).toBe('Post-Quantum Prepared');
    expect(assessment.shorVulnerableCount).toBe(0);
  });

  it('deducts points for HNDL vulnerabilities and applies PQC adoption bonus', () => {
    const findings: FindingDTO[] = [
      {
        findingId: '1',
        ruleId: 'PQC-PUB-RSA-KEYGEN',
        ruleVersion: '1.0.0',
        title: 'RSA Key Pair Generation',
        description: 'RSA generation',
        category: 'public-key',
        severity: 'High',
        confidence: 'High',
        classification: 'Confirmed pattern match',
        filePath: 'src/crypto.ts',
        line: 10,
        column: 5,
        evidence: 'crypto.generateKeyPairSync("rsa")',
        detectionMethod: 'regex-engine',
        quantumMigrationRelevance: 'HNDL vulnerability',
        conventionalSecurityRelevance: 'Standard classical',
        recommendedRemediation: 'Migrate to ML-KEM',
        referenceLinks: [],
        quantumImpactType: 'harvest-now-decrypt-later',
        timestamp: new Date().toISOString(),
      },
      {
        findingId: '2',
        ruleId: 'PQC-PUB-ECC-ECDH',
        ruleVersion: '1.0.0',
        title: 'ECDH Key Agreement',
        description: 'ECDH usage',
        category: 'public-key',
        severity: 'High',
        confidence: 'High',
        classification: 'Confirmed pattern match',
        filePath: 'src/kex.ts',
        line: 22,
        column: 1,
        evidence: 'crypto.createECDH("prime256v1")',
        detectionMethod: 'regex-engine',
        quantumMigrationRelevance: 'HNDL vulnerability',
        conventionalSecurityRelevance: 'Standard classical',
        recommendedRemediation: 'Migrate to ML-KEM',
        referenceLinks: [],
        quantumImpactType: 'harvest-now-decrypt-later',
        timestamp: new Date().toISOString(),
      },
      {
        findingId: '3',
        ruleId: 'PQC-ALG-MLKEM-FIPS203',
        ruleVersion: '1.0.0',
        title: 'ML-KEM Detected',
        description: 'Standardized ML-KEM',
        category: 'pqc-implementation',
        severity: 'Informational',
        confidence: 'High',
        classification: 'Confirmed pattern match',
        filePath: 'src/pqc.ts',
        line: 5,
        column: 1,
        evidence: 'const kem = new ML-KEM-768()',
        detectionMethod: 'regex-engine',
        quantumMigrationRelevance: 'Positive quantum resistance',
        conventionalSecurityRelevance: 'Lattice security',
        recommendedRemediation: 'Ensure conformance with FIPS 203',
        referenceLinks: [],
        quantumImpactType: 'quantum-resistant',
        timestamp: new Date().toISOString(),
      },
    ];

    const inventory = ReadinessAssessor.buildAlgorithmInventory(findings);
    const assessment = ReadinessAssessor.assessReadiness(findings, inventory);

    // 100 - 14 (RSA) - 14 (ECDH) + 8 (ML-KEM bonus) = 80
    expect(assessment.readinessScore).toBe(80);
    expect(assessment.riskLevel).toBe('Early Stage Transition');
    expect(assessment.harvestNowDecryptLaterCount).toBe(2);
    expect(assessment.pqcDetectedCount).toBe(1);
    expect(assessment.calculationMethod).toContain('Base Score: 100');
  });

  it('aggregates algorithm inventory properly', () => {
    const findings: FindingDTO[] = [
      {
        findingId: '1',
        ruleId: 'PQC-PUB-RSA-KEYGEN',
        ruleVersion: '1.0.0',
        title: 'RSA Key Pair Generation',
        description: '',
        category: 'public-key',
        severity: 'High',
        confidence: 'High',
        classification: 'Confirmed pattern match',
        filePath: 'src/a.ts',
        line: 1,
        column: 1,
        evidence: '',
        detectionMethod: 'regex-engine',
        quantumMigrationRelevance: '',
        conventionalSecurityRelevance: '',
        recommendedRemediation: '',
        referenceLinks: [],
        quantumImpactType: 'harvest-now-decrypt-later',
        timestamp: new Date().toISOString(),
      },
      {
        findingId: '2',
        ruleId: 'PQC-PUB-RSA-KEYGEN',
        ruleVersion: '1.0.0',
        title: 'RSA Key Pair Generation',
        description: '',
        category: 'public-key',
        severity: 'High',
        confidence: 'High',
        classification: 'Confirmed pattern match',
        filePath: 'src/b.ts',
        line: 10,
        column: 1,
        evidence: '',
        detectionMethod: 'regex-engine',
        quantumMigrationRelevance: '',
        conventionalSecurityRelevance: '',
        recommendedRemediation: '',
        referenceLinks: [],
        quantumImpactType: 'harvest-now-decrypt-later',
        timestamp: new Date().toISOString(),
      },
    ];

    const inventory = ReadinessAssessor.buildAlgorithmInventory(findings);
    expect(inventory.length).toBe(1);
    expect(inventory[0].algorithm).toBe('RSA (Asymmetric)');
    expect(inventory[0].locationsCount).toBe(2);
  });
});
