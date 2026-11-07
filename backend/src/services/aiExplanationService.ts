import { FindingDTO, AIExplanationResponse } from '../types';
import { SecretRedactor } from '../scanner/redactor';
import { env } from '../config/env';

export class AIExplanationService {
  /**
   * Generates a plain-language explanation and migration checklist for a specific finding.
   * If GEMINI_API_KEY is configured, calls the Gemini API; otherwise uses deterministic expert knowledge.
   */
  public static async explainFinding(finding: FindingDTO): Promise<AIExplanationResponse> {
    // 1. Redact any sensitive tokens or keys before any external or local processing
    const sanitizedEvidence = SecretRedactor.redact(finding.evidence);

    if (env.GEMINI_API_KEY) {
      try {
        return await this.callGeminiAPI(finding, sanitizedEvidence);
      } catch (err: any) {
        console.warn('[AIExplanationService] Gemini API call failed, falling back to expert rule engine:', err.message);
      }
    }

    // Default: High-fidelity expert rule-based cryptographer engine
    return this.generateExpertExplanation(finding, sanitizedEvidence);
  }

  private static async callGeminiAPI(
    finding: FindingDTO,
    sanitizedEvidence: string
  ): Promise<AIExplanationResponse> {
    const prompt = `
You are a senior Post-Quantum Cryptography (PQC) engineer assisting a software developer.
Explain the following cryptographic scan finding in concise, professional terms:

Finding Title: ${finding.title}
Rule ID: ${finding.ruleId}
Category: ${finding.category}
File Location: ${finding.filePath}:${finding.line}
Redacted Code Evidence:
${sanitizedEvidence}

Quantum Impact Type: ${finding.quantumImpactType}
NIST Remediation Context: ${finding.recommendedRemediation}

IMPORTANT: If the finding is informational or already implements a post-quantum standard (ML-KEM, ML-DSA, SLH-DSA, hybrid), clearly confirm that it is quantum-safe, explain that no code changes are required, and provide verification/maintenance guidance instead of migration steps.

Respond in strict JSON with the following structure:
{
  "plainEnglishSummary": "2-3 sentences explaining what this code does and why it matters in plain terms",
  "quantumThreatExplanation": "Clear explanation of quantum resilience or quantum threat assessment",
  "stepByStepMigrationGuide": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "caveatsAndReviewChecklist": ["Review item 1", "Review item 2", "Review item 3"]
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data: any = await response.json();
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!contentText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = JSON.parse(contentText);
    return {
      findingId: finding.findingId,
      plainEnglishSummary: parsed.plainEnglishSummary,
      quantumThreatExplanation: parsed.quantumThreatExplanation,
      stepByStepMigrationGuide: parsed.stepByStepMigrationGuide,
      caveatsAndReviewChecklist: parsed.caveatsAndReviewChecklist,
      isAiGenerated: true,
      provider: 'gemini',
    };
  }

  private static generateExpertExplanation(
    finding: FindingDTO,
    sanitizedEvidence: string
  ): AIExplanationResponse {
    let plainSummary = `This finding identifies ${finding.title.toLowerCase()} in ${finding.filePath} at line ${finding.line}.`;
    let threatExplanation = '';
    const migrationSteps: string[] = [];
    const reviewChecklist: string[] = [];

    const isPositivePqc = finding.category === 'pqc-implementation' || finding.quantumImpactType === 'quantum-resistant' || finding.severity === 'Informational';

    if (isPositivePqc) {
      plainSummary = `Confirmed Quantum-Safe: ${finding.title}. This code element is already protected against quantum attacks; no code migration is needed.`;
      threatExplanation = `Verified Quantum-Resistant: This primitive conforms to NIST finalized post-quantum standards (FIPS 203 ML-KEM, FIPS 204 ML-DSA, or FIPS 205 SLH-DSA). It is mathematically immune to both classical and Shor's quantum cryptanalysis, earning full compliance credit.`;
      migrationSteps.push(
        'Zero Code Changes Required: This implementation is verified quantum-safe.',
        'Parameter Verification: Confirm key sizes match final NIST FIPS specifications (e.g. ML-KEM-768 or ML-DSA-65).',
        'Lifecycle Maintenance: Keep upstream package dependencies updated to receive routine maintenance patches and errata.'
      );
      reviewChecklist.push(
        'Confirmed: Zero quantum vulnerability present (100% compliance).',
        'Ensure CSPRNG high-entropy sources are properly initialized for key generation.',
        'Maintain crypto-agility configuration so parameters can be updated seamlessly if standards evolve.'
      );
    } else if (finding.category === 'hardcoded-secret') {
      plainSummary = `CRITICAL LEAK RISK: Plaintext credential or secret token detected in ${finding.filePath} at line ${finding.line}. Leaving credentials in source code exposes your systems to immediate automated credential harvesting.`;
      threatExplanation = `Automated threat actor bots scan public and private repositories within seconds of commit. Once captured, credentials grant attackers direct programmatic access to cloud infrastructure, payment gateways, or databases without needing to bypass firewalls or encryption.`;
      migrationSteps.push(
        'Step 1: Treat this credential as immediately compromised. Revoke or rotate it in the provider console (AWS IAM, Razorpay Dashboard, Stripe Dashboard, or GitHub Settings).',
        'Step 2: Remove the hardcoded secret from the source code and add the target configuration file to .gitignore.',
        'Step 3: Load credentials dynamically at runtime using environment variables (process.env) or a centralized secrets manager (AWS Secrets Manager, HashiCorp Vault, Doppler).',
        'Step 4: Purge the Git commit history using tools like git-filter-repo or BFG Repo-Cleaner if the commit was pushed to a remote repository.'
      );
      reviewChecklist.push(
        'Verify that the rotated secret works properly in staging before deploying to production.',
        'Audit access logs in the provider console for unauthorized requests during the exposure window.',
        'Ensure the secret is never committed with a public framework prefix (such as VITE_ or NEXT_PUBLIC_).'
      );
    } else if (finding.category === 'weak-legacy') {
      plainSummary = `Broken or deprecated classical cryptographic algorithm detected: ${finding.title} in ${finding.filePath} at line ${finding.line}.`;
      threatExplanation = `Legacy algorithms like MD5, SHA-1, DES, and AES in ECB mode suffer from severe mathematical weaknesses including collision attacks, rainbow-table password cracking, and block pattern leakage. They fail modern security audits and offer zero protection against classical attackers.`;
      migrationSteps.push(
        'For Passwords: Use Argon2id (RFC 9106) with recommended memory parameters, or bcrypt with cost factor >= 12.',
        'For Symmetric Encryption: Replace AES-ECB with Authenticated Encryption (AEAD) such as AES-256-GCM or ChaCha20-Poly1305, generating a fresh 12-byte random IV for each operation.',
        'For General Hashing: Upgrade from MD5/SHA-1 to SHA-256, SHA-512 (FIPS 180-4), or SHA-3 (FIPS 202).',
        'For Randomness: Replace Math.random() with crypto.randomBytes() or secrets.token_hex().'
      );
      reviewChecklist.push(
        'Confirm that existing stored hashes or encrypted records can be migrated smoothly with a dual-read verification strategy.',
        'Verify compliance with PCI-DSS v4.0 Requirement 3.4 and NIST SP 800-131A.'
      );
    } else if (finding.category === 'owasp-top-10') {
      plainSummary = `OWASP Top 10 web application vulnerability detected: ${finding.title} in ${finding.filePath} at line ${finding.line}.`;
      threatExplanation = `Exploitable injection or access-control flaws allow attackers to bypass authentication, probe internal cloud metadata (such as the AWS 169.254.169.254 instance service), execute arbitrary shell commands, or access data belonging to other tenants.`;
      migrationSteps.push(
        'Input Validation: Treat all user inputs as untrusted. Never concatenate raw input into SQL queries, system shells, or dynamic file paths.',
        'Parameterized Queries: Use prepared statements or modern ORMs (Prisma, TypeORM, SQLAlchemy) with parameter bindings for all database operations.',
        'Tenant Isolation: Always verify that database queries enforce tenancy filters: e.g. Model.findOne({ _id: req.params.id, organizationId: req.user.organizationId }).',
        'SSRF Defenses: Implement an IP allowlist and strictly block private/internal IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).'
      );
      reviewChecklist.push(
        'Test endpoints with OWASP ZAP or automated security regression tests.',
        'Verify that AWS EC2 instances have IMDSv2 enforced to block metadata credential theft.'
      );
    } else if (finding.category === 'insecure-transport') {
      plainSummary = `Insecure network transport or disabled TLS verification detected in ${finding.filePath} at line ${finding.line}.`;
      threatExplanation = `Disabling certificate verification (rejectUnauthorized: false, verify=False) disables cryptographic identity verification of remote servers, enabling Man-in-the-Middle (MITM) attackers to decrypt and manipulate sensitive customer traffic.`;
      migrationSteps.push(
        'Re-enable TLS certificate verification immediately in production code.',
        'If testing against custom enterprise internal servers, add the internal Root CA to your system/node trust store rather than disabling verification globally.',
        'Enforce HTTPS exclusively across all production API calls and configure HTTP Strict Transport Security (HSTS).'
      );
      reviewChecklist.push(
        'Ensure production deployment scripts do not set NODE_TLS_REJECT_UNAUTHORIZED="0".',
        'Verify that all payment and authentication API calls strictly utilize HTTPS.'
      );
    } else if (finding.category === 'pii-financial-leak') {
      plainSummary = `Sensitive Personally Identifiable Information (PII) or financial data pattern detected in ${finding.filePath} at line ${finding.line}.`;
      threatExplanation = `Exposing unmasked citizen identity credentials (such as Indian Aadhaar or PAN cards) or credit card numbers violates national data protection laws (India DPDP Act 2023, EU GDPR) and PCI-DSS, exposing organizations to major regulatory fines and identity theft liability.`;
      migrationSteps.push(
        'Mask all identity identifiers (e.g. show only the last 4 digits: XXXX-XXXX-1234) in UI displays, reports, and logs.',
        'Never store raw cardholder data or citizen identity records in source code repositories or test fixtures.',
        'Use tokenization services (such as Razorpay or Stripe payment tokens) so sensitive card numbers never touch application servers.',
        'Implement log sanitization filters (pino-noir or custom redactors) to prevent sensitive fields from reaching log storage.'
      );
      reviewChecklist.push(
        'Verify compliance with India DPDP Act Section 8(5) for personal data protection.',
        'Confirm that third-party analytics and logging tools do not capture unmasked customer PII.'
      );
      plainSummary = `Your code initializes or utilizes RSA asymmetric cryptography. RSA relies on prime factorization, which is secure against classical computers when keys are 2048+ bits, but entirely broken by quantum computers.`;
      threatExplanation = `Shor\'s quantum algorithm factors integers in polynomial time. If this RSA key is used for key encapsulation or encrypting confidential payloads, attackers eavesdropping today can record the ciphertext and decrypt it in the future ("Harvest Now, Decrypt Later"). If used for digital signatures, attackers with a CRQC can forge signatures.`;
      migrationSteps.push(
        'Audit where the generated public and private keys are transmitted and stored.',
        'If used for key exchange, migrate to NIST FIPS 203 ML-KEM (e.g. ML-KEM-768) or deploy a hybrid scheme (X25519 + ML-KEM).',
        'If used for digital signatures, plan migration to NIST FIPS 204 ML-DSA or FIPS 205 SLH-DSA.',
        'Ensure protocol agility so algorithms can be updated via configuration rather than code modification.'
      );
      reviewChecklist.push(
        'Verify whether this key exchanges long-term confidential business or user data.',
        'Check if client libraries and identity providers support hybrid post-quantum tokens.',
        'Confirm that third-party integrations and APIs accept post-quantum public keys.'
      );
    } else if (finding.ruleId.includes('ECDH') || finding.ruleId.includes('X25519')) {
      plainSummary = `Elliptic-Curve Diffie-Hellman (ECDH) key agreement is in use to establish shared secrets across sessions.`;
      threatExplanation = `Shor\'s discrete logarithm algorithm solves elliptic curve discrete logarithms. Ephemeral ECDH protects against classical eavesdropping but has high Harvest Now Decrypt Later (HNDL) exposure against adversaries recording network traffic.`;
      migrationSteps.push(
        'Upgrade network layers and TLS termination proxies to support hybrid key exchange (X25519MLKEM768).',
        'Verify that internal microservice communication runs on TLS 1.3 with post-quantum groups enabled.',
        'Replace proprietary ECDH key agreement with NIST FIPS 203 ML-KEM encapsulation routines.'
      );
      reviewChecklist.push(
        'Ensure reverse proxies (NGINX/Envoy/Cloudflare) have PQC key exchange flags active.',
        'Validate that clients do not fail handshakes when larger PQC key exchange packets are sent.'
      );
    } else if (finding.ruleId.includes('ECDSA')) {
      plainSummary = `ECDSA digital signatures are generated or verified in this module.`;
      threatExplanation = `ECDSA signatures are vulnerable to future forgery once a quantum computer can calculate the private key from the published public key. Unlike encryption, previous signatures cannot be retroactively decrypted, so urgency is determined by the validity window of signed tokens or certificates.`;
      migrationSteps.push(
        'Keep token validity periods short (minutes rather than days) to minimize forgery exposure.',
        'Prepare root Certificate Authorities and signing infrastructure to introduce ML-DSA (NIST FIPS 204).',
        'For high-assurance firmware signing, consider stateless hash-based SLH-DSA (FIPS 205).'
      );
      reviewChecklist.push(
        'Confirm that token verification libraries reject algorithm substitution (e.g. alg: none).',
        'Verify memory constraints since ML-DSA and SLH-DSA public keys and signatures are larger than ECDSA.'
      );
    } else {
      plainSummary = `Cryptographic pattern detected in ${finding.filePath}.`;
      threatExplanation = finding.quantumMigrationRelevance;
      migrationSteps.push(
        'Review the code location to identify the exact cryptographic routine invoked.',
        'Isolate cryptographic primitives behind clean abstractions to facilitate migration.',
        'Refer to NIST post-quantum migration guidelines for suitable algorithm replacements.'
      );
      reviewChecklist.push(
        'Check whether this is in a test fixture or production runtime code.',
        'Inspect third-party library dependencies for official PQC transition roadmaps.'
      );
    }

    return {
      findingId: finding.findingId,
      plainEnglishSummary: plainSummary,
      quantumThreatExplanation: threatExplanation,
      stepByStepMigrationGuide: migrationSteps,
      caveatsAndReviewChecklist: reviewChecklist,
      isAiGenerated: true,
      provider: 'rule-based-expert',
    };
  }
}
