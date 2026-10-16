import mongoose, { Schema, Document } from 'mongoose';
import {
  ScanStatus,
  FindingDTO,
  AlgorithmInventoryItem,
  ReadinessAssessment,
} from '../types';

export interface IScan extends Document {
  projectId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  status: ScanStatus;
  uploadedFileName: string;
  fileCount: number;
  supportedFileCount: number;
  durationMs: number;
  readinessScore: number;
  riskLevel: ReadinessAssessment['riskLevel'];
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  findings: FindingDTO[];
  algorithmInventory: AlgorithmInventoryItem[];
  readinessAssessment: ReadinessAssessment;
  rulesVersion: string;
  scannerVersion: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FindingSubSchema = new Schema(
  {
    findingId: { type: String, required: true },
    ruleId: { type: String, required: true },
    ruleVersion: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    severity: { type: String, required: true },
    confidence: { type: String, required: true },
    classification: { type: String, required: true },
    filePath: { type: String, required: true },
    line: { type: Number, required: true },
    column: { type: Number, required: true },
    evidence: { type: String, required: true },
    detectionMethod: { type: String, required: true },
    quantumMigrationRelevance: { type: String, required: true },
    conventionalSecurityRelevance: { type: String, required: true },
    recommendedRemediation: { type: String, required: true },
    referenceLinks: [
      {
        title: { type: String },
        url: { type: String },
      },
    ],
    quantumImpactType: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  { _id: false }
);

const AlgorithmInventorySubSchema = new Schema(
  {
    algorithm: { type: String, required: true },
    category: { type: String, required: true },
    quantumStatus: { type: String, required: true },
    locationsCount: { type: Number, required: true },
    sampleLocations: [{ type: String }],
    recommendedReplacement: { type: String },
  },
  { _id: false }
);

const ReadinessAssessmentSubSchema = new Schema(
  {
    readinessScore: { type: Number, required: true },
    riskLevel: { type: String, required: true },
    shorVulnerableCount: { type: Number, required: true },
    harvestNowDecryptLaterCount: { type: Number, required: true },
    authenticationVulnerableCount: { type: Number, required: true },
    pqcDetectedCount: { type: Number, required: true },
    legacyWeakCount: { type: Number, required: true },
    totalFindingsCount: { type: Number, required: true },
    calculationMethod: { type: String, required: true },
    disclaimer: { type: String, required: true },
  },
  { _id: false }
);

const ScanSchema: Schema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    uploadedFileName: { type: String, required: true },
    fileCount: { type: Number, default: 0 },
    supportedFileCount: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    readinessScore: { type: Number, default: 100 },
    riskLevel: { type: String, default: 'Post-Quantum Prepared' },
    findingsCount: { type: Number, default: 0 },
    criticalCount: { type: Number, default: 0 },
    highCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    lowCount: { type: Number, default: 0 },
    infoCount: { type: Number, default: 0 },
    findings: [FindingSubSchema],
    algorithmInventory: [AlgorithmInventorySubSchema],
    readinessAssessment: ReadinessAssessmentSubSchema,
    rulesVersion: { type: String, required: true },
    scannerVersion: { type: String, required: true },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

ScanSchema.index({ projectId: 1, createdAt: -1 });

export const Scan = mongoose.model<IScan>('Scan', ScanSchema);
