import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execFileAsync = promisify(execFile);

export interface GitCloneResult {
  tempDir: string;
  cleanRepoName: string;
  cleanDisplayUrl: string;
  branch: string;
  commitHash?: string;
  owner: string;
  repo: string;
}

export class GitService {
  /**
   * Validates and normalizes a repository URL or shorthand.
   * Defends against command injection, flag injection, and SSRF attacks.
   */
  public static validateAndNormalize(rawUrl: string, token?: string): {
    cloneUrl: string;
    cleanDisplayUrl: string;
    owner: string;
    repo: string;
    hostname: string;
  } {
    let trimmed = (rawUrl || '').trim();
    if (!trimmed) {
      throw new Error('Repository URL or shorthand (e.g. owner/repo) is required.');
    }

    // Expand common shorthand like "owner/repo"
    if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      trimmed = `https://github.com/${trimmed}.git`;
    } else if (trimmed.startsWith('github.com/')) {
      trimmed = `https://${trimmed}`;
    } else if (trimmed.startsWith('gitlab.com/') || trimmed.startsWith('bitbucket.org/')) {
      trimmed = `https://${trimmed}`;
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new Error('Invalid repository URL format. Example: https://github.com/owner/repository');
    }

    // Security: Enforce HTTPS only (no file://, ssh://, git://, http://)
    if (parsed.protocol !== 'https:') {
      throw new Error('Only secure HTTPS Git repository URLs are permitted.');
    }

    const hostname = parsed.hostname.toLowerCase();

    // Security: SSRF Prevention - Disallow internal IP addresses, metadata endpoints, and localhost
    const disallowedHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'];
    if (
      disallowedHostnames.includes(hostname) ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      throw new Error('Private, internal, or loopback network addresses are strictly prohibited for repository scanning.');
    }

    // Extract path components
    const cleanPath = parsed.pathname.replace(/^\/+/, '').replace(/\.git$/, '');
    const pathParts = cleanPath.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid repository path. Expected format: https://github.com/owner/repository');
    }

    const owner = pathParts[0];
    const repo = pathParts[1];
    const cleanDisplayUrl = `https://${hostname}/${owner}/${repo}`;

    let cloneUrl = `https://${hostname}/${owner}/${repo}.git`;
    if (token && token.trim()) {
      const sanitizedToken = encodeURIComponent(token.trim());
      // Format accepted by GitHub, GitLab, and Bitbucket for token authentication
      cloneUrl = `https://x-access-token:${sanitizedToken}@${hostname}/${owner}/${repo}.git`;
    }

    return {
      cloneUrl,
      cleanDisplayUrl,
      owner,
      repo,
      hostname,
    };
  }

  /**
   * Executes a shallow clone (--depth 1) into a temporary scratch directory.
   */
  public static async clone(
    rawUrl: string,
    options?: { branch?: string; token?: string; timeoutMs?: number }
  ): Promise<GitCloneResult> {
    const { cloneUrl, cleanDisplayUrl, owner, repo } = this.validateAndNormalize(rawUrl, options?.token);

    const tempDir = path.join(os.tmpdir(), `qs-git-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const timeout = options?.timeoutMs || 60000; // 60 seconds maximum
    const branch = options?.branch?.trim();

    // Build arguments array (never a raw shell string) to eliminate command injection risk
    const args = ['clone', '--depth', '1', '--single-branch'];

    if (branch) {
      // Validate branch name against flag injection (cannot start with -)
      if (branch.startsWith('-') || !/^[a-zA-Z0-9_.-]+(\/[a-zA-Z0-9_.-]+)*$/.test(branch)) {
        throw new Error('Invalid branch name. Branch names must not start with a hyphen or contain special characters.');
      }
      args.push('-b', branch);
    }

    args.push(cloneUrl, tempDir);

    try {
      await execFileAsync('git', args, {
        timeout,
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: '0', // Prevent hanging on interactive credential prompts
          GIT_ASKPASS: 'echo',
        },
      });

      // Extract latest commit hash for audit tracking
      let commitHash: string | undefined;
      try {
        const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: tempDir, timeout: 5000 });
        commitHash = stdout.trim();
      } catch {
        // Optional metadata
      }

      return {
        tempDir,
        cleanRepoName: `${owner}/${repo}`,
        cleanDisplayUrl,
        branch: branch || 'default',
        commitHash,
        owner,
        repo,
      };
    } catch (err: any) {
      // Ensure temp directory is removed on failure
      this.cleanup(tempDir);

      let msg = err.message || 'Git clone failed';
      // Redact sensitive tokens from any error message
      if (options?.token) {
        msg = msg.replace(new RegExp(options.token.trim(), 'g'), '[REDACTED_TOKEN]');
      }

      if (msg.includes('Repository not found') || msg.includes('Authentication failed')) {
        throw new Error(`Repository not found or access denied. If this is a private repository, please provide a GitHub Personal Access Token.`);
      }

      if (msg.includes('Remote branch') && msg.includes('not found')) {
        throw new Error(`Branch "${branch}" was not found on remote repository.`);
      }

      throw new Error(`Git clone operation failed: ${msg}`);
    }
  }

  /**
   * Safely and synchronously deletes the temporary clone directory to satisfy Zero Code Retention Guarantee.
   */
  public static cleanup(tempDir: string): void {
    try {
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (e: any) {
      console.warn(`[GitService] Error cleaning up temporary directory ${tempDir}:`, e.message);
    }
  }
}
