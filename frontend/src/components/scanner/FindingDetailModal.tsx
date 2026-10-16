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
  const [copied, setCopied] = useState(false);

  const fetchAiExplanation = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const data = await api.explainFindingAI(scanId, finding.findingId);
      setAiExplanation(data);
    } catch (err: any) {
      setAiError(err.message || 'Failed to fetch AI explanation');
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyEvidence = () => {
    navigator.clipboard.writeText(finding.evidence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const laymanInfo = (() => {
    if (finding.ruleId === 'PQC-PUB-RSA-KEYGEN') {
      return {
        analogy: 'Using an older mathematical padlock (invented in 1977).',
        danger: 'A quantum computer running Shor\'s formula will factor the prime numbers and open this in seconds.',
        fix: 'Switch to NIST FIPS 203 (ML-KEM) lattice-based encryption or a hybrid.',
      };
    }
    if (finding.ruleId === 'PQC-PUB-ECDH-KEYEX') {
      return {
        analogy: 'Exchanging secret session keys using elliptic curves.',
        danger: 'Attackers can record your encrypted traffic today ("Harvest Now, Decrypt Later") and decrypt it when quantum computers are ready.',
        fix: 'Upgrade to an ML-KEM-768 hybrid key encapsulation mechanism.',
      };
    }
    if (finding.ruleId === 'PQC-PUB-ECDSA-SIGN') {
      return {
        analogy: 'Signing documents with a digital seal that can be forged by a quantum computer.',
        danger: 'Quantum hardware can forge authentication tokens, SSL certificates, or software updates.',
        fix: 'Migrate to NIST FIPS 204 (ML-DSA) or FIPS 205 (SLH-DSA).',
      };
    }
    if (finding.category === 'pqc-implementation') {
      return {
        analogy: 'Brand new post-quantum mathematical vault lock.',
        danger: 'No known quantum threat. Based on multi-dimensional lattice grids that resist quantum computing.',
        fix: 'Keep library dependencies up to date with NIST FIPS 203/204 releases.',
      };
    }
    if (finding.category === 'weak-legacy') {
      return {
        analogy: 'An obsolete, broken lock from the 1980s/1990s.',
        danger: 'Broken today even on ordinary laptops without needing a quantum computer.',
        fix: 'Immediately replace with SHA-256 or AES-256-GCM.',
      };
    }
    return {
      analogy: 'Cryptographic dependency or configuration usage.',
      danger: finding.quantumMigrationRelevance,
      fix: finding.recommendedRemediation,
    };
  })();

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <SeverityBadge severity={finding.severity} size="sm" />
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                {finding.classification}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {finding.ruleId} (v{finding.ruleVersion})
              </span>
            </div>
            <h2 className="text-base font-bold text-navy-950 leading-tight">
              {finding.title}
            </h2>
            <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500 font-mono">
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>{finding.filePath}:{finding.line}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Layman Quick Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Plain English Translation (What this means for you)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                <span className="font-semibold text-slate-700 block mb-0.5">Simple Analogy</span>
                <span className="text-slate-600">{laymanInfo.analogy}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                <span className="font-semibold text-slate-700 block mb-0.5">The Danger</span>
                <span className="text-slate-600">{laymanInfo.danger}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                <span className="font-semibold text-slate-700 block mb-0.5">The Solution</span>
                <span className="text-slate-600">{laymanInfo.fix}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description & Summary
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed">
              {finding.description}
            </p>
          </div>

          {/* Evidence Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Redacted Code Evidence
              </h4>
              <button
                onClick={copyEvidence}
                className="text-slate-400 hover:text-slate-600 flex items-center space-x-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-navy-950 text-slate-200 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-navy-800 shadow-inner">
              <pre className="whitespace-pre">{finding.evidence}</pre>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 italic">
              * Secrets, auth tokens, and private key bodies are automatically redacted prior to display.
            </p>
          </div>

          {/* Quantum Migration Relevance */}
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Post-Quantum Cryptography Relevance</span>
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {finding.quantumMigrationRelevance}
            </p>
          </div>

          {/* Conventional Security Relevance */}
          <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200">
            <h4 className="text-xs font-bold text-blue-900 flex items-center space-x-1.5 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Conventional Classical Security Posture</span>
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              {finding.conventionalSecurityRelevance}
            </p>
          </div>

          {/* Recommended Action */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Recommended Remediation & Standards Action
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed">
              {finding.recommendedRemediation}
            </div>
          </div>

          {/* Reference Links */}
          {finding.referenceLinks && finding.referenceLinks.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Standards References & Specifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {finding.referenceLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors border border-slate-200"
                  >
                    <span>{link.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation Section */}
          <div className="pt-4 border-t border-slate-200">
            {!aiExplanation && !isAiLoading && (
              <button
                onClick={fetchAiExplanation}
                className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 shadow-sm font-semibold text-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explain in Simple Terms with AI Assistant</span>
              </button>
            )}

            {isAiLoading && (
              <div className="p-6 rounded-lg bg-indigo-50/50 border border-indigo-100 text-center">
                <Loader2 className="w-5 h-5 text-brand-600 animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Synthesizing cryptographic explanation and migration steps...
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Analyzing lattice parameters & NIST FIPS recommendations
                </p>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs">
                {aiError}
              </div>
            )}

            {aiExplanation && (
              <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                  <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Cryptography Assistant Analysis</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                    Provider: {aiExplanation.provider.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1">Plain English Summary</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {aiExplanation.plainEnglishSummary}
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1">Quantum Threat Breakdown</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {aiExplanation.quantumThreatExplanation}
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1.5">Step-by-Step Migration Guide</h5>
                  <ul className="space-y-1.5">
                    {aiExplanation.stepByStepMigrationGuide.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {aiExplanation.caveatsAndReviewChecklist && aiExplanation.caveatsAndReviewChecklist.length > 0 && (
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs mb-1.5">Engineering Review Checklist</h5>
                    <ul className="space-y-1">
                      {aiExplanation.caveatsAndReviewChecklist.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-[11px] text-slate-600">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 italic">
                  * Generated guidance is designed to assist engineering reviews. Always verify interoperability and performance constraints before deploying cryptographic library changes.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
