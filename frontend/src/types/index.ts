export type UserRole = 'owner' | 'admin' | 'member';

export type PlanTier = 'free' | 'developer' | 'team' | 'enterprise';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName?: string;
  createdAt: string;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  maxProjects: number;
  maxScansPerMonth: number;
  currentScansCount: number;
  currentProjectsCount: number;
  createdAt: string;
}

export type ProjectType = 'web' | 'api' | 'mobile' | 'library' | 'infrastructure' | 'other';

export interface ProjectDTO {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;
  organizationId: string;
  createdBy: string;
  scanCount: number;
  latestScan?: ScanSummaryDTO | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type FindingCategory =
  | 'public-key'
  | 'cryptographic-api'
  | 'protocol-config'
  | 'pqc-implementation'
  | 'weak-legacy';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type ClassificationType =
  | 'Confirmed pattern match'
  | 'Potential cryptographic usage'
  | 'Informational observation'
  | 'Needs manual verification';

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface FindingDTO {
  findingId: string;
  ruleId: string;
  ruleVersion: string;
  title: string;
  description: string;
  category: FindingCategory;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  classification: ClassificationType;
  filePath: string;
  line: number;
  column: number;
  evidence: string;
  detectionMethod: 'regex-engine' | 'ast-scanner' | 'manifest-inspector' | 'config-analyzer';
  quantumMigrationRelevance: string;
  conventionalSecurityRelevance: string;
  recommendedRemediation: string;
  referenceLinks: ReferenceLink[];
  quantumImpactType: 'harvest-now-decrypt-later' | 'future-forgeability' | 'crypto-agility' | 'quantum-resistant' | 'not-quantum-specific';
  timestamp: string;
}

export interface AlgorithmInventoryItem {
  algorithm: string;
  category: 'asymmetric' | 'symmetric' | 'hash' | 'post-quantum' | 'hybrid' | 'legacy-weak';
  quantumStatus: 'vulnerable-shor' | 'safe-grover-impact' | 'quantum-resistant' | 'legacy-insecure';
  locationsCount: number;
  sampleLocations: string[];
  recommendedReplacement?: string;
}

export interface ReadinessAssessment {
  readinessScore: number;
  riskLevel: 'Critical Action Required' | 'Migration Planning Needed' | 'Early Stage Transition' | 'Post-Quantum Prepared';
  shorVulnerableCount: number;
  harvestNowDecryptLaterCount: number;
  authenticationVulnerableCount: number;
  pqcDetectedCount: number;
  legacyWeakCount: number;
  totalFindingsCount: number;
  calculationMethod: string;
  disclaimer: string;
}

export type ScanStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ScanSummaryDTO {
  id: string;
  projectId: string;
  projectName?: string;
  status: ScanStatus;
  uploadedFileName: string;
  fileCount: number;
  supportedFileCount: number;
  durationMs: number;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  readinessScore: number;
  riskLevel: ReadinessAssessment['riskLevel'];
  createdAt: string;
}

export interface ScanDetailDTO extends ScanSummaryDTO {
  findings: FindingDTO[];
  algorithmInventory: AlgorithmInventoryItem[];
  readinessAssessment: ReadinessAssessment;
  rulesVersion: string;
  scannerVersion: string;
  errorMessage?: string;
}

export interface ScanComparisonDTO {
  scanA: ScanSummaryDTO;
  scanB: ScanSummaryDTO;
  newFindings: FindingDTO[];
  resolvedFindings: FindingDTO[];
  unchangedFindings: FindingDTO[];
  scoreDelta: number;
}

export interface DashboardStatsDTO {
  totalProjects: number;
  totalScans: number;
  findingsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  algorithmInventorySummary: {
    asymmetricShorVulnerable: number;
    pqcOrHybridDetected: number;
    symmetricOrHash: number;
    legacyWeak: number;
  };
  recentScans: ScanSummaryDTO[];
  projectsNeedingReview: ProjectDTO[];
  averageReadinessScore: number;
}

export interface AIExplanationResponse {
  findingId: string;
  plainEnglishSummary: string;
  quantumThreatExplanation: string;
  stepByStepMigrationGuide: string[];
  caveatsAndReviewChecklist: string[];
  isAiGenerated: true;
  provider: 'gemini' | 'rule-based-expert';
}
