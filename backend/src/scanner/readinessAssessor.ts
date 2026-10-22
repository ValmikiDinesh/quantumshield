import {
  FindingDTO,
  AlgorithmInventoryItem,
  ReadinessAssessment,
} from '../types';

export class ReadinessAssessor {
  /**
   * Computes a transparent, reproducible Post-Quantum Cryptography readiness assessment.
   */
  public static assessReadiness(
    findings: FindingDTO[],
    algorithmInventory: AlgorithmInventoryItem[]
  ): ReadinessAssessment {
    let score = 100;

    let shorVulnerableCount = 0;
    let harvestNowDecryptLaterCount = 0;
    let authenticationVulnerableCount = 0;
    let pqcDetectedCount = 0;
    let legacyWeakCount = 0;

    for (const finding of findings) {
      if (finding.category === 'pqc-implementation') {
        pqcDetectedCount++;
        continue;
      }

      if (finding.category === 'weak-legacy') {
        legacyWeakCount++;
        score -= 5;
        continue;
      }

      if (finding.quantumImpactType === 'harvest-now-decrypt-later') {
        shorVulnerableCount++;
        harvestNowDecryptLaterCount++;
        const weight = finding.severity === 'Critical' ? 20 : finding.severity === 'High' ? 14 : 8;
        score -= weight;
      } else if (finding.quantumImpactType === 'future-forgeability') {
        shorVulnerableCount++;
        authenticationVulnerableCount++;
        const weight = finding.severity === 'High' ? 10 : 6;
        score -= weight;
      } else if (finding.quantumImpactType === 'crypto-agility') {
        score -= 3;
      }
    }

    // Reward active adoption of post-quantum standards or hybrid deployment
    if (pqcDetectedCount > 0) {
      const bonus = Math.min(25, pqcDetectedCount * 8);
      score += bonus;
    }

    // Clamp score to [0, 100]
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

    let riskLevel: ReadinessAssessment['riskLevel'] = 'Post-Quantum Prepared';
    if (clampedScore < 40) {
      riskLevel = 'Critical Action Required';
    } else if (clampedScore < 65) {
      riskLevel = 'Migration Planning Needed';
    } else if (clampedScore < 85) {
      riskLevel = 'Early Stage Transition';
    } else {
      riskLevel = 'Post-Quantum Prepared';
    }

    const calculationMethod =
      `Base Score: 100. Deductions: -14 to -20 pts per Harvest Now Decrypt Later (HNDL) key exchange finding (${harvestNowDecryptLaterCount} detected); ` +
      `-6 to -10 pts per future-forgeability signature finding (${authenticationVulnerableCount} detected); ` +
      `-5 pts per conventional weak cipher (${legacyWeakCount} detected); ` +
      `Bonus: +8 pts per verified PQC / Hybrid indicator (+${Math.min(25, pqcDetectedCount * 8)} pts from ${pqcDetectedCount} indicators). ` +
      `Final normalized score: ${clampedScore}/100.`;

    const disclaimer =
      'QuantumShield Readiness Scores are prioritized engineering heuristics designed to guide cryptographic migration. ' +
      'A high score does not constitute a formal mathematical proof or security guarantee of quantum safety, nor does it predict the exact operational timeline of a cryptanalytically relevant quantum computer (CRQC). ' +
      'Security posture depends on protocol implementations, key management practices, data confidentiality lifespans, and operational environment.';

    return {
      readinessScore: clampedScore,
      riskLevel,
      shorVulnerableCount,
      harvestNowDecryptLaterCount,
      authenticationVulnerableCount,
      pqcDetectedCount,
      legacyWeakCount,
      totalFindingsCount: findings.length,
      calculationMethod,
      disclaimer,
    };
  }

  /**
   * Aggregates an algorithm inventory from scan findings.
   */
  public static buildAlgorithmInventory(findings: FindingDTO[]): AlgorithmInventoryItem[] {
    const map = new Map<string, {
      category: AlgorithmInventoryItem['category'];
      quantumStatus: AlgorithmInventoryItem['quantumStatus'];
      locations: Set<string>;
      replacement?: string;
    }>();

    for (const f of findings) {
      let algoName = 'Generic Cryptography';
      let cat: AlgorithmInventoryItem['category'] = 'asymmetric';
      let status: AlgorithmInventoryItem['quantumStatus'] = 'vulnerable-shor';
      let replacement: string | undefined = undefined;

      // 1. Post-Quantum standards (MUST be evaluated first because ML-DSA and SLH-DSA contain 'DSA')
      if (f.ruleId.includes('MLKEM') || f.title.includes('ML-KEM') || f.ruleId === 'PQC-ALG-MLKEM-FIPS203') {
        algoName = 'ML-KEM (FIPS 203 Key Encapsulation)';
        cat = 'post-quantum';
        status = 'quantum-resistant';
      } else if (f.ruleId.includes('MLDSA') || f.title.includes('ML-DSA') || f.ruleId === 'PQC-ALG-MLDSA-FIPS204') {
        algoName = 'ML-DSA (FIPS 204 Digital Signature)';
        cat = 'post-quantum';
        status = 'quantum-resistant';
      } else if (f.ruleId.includes('SLHDSA') || f.title.includes('SLH-DSA') || f.ruleId === 'PQC-ALG-SLHDSA-FIPS205') {
        algoName = 'SLH-DSA (FIPS 205 Stateless Hash Signature)';
        cat = 'post-quantum';
        status = 'quantum-resistant';
      } else if (f.ruleId.includes('HYBRID') || f.category === 'pqc-implementation') {
        algoName = 'Hybrid Classical + Post-Quantum Scheme';
        cat = 'hybrid';
        status = 'quantum-resistant';
      } else if (f.ruleId.includes('RSA')) {
        algoName = 'RSA (Asymmetric)';
        cat = 'asymmetric';
        status = 'vulnerable-shor';
        replacement = 'ML-KEM (FIPS 203) for KEX / ML-DSA (FIPS 204) for Signatures';
      } else if (f.ruleId.includes('ECDH') || f.ruleId.includes('X25519')) {
        algoName = 'ECDH / X25519 (Key Exchange)';
        cat = 'asymmetric';
        status = 'vulnerable-shor';
        replacement = 'ML-KEM (FIPS 203) or Hybrid X25519+ML-KEM-768';
      } else if (f.ruleId.includes('ECDSA') || f.ruleId.includes('EdDSA')) {
        algoName = 'ECDSA / Ed25519 (Digital Signatures)';
        cat = 'asymmetric';
        status = 'vulnerable-shor';
        replacement = 'ML-DSA (FIPS 204) or SLH-DSA (FIPS 205)';
      } else if (f.ruleId.includes('PUB-DSA') || f.ruleId === 'PQC-PUB-DSA-SIGN') {
        algoName = 'DSA (Digital Signature Algorithm)';
        cat = 'asymmetric';
        status = 'vulnerable-shor';
        replacement = 'ML-DSA (FIPS 204)';
      } else if (f.ruleId.includes('DH')) {
        algoName = 'Diffie-Hellman (Classical FFDHE)';
        cat = 'asymmetric';
        status = 'vulnerable-shor';
        replacement = 'ML-KEM (FIPS 203)';
      } else if (f.ruleId.includes('LEGACY')) {
        algoName = 'Legacy Weak Ciphers (MD5/SHA1/DES)';
        cat = 'legacy-weak';
        status = 'legacy-insecure';
        replacement = 'SHA-256 / SHA-3 / AES-256-GCM';
      } else if (f.ruleId === 'PQC-LIB-MANIFEST-DEP') {
        algoName = 'Cryptographic Package (Manifest)';
        cat = 'symmetric';
        status = 'quantum-resistant';
        replacement = 'Verify symmetric algorithm usage (e.g. HS256 / AES-256-GCM)';
      } else {
        algoName = f.title.split(':')[0] || 'Cryptographic Primitive';
        cat = f.category === 'weak-legacy' ? 'legacy-weak' : 'asymmetric';
        status = f.quantumImpactType === 'quantum-resistant' ? 'quantum-resistant' : 'vulnerable-shor';
      }

      if (!map.has(algoName)) {
        map.set(algoName, {
          category: cat,
          quantumStatus: status,
          locations: new Set<string>(),
          replacement,
        });
      }

      const item = map.get(algoName)!;
      if (f.filePath) {
        item.locations.add(`${f.filePath}:${f.line}`);
      }
    }

    const inventory: AlgorithmInventoryItem[] = [];
    for (const [algorithm, details] of map.entries()) {
      inventory.push({
        algorithm,
        category: details.category,
        quantumStatus: details.quantumStatus,
        locationsCount: details.locations.size,
        sampleLocations: Array.from(details.locations).slice(0, 5),
        recommendedReplacement: details.replacement,
      });
    }

    return inventory.sort((a, b) => b.locationsCount - a.locationsCount);
  }
}
