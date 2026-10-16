export class SecretRedactor {
  private static readonly PRIVATE_KEY_REGEX =
    /-----BEGIN (?:[A-Z0-9_-]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z0-9_-]+ )?PRIVATE KEY-----/gi;

  private static readonly SECRET_PATTERNS: { pattern: RegExp; replacement: string }[] = [
    {
      pattern: /((?:api_?key|apiKey|access_?token|auth_?token|secret_?key|secret|private_?key|password|client_?secret|passwd|token)\s*[:=]\s*["'])([^"']{4,})(["'])/gi,
      replacement: '$1[REDACTED_SECRET]$3',
    },
    {
      pattern: /(bearer\s+)[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/gi,
      replacement: '$1[REDACTED_JWT_TOKEN]',
    },
    {
      pattern: /(AKIA[0-9A-Z]{16})/g,
      replacement: '[REDACTED_AWS_KEY]',
    },
    {
      pattern: /(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})/g,
      replacement: '[REDACTED_GITHUB_TOKEN]',
    },
    {
      pattern: /(sk-[a-zA-Z0-9]{32,})/g,
      replacement: '[REDACTED_API_KEY]',
    },
  ];

  /**
   * Redacts private keys, sensitive tokens, and credentials from a text string.
   */
  public static redact(text: string): string {
    if (!text) return text;

    let sanitized = text.replace(
      this.PRIVATE_KEY_REGEX,
      '-----BEGIN [REDACTED] PRIVATE KEY-----\n[REDACTED_PRIVATE_KEY_BODY]\n-----END [REDACTED] PRIVATE KEY-----'
    );

    for (const { pattern, replacement } of this.SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, replacement);
    }

    return sanitized;
  }

  /**
   * Extracts a context window (surrounding lines) around the specified line and redacts any secrets.
   */
  public static extractRedactedEvidence(
    fileContent: string,
    targetLineNumber: number,
    contextLines: number = 1
  ): string {
    const lines = fileContent.split('\n');
    const zeroIndexedLine = targetLineNumber - 1;

    const start = Math.max(0, zeroIndexedLine - contextLines);
    const end = Math.min(lines.length - 1, zeroIndexedLine + contextLines);

    const snippetLines: string[] = [];
    for (let i = start; i <= end; i++) {
      const lineNum = i + 1;
      const marker = lineNum === targetLineNumber ? '>' : ' ';
      const lineContent = lines[i] || '';
      const safeLine = this.redact(lineContent);
      snippetLines.push(`${marker} ${lineNum.toString().padStart(4, ' ')} | ${safeLine}`);
    }

    return snippetLines.join('\n');
  }
}
