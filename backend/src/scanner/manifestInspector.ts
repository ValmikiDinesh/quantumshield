import { FindingDTO } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { RULES_VERSION } from './rules/catalog';
import { SecretRedactor } from './redactor';

export class ManifestInspector {
  /**
   * Inspects dependency manifests and configuration files for cryptographic package declarations.
   */
  public static inspectManifest(
    relativePath: string,
    content: string
  ): FindingDTO[] {
    const findings: FindingDTO[] = [];
    const fileName = (relativePath.split('/').pop() || '').toLowerCase();

    if (fileName === 'package.json') {
      findings.push(...this.inspectPackageJson(relativePath, content));
    } else if (fileName === 'requirements.txt' || fileName === 'pipfile') {
      findings.push(...this.inspectPythonRequirements(relativePath, content));
    } else if (fileName === 'go.mod') {
      findings.push(...this.inspectGoMod(relativePath, content));
    } else if (fileName === 'cargo.toml') {
      findings.push(...this.inspectCargoToml(relativePath, content));
    } else if (fileName === 'pom.xml') {
      findings.push(...this.inspectPomXml(relativePath, content));
    } else if (fileName === 'build.gradle' || fileName === 'build.gradle.kts') {
      findings.push(...this.inspectGradle(relativePath, content));
    } else if (fileName === 'composer.json') {
      findings.push(...this.inspectComposerJson(relativePath, content));
    } else if (fileName.endsWith('.csproj') || fileName === 'packages.config') {
      findings.push(...this.inspectDotNet(relativePath, content));
    }

    return findings;
  }

  private static inspectPackageJson(filePath: string, content: string): FindingDTO[] {
    const findings: FindingDTO[] = [];
    try {
      const pkg = JSON.parse(content);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      const cryptoLibs: Record<string, { desc: string; pqcRelevance: string; isPqc?: boolean }> = {
        'node-rsa': {
          desc: 'Declared Node.js RSA library dependency.',
          pqcRelevance: 'RSA asymmetric cryptography will be broken by Shor\'s algorithm.',
        },
        'elliptic': {
          desc: 'Declared Elliptic Curve cryptography package.',
          pqcRelevance: 'ECDSA and ECDH will be broken by Shor\'s discrete log algorithm.',
        },
        'crypto-js': {
          desc: 'Declared CryptoJS client-side cryptography package.',
          pqcRelevance: 'Evaluate whether legacy symmetric ciphers or asymmetric operations are used.',
        },
        'jsonwebtoken': {
          desc: 'Declared JWT package.',
          pqcRelevance: 'Tokens signed with RS256/ES256 rely on quantum-vulnerable signatures.',
        },
        'openquantumsafe': {
          desc: 'Declared Open Quantum Safe (liboqs) wrapper dependency.',
          pqcRelevance: 'POSITIVE: Provides post-quantum algorithms (ML-KEM, ML-DSA).',
          isPqc: true,
        },
        'crystals-kyber-js': {
          desc: 'Declared pure JS implementation of CRYSTALS-Kyber / ML-KEM.',
          pqcRelevance: 'POSITIVE: ML-KEM post-quantum key encapsulation support.',
          isPqc: true,
        },
      };

      for (const [depName, info] of Object.entries(cryptoLibs)) {
        if (allDeps[depName]) {
          const version = allDeps[depName];
          const line = this.findLineInText(content, `"${depName}"`);
          findings.push({
            findingId: uuidv4(),
            ruleId: info.isPqc ? 'PQC-ALG-MLKEM-FIPS203' : 'PQC-LIB-MANIFEST-DEP',
            ruleVersion: RULES_VERSION,
            title: `Cryptographic Package Declared: ${depName}@${version}`,
            description: info.desc,
            category: info.isPqc ? 'pqc-implementation' : 'cryptographic-api',
            severity: 'Informational',
            confidence: 'High',
            classification: info.isPqc ? 'Confirmed pattern match' : 'Informational observation',
            filePath,
            line: line > 0 ? line : 1,
            column: 1,
            evidence: SecretRedactor.extractRedactedEvidence(content, line > 0 ? line : 1, 1),
            detectionMethod: 'manifest-inspector',
            quantumMigrationRelevance: info.pqcRelevance,
            conventionalSecurityRelevance:
              'Verify package version is actively maintained and free from known CVEs.',
            recommendedRemediation: info.isPqc
              ? 'Maintain dependency update schedule aligning with NIST FIPS 203/204 standard revisions.'
              : 'Audit project source code to verify which specific algorithms are actively invoked from this package.',
            referenceLinks: [
              { title: 'NIST PQC Information', url: 'https://csrc.nist.gov/Projects/post-quantum-cryptography' },
            ],
            quantumImpactType: info.isPqc ? 'quantum-resistant' : 'crypto-agility',
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Ignored if JSON parsing fails
    }
    return findings;
  }

  private static inspectPythonRequirements(filePath: string, content: string): FindingDTO[] {
    const findings: FindingDTO[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed) return;

      const lineNum = index + 1;
      if (/^cryptography\b/i.test(trimmed)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'Python cryptography library declared',
            'cryptography package provides standard primitives. Audit for RSA/ECC usage.',
            'crypto-agility'
          )
        );
      } else if (/^pycryptodome\b/i.test(trimmed)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'PyCryptodome package declared',
            'PyCryptodome provides classical asymmetric and symmetric routines.',
            'crypto-agility'
          )
        );
      } else if (/^oqs\b|^liboqs\b/i.test(trimmed)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'Open Quantum Safe Python wrapper declared',
            'POSITIVE: liboqs bindings provide post-quantum algorithm support.',
            'quantum-resistant',
            'pqc-implementation',
            'Informational'
          )
        );
      }
    });

    return findings;
  }

  private static inspectGoMod(filePath: string, content: string): FindingDTO[] {
    const findings: FindingDTO[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      if (line.includes('github.com/cloudflare/circl')) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'Cloudflare CIRCL Cryptographic Library declared in go.mod',
            'POSITIVE: CIRCL includes post-quantum key encapsulation (ML-KEM) and signatures.',
            'quantum-resistant',
            'pqc-implementation',
            'Informational'
          )
        );
      }
    });

    return findings;
  }

  private static inspectCargoToml(filePath: string, content: string): FindingDTO[] {
    const findings: FindingDTO[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      if (/^\s*(?:pqcrypto|oqs|crystals-kyber|ml-kem)\b/i.test(line)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'Rust Post-Quantum Cryptography crate declared in Cargo.toml',
            'POSITIVE: Post-quantum crate indicates proactive adoption of lattice or hash-based algorithms.',
            'quantum-resistant',
            'pqc-implementation',
            'Informational'
          )
        );
      }
    });

    return findings;
  }

  private static inspectPomXml(filePath: string, content: string): FindingDTO[] {
    const findings: FindingDTO[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      if (/bouncycastle|bcprov|bcpkix/i.test(line)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'Maven Dependency: Bouncy Castle Cryptography Provider declared in pom.xml',
            'Bouncy Castle provides asymmetric and symmetric crypto. Review for RSA/ECDSA usage vs post-quantum modules.',
            'crypto-agility'
          )
        );
      } else if (/jjwt|nimbus-jose-jwt/i.test(line)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'Maven Dependency: Java JWT security library declared in pom.xml',
            'RS256/ES256 asymmetric token signatures are quantum-vulnerable to Shor\'s algorithm.',
            'crypto-agility'
          )
        );
      }
    });

    return findings;
  }

  private static inspectGradle(filePath: string, content: string): FindingDTO[] {
    const findings: FindingDTO[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      if (/bouncycastle|bcprov|bcpkix/i.test(line)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'Gradle Dependency: Bouncy Castle declared in build.gradle',
            'Bouncy Castle cryptography provider detected. Audit whether legacy RSA/ECC primitives or PQC modules are invoked.',
            'crypto-agility'
          )
        );
      } else if (/jjwt|jsonwebtoken/i.test(line)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            'Gradle Dependency: JJWT library declared in build.gradle',
            'Tokens signed with RS256/ES256 rely on quantum-vulnerable asymmetric keys.',
            'crypto-agility'
          )
        );
      }
    });

    return findings;
  }

  private static inspectComposerJson(filePath: string, content: string): FindingDTO[] {
    const findings: FindingDTO[] = [];
    try {
      const pkg = JSON.parse(content);
      const allDeps = {
        ...(pkg.require || {}),
        ...('require-dev' in pkg ? pkg['require-dev'] : {}),
      };

      const phpCryptoMap: Record<string, { desc: string; pqcRelevance: string }> = {
        'paragonie/sodium_compat': {
          desc: 'PHP sodium_compat library declared in composer.json.',
          pqcRelevance: 'Provides Ed25519/X25519 elliptic curve operations. Vulnerable to Shor\'s algorithm on quantum hardware.',
        },
        'firebase/php-jwt': {
          desc: 'PHP Firebase JWT library declared in composer.json.',
          pqcRelevance: 'RS256 and ES256 signatures are vulnerable to quantum decryption/forgery.',
        },
        'lcobucci/jwt': {
          desc: 'PHP Lcobucci JWT library declared in composer.json.',
          pqcRelevance: 'Asymmetric token signatures will require migration to post-quantum signature schemes (ML-DSA / FIPS 204).',
        },
        'phpseclib/phpseclib': {
          desc: 'PHP phpseclib pure-PHP crypto suite declared in composer.json.',
          pqcRelevance: 'Contains software implementations of RSA, DH, and DSA. High migration priority.',
        },
      };

      for (const [depName, info] of Object.entries(phpCryptoMap)) {
        if (allDeps[depName]) {
          const line = this.findLineInText(content, `"${depName}"`);
          findings.push(
            this.createManifestFinding(
              filePath,
              line > 0 ? line : 1,
              content,
              `PHP Composer Dependency: ${depName} declared`,
              info.pqcRelevance,
              'crypto-agility'
            )
          );
        }
      }
    } catch {
      // Ignored if invalid JSON
    }
    return findings;
  }

  private static inspectDotNet(filePath: string, content: string): FindingDTO[] {
    const findings: FindingDTO[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      if (/BouncyCastle\.Cryptography|Portable\.BouncyCastle/i.test(line)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            '.NET Package: BouncyCastle declared in project manifest',
            'BouncyCastle cryptographic suite for .NET. Check for RSA/ECDSA key exchange and signatures.',
            'crypto-agility'
          )
        );
      } else if (/System\.Security\.Cryptography|Microsoft\.IdentityModel\.Tokens/i.test(line)) {
        findings.push(
          this.createManifestFinding(
            filePath,
            lineNum,
            content,
            '.NET Package: Cryptography / Identity Model Tokens declared',
            'Examine asymmetric key generation and signature validation routines for quantum vulnerability.',
            'crypto-agility'
          )
        );
      }
    });

    return findings;
  }

  private static createManifestFinding(
    filePath: string,
    line: number,
    content: string,
    title: string,
    pqcRelevance: string,
    impact: 'crypto-agility' | 'quantum-resistant',
    category: 'cryptographic-api' | 'pqc-implementation' = 'cryptographic-api',
    severity: 'Informational' | 'Low' = 'Informational'
  ): FindingDTO {
    return {
      findingId: uuidv4(),
      ruleId: category === 'pqc-implementation' ? 'PQC-ALG-MLKEM-FIPS203' : 'PQC-LIB-MANIFEST-DEP',
      ruleVersion: RULES_VERSION,
      title,
      description: `Manifest dependency reference detected at line ${line}.`,
      category,
      severity,
      confidence: 'High',
      classification: category === 'pqc-implementation' ? 'Confirmed pattern match' : 'Informational observation',
      filePath,
      line,
      column: 1,
      evidence: SecretRedactor.extractRedactedEvidence(content, line, 1),
      detectionMethod: 'manifest-inspector',
      quantumMigrationRelevance: pqcRelevance,
      conventionalSecurityRelevance: 'Keep dependency manifests pinned and updated with security advisories.',
      recommendedRemediation:
        'Verify whether this package is used for asymmetric key agreement or signatures and plan migration accordingly.',
      referenceLinks: [
        { title: 'NIST PQC Standardization', url: 'https://csrc.nist.gov/Projects/post-quantum-cryptography' },
      ],
      quantumImpactType: impact,
      timestamp: new Date().toISOString(),
    };
  }

  private static findLineInText(text: string, needle: string): number {
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(needle)) {
        return i + 1;
      }
    }
    return 1;
  }
}
