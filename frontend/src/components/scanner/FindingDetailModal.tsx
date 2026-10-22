import React, { useState } from 'react';
import { FindingDTO, AIExplanationResponse } from '../../types';
import { SeverityBadge } from '../common/SeverityBadge';
import {
  X,
  FileCode,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Clock,
  KeyRound,
  Lock,
  Layers,
  FileText,
  BookmarkCheck,
} from 'lucide-react';
import { api } from '../../api/client';

interface Props {
  finding: FindingDTO;
  scanId: string;
  onClose: () => void;
}

export const FindingDetailModal: React.FC<Props> = ({ finding, scanId, onClose }) => {
  const [aiExplanation, setAiExplanation] = useState<AIExplanationResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedEvidence, setCopiedEvidence] = useState(false);
  const [copiedRemediation, setCopiedRemediation] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'ai-guidance'>('overview');

  const fetchAiExplanation = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const data = await api.explainFindingAI(scanId, finding.findingId);
      setAiExplanation(data);
      setActiveTab('ai-guidance');
    } catch (err: any) {
      setAiError(err.message || 'Failed to fetch AI explanation');
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyEvidence = () => {
    navigator.clipboard.writeText(finding.evidence);
    setCopiedEvidence(true);
    setTimeout(() => setCopiedEvidence(false), 2000);
  };

  const copyRemediation = () => {
    const textToCopy = aiExplanation
      ? `${aiExplanation.plainEnglishSummary}\n\nMigration Steps:\n${aiExplanation.stepByStepMigrationGuide.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
      : finding.recommendedRemediation;
    navigator.clipboard.writeText(textToCopy);
    setCopiedRemediation(true);
    setTimeout(() => setCopiedRemediation(false), 2000);
  };

  const isPositivePqc = finding.severity === 'Informational' || finding.quantumImpactType === 'quantum-resistant' || finding.category === 'pqc-implementation';

  // Plain-English layman threat guide
  const laymanInfo = (() => {
    if (isPositivePqc) {
      return {
        urgency: 'Positive PQC Adoption (Zero Vulnerability)',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
        analogy: 'A state-of-the-art lattice grid vault lock that is mathematically resistant to both classical and quantum supercomputers.',
        danger: 'Verified Quantum-Safe: No known vulnerability. Earns positive compliance credit toward 100/100 score.',
        standardTarget: 'NIST FIPS 203 / 204 / 205 Standard Verified',
        fix: 'Positive adoption verified. No code changes required. Maintain dependency currency with NIST errata updates.',
      };
    }
    if (finding.quantumImpactType === 'harvest-now-decrypt-later' || finding.ruleId.includes('ECDH') || finding.ruleId.includes('RSA-KEYGEN') || finding.ruleId.includes('KEYEX')) {
      return {
        urgency: 'Immediate Confidentiality Exposure',
        badgeColor: 'bg-red-50 text-red-700 border-red-200',
        icon: <Clock className="w-3.5 h-3.5 text-red-600" />,
        analogy: 'Sending secret sealed letters using an envelope whose lock can be recorded today and opened in seconds once quantum computers exist.',
        danger: 'Harvest Now, Decrypt Later (HNDL): Threat actors intercept and store this encrypted data today, waiting for cryptanalytically relevant quantum computers (CRQCs) to factor the keys.',
        standardTarget: 'NIST FIPS 203 (ML-KEM)',
        fix: 'Transition to a hybrid key encapsulation mechanism combining classical ECDH with NIST FIPS 203 (ML-KEM-768).',
      };
    }
    if (finding.quantumImpactType === 'future-forgeability' || finding.ruleId.includes('ECDSA') || finding.ruleId.includes('SIGN')) {
      return {
        urgency: 'Future Authentication & Integrity Forgery',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <KeyRound className="w-3.5 h-3.5 text-amber-600" />,
        analogy: 'Stamping contracts with a digital seal whose private key can be mathematically forged by Shor’s quantum algorithm.',
        danger: 'Future Forgeability: Quantum computers can deduce the private signing key from the public key, enabling attackers to forge JWTs, certificates, and firmware signatures.',
        standardTarget: 'NIST FIPS 204 (ML-DSA) / FIPS 205 (SLH-DSA)',
        fix: 'Migrate digital signatures to NIST FIPS 204 (ML-DSA) or stateless hash-based signatures (FIPS 205 SLH-DSA).',
      };
    }
    if (finding.category === 'weak-legacy') {
      return {
        urgency: 'Legacy Insecure (Non-Quantum)',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />,
        analogy: 'An obsolete broken lock from the 1990s that can be cracked on an ordinary desktop computer.',
        danger: 'Broken today via classical collision attacks or small key brute force. Insecure right now without needing any quantum computer.',
        standardTarget: 'Modern Classical Standard (AES-256 / SHA-256)',
        fix: 'Immediately replace with SHA-256/SHA-3 or AES-256-GCM authenticated encryption.',
      };
    }
    return {
      urgency: 'Cryptographic Configuration Observation',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Layers className="w-3.5 h-3.5 text-blue-600" />,
      analogy: 'Cryptographic dependency or configuration detected in code.',
      danger: finding.quantumMigrationRelevance || 'Review for quantum agility compliance.',
      standardTarget: 'NIST PQC Migration Roadmap',
      fix: finding.recommendedRemediation,
    };
  })();

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={finding.severity} size="sm" />
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${laymanInfo.badgeColor}`}>
                {laymanInfo.icon}
                <span>{laymanInfo.urgency}</span>
              </span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                {finding.classification}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-navy-950 leading-snug pt-0.5">
              {finding.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1.5 text-slate-600">
                <FileCode className="w-3.5 h-3.5 text-brand-600" />
                <span>{finding.filePath}:{finding.line}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">Rule: {finding.ruleId} (v{finding.ruleVersion})</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 capitalize">{finding.detectionMethod.replace('-', ' ')}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors ml-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex space-x-6 text-xs font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Overview & Threat Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'evidence'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Redacted Code Evidence</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-guidance')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'ai-guidance'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Migration Assistant</span>
            {aiExplanation && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Plain English Translation Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-indigo-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Executive Summary & Plain English Breakdown</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Target: {laymanInfo.standardTarget}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
                  <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                    <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1 text-xs">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" />
                      Everyday Analogy
                    </span>
                    <span className="text-slate-600 leading-relaxed">{laymanInfo.analogy}</span>
                  </div>
                  <div className={`p-3 bg-white rounded-lg shadow-2xs ${isPositivePqc ? 'border border-emerald-200' : 'border border-red-100'}`}>
                    <span className={`font-bold block mb-1 flex items-center gap-1 text-xs ${isPositivePqc ? 'text-emerald-900' : 'text-red-900'}`}>
                      {isPositivePqc ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
                      {isPositivePqc ? 'Security Status' : 'The Exact Threat'}
                    </span>
                    <span className="text-slate-600 leading-relaxed">{laymanInfo.danger}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {isPositivePqc ? 'Best Practice & Maintenance' : 'NIST Recommended Fix'}
                    </span>
                    <span className="text-slate-600 leading-relaxed">{laymanInfo.fix}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Detailed Finding Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {finding.description}
                </p>
              </div>

              {/* Quantum Migration Relevance */}
              <div className={`p-4 rounded-xl shadow-2xs ${
                isPositivePqc
                  ? 'bg-emerald-50/80 border border-emerald-200/90'
                  : 'bg-amber-50/80 border border-amber-200/90'
              }`}>
                <h4 className={`text-xs font-bold flex items-center space-x-1.5 mb-1.5 ${
                  isPositivePqc ? 'text-emerald-950' : 'text-amber-950'
                }`}>
                  {isPositivePqc ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    {isPositivePqc
                      ? 'NIST Quantum-Resistant Standard Compliance'
                      : 'Post-Quantum Cryptography (PQC) Exposure Context'}
                  </span>
                </h4>
                <p className={`text-xs leading-relaxed ${isPositivePqc ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {finding.quantumMigrationRelevance}
                </p>
              </div>

              {/* Conventional Security Relevance */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/90 shadow-2xs">
                <h4 className="text-xs font-bold text-blue-950 flex items-center space-x-1.5 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Classical Pre-Quantum Security Status</span>
                </h4>
                <p className="text-xs text-blue-900 leading-relaxed">
                  {finding.conventionalSecurityRelevance}
                </p>
              </div>

              {/* Recommended Action */}
              <div className={`p-4 rounded-xl bg-white border shadow-2xs space-y-2 ${
                isPositivePqc ? 'border-emerald-200' : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-[11px] font-bold uppercase tracking-wider ${
                    isPositivePqc ? 'text-emerald-800' : 'text-slate-500'
                  }`}>
                    {isPositivePqc
                      ? 'Positive Adoption Verified • Best Practice & Operational Guidance'
                      : 'Recommended Remediation Plan'}
                  </h4>
                  <button
                    onClick={copyRemediation}
                    className="text-slate-500 hover:text-brand-600 flex items-center space-x-1 text-[11px] font-semibold"
                  >
                    {copiedRemediation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRemediation ? 'Copied' : (isPositivePqc ? 'Copy Guidance' : 'Copy Remediation')}</span>
                  </button>
                </div>
                <div className={`p-3 rounded-lg border leading-relaxed text-xs font-mono ${
                  isPositivePqc
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {finding.recommendedRemediation}
                </div>
              </div>

              {/* Reference Links */}
              {finding.referenceLinks && finding.referenceLinks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    NIST Specifications & Standards References
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {finding.referenceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 text-slate-700 rounded-lg text-xs font-medium transition-all border border-slate-200"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5 text-brand-600" />
                        <span>{link.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Extracted Code Snippet
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    File: <span className="font-mono font-medium text-navy-950">{finding.filePath}</span> at line <span className="font-mono font-semibold">{finding.line}</span>
                  </p>
                </div>
                <button
                  onClick={copyEvidence}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center space-x-1 text-xs font-medium transition-colors"
                >
                  {copiedEvidence ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEvidence ? 'Copied' : 'Copy Snippet'}</span>
                </button>
              </div>

              <div className="bg-navy-950 text-slate-200 rounded-xl overflow-hidden border border-navy-800 shadow-md">
                <div className="px-4 py-2 bg-navy-900 border-b border-navy-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Line {finding.line}</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Secrets Redacted
                  </span>
                </div>
                <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                  <pre className="whitespace-pre">{finding.evidence}</pre>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Code Storage Guarantee:</strong> Private keys, JWT payloads, passwords, and sensitive tokens are automatically masked (<code className="text-amber-700 bg-amber-50 px-1 rounded">[REDACTED_SECRET]</code>) prior to rendering or reporting.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'ai-guidance' && (
            <div className="space-y-4">
              {!aiExplanation && !isAiLoading && (
                <div className="p-8 text-center bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl border border-indigo-100 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-xs">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-bold text-navy-950">
                    {isPositivePqc ? 'Cryptographic Standard Verification & Best Practices' : 'Contextual Post-Quantum Migration Guidance'}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    {isPositivePqc
                      ? 'Review the verified NIST FIPS standard parameters, algorithm robustness guarantees, and maintenance recommendations.'
                      : 'Request an instant cryptographic review with step-by-step remediation commands, library swap recommendations, and architectural checklists.'}
                  </p>
                  <button
                    onClick={fetchAiExplanation}
                    className="mt-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center space-x-2 shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isPositivePqc ? 'View Verification Details' : 'Generate Migration Guidance'}</span>
                  </button>
                </div>
              )}

              {isAiLoading && (
                <div className="p-10 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-center space-y-2">
                  <Loader2 className="w-7 h-7 text-brand-600 animate-spin mx-auto mb-3" />
                  <p className="text-xs font-bold text-navy-950">
                    {isPositivePqc ? 'Synthesizing Cryptographic Verification Details...' : 'Synthesizing Cryptographic Migration Steps...'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Evaluating NIST FIPS 203/204 parameters, lattice key sizes, and library replacements
                  </p>
                </div>
              )}

              {aiError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
                  <span>{aiError}</span>
                  <button onClick={fetchAiExplanation} className="font-bold underline text-xs">
                    Retry
                  </button>
                </div>
              )}

              {aiExplanation && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                      <div className="flex items-center space-x-2 text-indigo-950 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>{isPositivePqc ? 'AI Cryptographic Verification Analysis' : 'AI Migration Assistant Analysis'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                          ENGINE: {aiExplanation.provider.toUpperCase()}
                        </span>
                        <button
                          onClick={copyRemediation}
                          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                        >
                          {copiedRemediation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedRemediation ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wide">
                        Plain English Summary
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {aiExplanation.plainEnglishSummary}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wide">
                        {isPositivePqc ? 'Quantum Resilience Assessment' : 'Quantum Threat Breakdown'}
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {aiExplanation.quantumThreatExplanation}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wide">
                        {isPositivePqc ? 'Verification & Best Practice Guide' : 'Step-by-Step Migration Guide'}
                      </h5>
                      <div className="space-y-2">
                        {aiExplanation.stepByStepMigrationGuide.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-2.5 p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 font-bold text-[11px] flex items-center justify-center shrink-0 border border-brand-200">
                              {idx + 1}
                            </span>
                            <span className="pt-0.5 leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {aiExplanation.caveatsAndReviewChecklist && aiExplanation.caveatsAndReviewChecklist.length > 0 && (
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs mb-1.5 uppercase tracking-wide">
                          Engineering Review Checklist
                        </h5>
                        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                          {aiExplanation.caveatsAndReviewChecklist.map((item, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 italic">
                      * Guidance conforms to NIST FIPS 203, FIPS 204, and CNSA 2.0 timeline constraints. Always perform interoperability testing in staging before production migration.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            QuantumShield™ by <span className="font-semibold text-navy-950">Valmiki Softwares</span>
          </div>

          <div className="flex items-center space-x-3">
            {activeTab !== 'ai-guidance' && !aiExplanation && (
              <button
                onClick={fetchAiExplanation}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ask AI Assistant</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
