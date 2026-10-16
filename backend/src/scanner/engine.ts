import { v4 as uuidv4 } from 'uuid';
import {
  FileScanInput,
  FindingDTO,
  AlgorithmInventoryItem,
  ReadinessAssessment,
} from '../types';
import { RULE_CATALOG, SCANNER_VERSION, RULES_VERSION } from './rules/catalog';
import { ManifestInspector } from './manifestInspector';
import { SecretRedactor } from './redactor';
import { ReadinessAssessor } from './readinessAssessor';

export interface ScanExecutionResult {
  scannerVersion: string;
  rulesVersion: string;
  fileCount: number;
  supportedFileCount: number;
  durationMs: number;
  findings: FindingDTO[];
  algorithmInventory: AlgorithmInventoryItem[];
  readinessAssessment: ReadinessAssessment;
}

export class ScannerEngine {
  /**
   * Deterministically scans an array of input files across rules and manifests.
   * Supports both single-line and formatted multi-line function calls across whitespace/newlines.
   */
  public static async scanFiles(files: FileScanInput[]): Promise<ScanExecutionResult> {
    const startTime = Date.now();
    const findings: FindingDTO[] = [];

    for (const file of files) {
      // 1. Manifest / Config inspection
      const manifestFindings = ManifestInspector.inspectManifest(file.relativePath, file.content);
      findings.push(...manifestFindings);

      // 2. Rule catalog inspection
      const fileExt = file.extension.toLowerCase();

      const applicableRules = RULE_CATALOG.filter(rule => {
        if (rule.filePatterns && rule.filePatterns.length > 0) {
          return rule.filePatterns.some(pattern => pattern.test(file.relativePath));
        }
        if (rule.fileExtensions && rule.fileExtensions.length > 0) {
          return rule.fileExtensions.includes(fileExt);
        }
        return true;
      });

      const seenRuleLines = new Set<string>();

      for (const rule of applicableRules) {
        for (const patternObj of rule.patterns) {
          // Construct global multiline regex to match both single-line and multi-line calls
          let flags = 'gm';
          if (patternObj.regex.ignoreCase) flags += 'i';
          const globalRegex = new RegExp(patternObj.regex.source, flags);

          let match: RegExpExecArray | null;
          while ((match = globalRegex.exec(file.content)) !== null) {
            const matchIndex = match.index;
            const matchText = match[0];

            const { line, column } = this.getLineAndColumn(file.content, matchIndex);

            // Check if suppressed by negative patterns
            if (rule.negativePatterns && rule.negativePatterns.some(np => np.test(matchText))) {
              continue;
            }

            // Deduplicate multiple regex pattern matches for the same rule on the same line
            const findingKey = `${rule.id}:${file.relativePath}:${line}`;
            if (seenRuleLines.has(findingKey)) {
              continue;
            }
            seenRuleLines.add(findingKey);

            const evidence = SecretRedactor.extractRedactedEvidence(
              file.content,
              line,
              1
            );

            findings.push({
              findingId: uuidv4(),
              ruleId: rule.id,
              ruleVersion: rule.version,
              title: rule.title,
              description: rule.description,
              category: rule.category,
              severity: patternObj.severity || rule.defaultSeverity,
              confidence: patternObj.confidence || rule.defaultConfidence,
              classification: rule.classification,
              filePath: file.relativePath,
              line,
              column,
              evidence,
              detectionMethod: 'regex-engine',
              quantumMigrationRelevance: rule.quantumMigrationRelevance,
              conventionalSecurityRelevance: rule.conventionalSecurityRelevance,
              recommendedRemediation: rule.recommendedRemediation,
              referenceLinks: rule.referenceLinks,
              quantumImpactType: rule.quantumImpactType,
              timestamp: new Date().toISOString(),
            });

            // Prevent infinite loop on empty match
            if (match[0].length === 0) {
              globalRegex.lastIndex++;
            }
          }
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const algorithmInventory = ReadinessAssessor.buildAlgorithmInventory(findings);
    const readinessAssessment = ReadinessAssessor.assessReadiness(findings, algorithmInventory);

    return {
      scannerVersion: SCANNER_VERSION,
      rulesVersion: RULES_VERSION,
      fileCount: files.length,
      supportedFileCount: files.length,
      durationMs,
      findings,
      algorithmInventory,
      readinessAssessment,
    };
  }

  /**
   * Translates a character offset index in a text into 1-indexed line and column numbers.
   */
  public static getLineAndColumn(content: string, index: number): { line: number; column: number } {
    let line = 1;
    let lastNewline = -1;
    const limit = Math.min(index, content.length);

    for (let i = 0; i < limit; i++) {
      if (content[i] === '\n') {
        line++;
        lastNewline = i;
      }
    }

    const column = Math.max(1, index - lastNewline);
    return { line, column };
  }
}
