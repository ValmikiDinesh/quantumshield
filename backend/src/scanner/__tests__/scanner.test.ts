import { describe, it, expect } from 'vitest';
import { ScannerEngine } from '../engine';
import { FileScanInput } from '../../types';

describe('ScannerEngine Unit Tests', () => {
  it('detects RSA key generation across JS, Python, and Java', async () => {
    const files: FileScanInput[] = [
      {
        filePath: 'src/crypto/rsa-test.ts',
        relativePath: 'src/crypto/rsa-test.ts',
        content: `
import crypto from 'crypto';
export function generateUserKey() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  return { publicKey, privateKey };
}
        `,
        extension: '.ts',
        sizeBytes: 200,
      },
      {
        filePath: 'backend/crypto.py',
        relativePath: 'backend/crypto.py',
        content: `
from cryptography.hazmat.primitives.asymmetric import rsa
def make_key():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return key
        `,
        extension: '.py',
        sizeBytes: 150,
      },
      {
        filePath: 'src/main/java/SecurityService.java',
        relativePath: 'src/main/java/SecurityService.java',
        content: `
package com.example;
import java.security.KeyPairGenerator;
public class SecurityService {
  public void init() throws Exception {
    KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
    kpg.initialize(2048);
  }
}
        `,
        extension: '.java',
        sizeBytes: 250,
      },
    ];

    const result = await ScannerEngine.scanFiles(files);
    expect(result.findings.length).toBeGreaterThanOrEqual(3);

    const rsaFindings = result.findings.filter(f => f.ruleId === 'PQC-PUB-RSA-KEYGEN');
    expect(rsaFindings.length).toBe(3);
    expect(rsaFindings[0].quantumImpactType).toBe('harvest-now-decrypt-later');
    expect(rsaFindings[0].severity).toBe('High');
  });

  it('detects ECDH and ECDSA separately with correct quantum impact classifications', async () => {
    const files: FileScanInput[] = [
      {
        filePath: 'src/network/tls_handshake.ts',
        relativePath: 'src/network/tls_handshake.ts',
        content: `
const ecdh = crypto.createECDH('prime256v1');
ecdh.generateKeys();
        `,
        extension: '.ts',
        sizeBytes: 80,
      },
      {
        filePath: 'src/auth/token_signer.ts',
        relativePath: 'src/auth/token_signer.ts',
        content: `
jwt.sign(payload, privateKey, { algorithm: 'ES256' });
        `,
        extension: '.ts',
        sizeBytes: 80,
      },
    ];

    const result = await ScannerEngine.scanFiles(files);
    const ecdhFinding = result.findings.find(f => f.ruleId === 'PQC-PUB-ECC-ECDH');
    expect(ecdhFinding).toBeDefined();
    expect(ecdhFinding?.quantumImpactType).toBe('harvest-now-decrypt-later');

    const ecdsaFinding = result.findings.find(f => f.ruleId === 'PQC-PUB-ECC-ECDSA' || f.ruleId === 'PQC-LIB-JWT-ALGO');
    expect(ecdsaFinding).toBeDefined();
    expect(ecdsaFinding?.quantumImpactType).toBe('future-forgeability');
  });

  it('detects post-quantum algorithms (ML-KEM, ML-DSA, SLH-DSA, Hybrid) and marks them positively', async () => {
    const files: FileScanInput[] = [
      {
        filePath: 'src/pqc/kem.ts',
        relativePath: 'src/pqc/kem.ts',
        content: `
// Standardized NIST FIPS 203 ML-KEM
const clientKEM = new ML-KEM-768();
const hybridKex = "X25519MLKEM768";
        `,
        extension: '.ts',
        sizeBytes: 120,
      },
      {
        filePath: 'src/pqc/signatures.rs',
        relativePath: 'src/pqc/signatures.rs',
        content: `
// NIST FIPS 204 ML-DSA and FIPS 205 SLH-DSA
use pqcrypto_mldsa::mldsa65;
use pqcrypto_sphincsplus::slhdsa;
        `,
        extension: '.rs',
        sizeBytes: 140,
      },
    ];

    const result = await ScannerEngine.scanFiles(files);
    const mlkem = result.findings.find(f => f.ruleId === 'PQC-ALG-MLKEM-FIPS203');
    const hybrid = result.findings.find(f => f.ruleId === 'PQC-HYBRID-KEX');
    const mldsa = result.findings.find(f => f.ruleId === 'PQC-ALG-MLDSA-FIPS204');
    const slhdsa = result.findings.find(f => f.ruleId === 'PQC-ALG-SLHDSA-FIPS205');

    expect(mlkem).toBeDefined();
    expect(mlkem?.category).toBe('pqc-implementation');
    expect(mlkem?.quantumImpactType).toBe('quantum-resistant');

    expect(hybrid).toBeDefined();
    expect(mldsa).toBeDefined();
    expect(slhdsa).toBeDefined();
  });

  it('separates legacy weak algorithms (MD5/DES) from quantum migration findings', async () => {
    const files: FileScanInput[] = [
      {
        filePath: 'src/legacy/hasher.js',
        relativePath: 'src/legacy/hasher.js',
        content: `
const hash = crypto.createHash('md5').update('data').digest('hex');
const cipher = crypto.createCipheriv('des', key, iv);
        `,
        extension: '.js',
        sizeBytes: 150,
      },
    ];

    const result = await ScannerEngine.scanFiles(files);
    const legacyFindings = result.findings.filter(f => f.category === 'weak-legacy');
    expect(legacyFindings.length).toBeGreaterThan(0);
    expect(legacyFindings[0].quantumImpactType).toBe('not-quantum-specific');
  });

  it('does not produce false positives on non-cryptographic code', async () => {
    const files: FileScanInput[] = [
      {
        filePath: 'src/utils/math.ts',
        relativePath: 'src/utils/math.ts',
        content: `
export function add(a: number, b: number): number {
  return a + b;
}
export function multiply(a: number, b: number): number {
  return a * b;
}
        `,
        extension: '.ts',
        sizeBytes: 100,
      },
    ];

    const result = await ScannerEngine.scanFiles(files);
    expect(result.findings.length).toBe(0);
    expect(result.readinessAssessment.readinessScore).toBe(100);
    expect(result.readinessAssessment.riskLevel).toBe('Post-Quantum Prepared');
  });

  it('detects multi-line formatted cryptographic calls across newlines', async () => {
    const files: FileScanInput[] = [
      {
        filePath: 'src/crypto/formatted-rsa.ts',
        relativePath: 'src/crypto/formatted-rsa.ts',
        content: `
import crypto from 'crypto';
export function createFormattedKey() {
  return crypto.generateKeyPairSync(
    'rsa',
    {
      modulusLength: 4096
    }
  );
}
        `,
        extension: '.ts',
        sizeBytes: 250,
      },
    ];

    const result = await ScannerEngine.scanFiles(files);
    expect(result.findings.length).toBeGreaterThanOrEqual(1);
    const rsaFinding = result.findings.find(f => f.ruleId === 'PQC-PUB-RSA-KEYGEN');
    expect(rsaFinding).toBeDefined();
    expect(rsaFinding?.line).toBe(4);
  });

  it('detects cryptographic libraries in Maven pom.xml, Gradle build.gradle, and Composer composer.json', async () => {
    const files: FileScanInput[] = [
      {
        filePath: 'pom.xml',
        relativePath: 'pom.xml',
        content: `
<project>
  <dependencies>
    <dependency>
      <groupId>org.bouncycastle</groupId>
      <artifactId>bcprov-jdk18on</artifactId>
      <version>1.78</version>
    </dependency>
  </dependencies>
</project>
        `,
        extension: '.xml',
        sizeBytes: 300,
      },
      {
        filePath: 'composer.json',
        relativePath: 'composer.json',
        content: JSON.stringify({
          require: {
            'paragonie/sodium_compat': '^1.20',
            'firebase/php-jwt': '^6.0'
          }
        }),
        extension: '.json',
        sizeBytes: 150,
      },
      {
        filePath: 'App.csproj',
        relativePath: 'App.csproj',
        content: `
<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="BouncyCastle.Cryptography" Version="2.3.0" />
  </ItemGroup>
</Project>
        `,
        extension: '.csproj',
        sizeBytes: 200,
      }
    ];

    const result = await ScannerEngine.scanFiles(files);
    expect(result.findings.length).toBeGreaterThanOrEqual(4);
    const manifestFindings = result.findings.filter(f => f.detectionMethod === 'manifest-inspector');
    expect(manifestFindings.length).toBeGreaterThanOrEqual(4);
  });
});
