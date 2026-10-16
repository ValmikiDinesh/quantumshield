import {
  FindingCategory,
  SeverityLevel,
  ConfidenceLevel,
  ClassificationType,
  ReferenceLink,
} from '../../types';

export interface ScanRule {
  id: string;
  version: string;
  title: string;
  category: FindingCategory;
  defaultSeverity: SeverityLevel;
  defaultConfidence: ConfidenceLevel;
  classification: ClassificationType;
  quantumImpactType:
    | 'harvest-now-decrypt-later'
    | 'future-forgeability'
    | 'crypto-agility'
    | 'quantum-resistant'
    | 'not-quantum-specific';
  algorithmName?: string;
  algorithmCategory?: 'asymmetric' | 'symmetric' | 'hash' | 'post-quantum' | 'hybrid' | 'legacy-weak';
  quantumStatus?: 'vulnerable-shor' | 'safe-grover-impact' | 'quantum-resistant' | 'legacy-insecure';
  description: string;
  quantumMigrationRelevance: string;
  conventionalSecurityRelevance: string;
  recommendedRemediation: string;
  referenceLinks: ReferenceLink[];
  fileExtensions?: string[]; // e.g. ['.js', '.ts', '.py', '.java', '.go', '.rs', '.php']
  filePatterns?: RegExp[]; // e.g. [/package\.json$/, /pom\.xml$/]
  patterns: {
    regex: RegExp;
    confidence?: ConfidenceLevel;
    severity?: SeverityLevel;
    customNote?: string;
  }[];
  negativePatterns?: RegExp[]; // Patterns that suppress false positives
}
