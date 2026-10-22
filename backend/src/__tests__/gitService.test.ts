import { describe, it, expect } from 'vitest';
import { GitService } from '../services/gitService';

describe('GitService URL Validation & SSRF Defenses', () => {
  it('correctly normalizes standard GitHub https URLs', () => {
    const res = GitService.validateAndNormalize('https://github.com/ValmikiDinesh/quantumshield');
    expect(res.cleanDisplayUrl).toBe('https://github.com/ValmikiDinesh/quantumshield');
    expect(res.cloneUrl).toBe('https://github.com/ValmikiDinesh/quantumshield.git');
    expect(res.owner).toBe('ValmikiDinesh');
    expect(res.repo).toBe('quantumshield');
  });

  it('correctly expands shorthand "owner/repo" to full https GitHub URL', () => {
    const res = GitService.validateAndNormalize('facebook/react');
    expect(res.cleanDisplayUrl).toBe('https://github.com/facebook/react');
    expect(res.cloneUrl).toBe('https://github.com/facebook/react.git');
    expect(res.owner).toBe('facebook');
    expect(res.repo).toBe('react');
  });

  it('safely embeds personal access tokens for authenticated cloning', () => {
    const token = 'ghp_secretToken1234567890abcdef';
    const res = GitService.validateAndNormalize('https://github.com/org/private-repo', token);
    expect(res.cloneUrl).toContain('x-access-token:ghp_secretToken1234567890abcdef@github.com/org/private-repo.git');
    expect(res.cleanDisplayUrl).toBe('https://github.com/org/private-repo');
  });

  it('rejects insecure HTTP or non-https protocols', () => {
    expect(() => GitService.validateAndNormalize('http://github.com/org/repo')).toThrow(
      'Only secure HTTPS Git repository URLs are permitted'
    );
    expect(() => GitService.validateAndNormalize('file:///etc/passwd')).toThrow(
      'Only secure HTTPS Git repository URLs are permitted'
    );
  });

  it('blocks SSRF attacks targeting localhost, loopback, and cloud metadata services', () => {
    expect(() => GitService.validateAndNormalize('https://localhost/org/repo')).toThrow(
      'Private, internal, or loopback network addresses are strictly prohibited'
    );
    expect(() => GitService.validateAndNormalize('https://127.0.0.1/org/repo')).toThrow(
      'Private, internal, or loopback network addresses are strictly prohibited'
    );
    expect(() => GitService.validateAndNormalize('https://169.254.169.254/latest/meta-data')).toThrow(
      'Private, internal, or loopback network addresses are strictly prohibited'
    );
    expect(() => GitService.validateAndNormalize('https://10.0.0.5/org/repo')).toThrow(
      'Private, internal, or loopback network addresses are strictly prohibited'
    );
  });
});
