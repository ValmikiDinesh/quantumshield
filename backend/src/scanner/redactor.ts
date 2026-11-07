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
    {
      pattern: /(rzp_(?:live|test)_[a-zA-Z0-9]{14})/g,
      replacement: '[REDACTED_RAZORPAY_KEY]',
    },
    {
      pattern: /((?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{24,})/g,
      replacement: '[REDACTED_STRIPE_KEY]',
    },
    {
      pattern: /(AIza[0-9A-Za-z\-_]{35})/g,
      replacement: '[REDACTED_GOOGLE_KEY]',
    },
    {
      pattern: /(xox[baprs]-[0-9a-zA-Z]{10,48})/g,
      replacement: '[REDACTED_SLACK_TOKEN]',
    },
    {
      pattern: /((?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[^:\s]+:)([^@\s]+)(@)/gi,
      replacement: '$1[REDACTED_DB_PASSWORD]$3',
    },
    {
      pattern: /\b([2-9][0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4})\b/g,
      replacement: '[REDACTED_AADHAAR]',
    },
    {
      pattern: /\b([A-Z]{5}[0-9]{4}[A-Z])\b/g,
      replacement: '[REDACTED_PAN_CARD]',
    },
    {
      pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
      replacement: '[REDACTED_CREDIT_CARD]',
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
