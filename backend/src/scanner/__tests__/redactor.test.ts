import { describe, it, expect } from 'vitest';
import { SecretRedactor } from '../redactor';

describe('SecretRedactor Unit Tests', () => {
  it('redacts RSA and EC private key blocks', () => {
    const raw = `
const rsaKey = \`-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0wQ8V...
sensitiveKeyPayloadData...
-----END RSA PRIVATE KEY-----\`;
const other = "normal";
    `;

    const redacted = SecretRedactor.redact(raw);
    expect(redacted).not.toContain('sensitiveKeyPayloadData');
    expect(redacted).toContain('[REDACTED_PRIVATE_KEY_BODY]');
    expect(redacted).toContain('-----BEGIN [REDACTED] PRIVATE KEY-----');
  });

  it('redacts API keys, tokens, and passwords', () => {
    const raw = `
const apiKey = "sk-1234567890abcdef1234567890abcdef";
const password = "super_secret_production_password";
const header = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisSignature";
    `;

    const redacted = SecretRedactor.redact(raw);
    expect(redacted).not.toContain('super_secret_production_password');
    expect(redacted).not.toContain('sk-1234567890abcdef1234567890abcdef');
    expect(redacted).not.toContain('doNotLeakThisSignature');
    expect(redacted).toContain('[REDACTED_SECRET]');
    expect(redacted).toContain('[REDACTED_JWT_TOKEN]');
  });

  it('extracts surrounding lines with secrets redacted and arrow indicator', () => {
    const code = `
line 1: import crypto from 'crypto';
line 2: const secret = "super_confidential_pass";
line 3: const key = crypto.generateKeyPairSync('rsa');
line 4: console.log(key);
line 5: return key;
    `.trim();

    const evidence = SecretRedactor.extractRedactedEvidence(code, 3, 1);
    expect(evidence).toContain('>    3 | line 3: const key = crypto.generateKeyPairSync(\'rsa\');');
    expect(evidence).not.toContain('super_confidential_pass');
    expect(evidence).toContain('[REDACTED_SECRET]');
  });
});
