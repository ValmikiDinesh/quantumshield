import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ScanDetailDTO, FindingDTO } from '../../types';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { ReadinessScoreGauge } from '../../components/common/ReadinessScoreGauge';
import { AlgorithmInventoryTable } from '../../components/scanner/AlgorithmInventoryTable';
import { FindingDetailModal } from '../../components/scanner/FindingDetailModal';
import {
  FileText,
  Download,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Code2,
} from 'lucide-react';

export const ScanDetailPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();

  const [scan, setScan] = useState<ScanDetailDTO | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<FindingDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJson, setIsDownloadingJson] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [impactFilter, setImpactFilter] = useState('ALL');
  const [isPlainEnglishMode, setIsPlainEnglishMode] = useState(false);

  const getLaymanFindingSummary = (f: FindingDTO) => {
    if (f.category === 'pqc-implementation' || f.quantumImpactType === 'quantum-resistant' || f.severity === 'Informational') {
      if (f.ruleId === 'PQC-ALG-MLKEM-FIPS203') {
        return 'VERIFIED PQC: NIST FIPS 203 (ML-KEM) lattice key encapsulation. Immune to quantum decryption (HNDL). No code changes required.';
      }
      if (f.ruleId === 'PQC-ALG-MLDSA-FIPS204') {
        return 'VERIFIED PQC: NIST FIPS 204 (ML-DSA) lattice digital signature. Immune to quantum forgery. No code changes required.';
      }
      if (f.ruleId === 'PQC-ALG-SLHDSA-FIPS205') {
        return 'VERIFIED PQC: NIST FIPS 205 (SLH-DSA) stateless hash-based digital signature. Immune to quantum forgery. No code changes required.';
      }
      if (f.ruleId.includes('HYBRID')) {
        return 'VERIFIED PQC: Hybrid post-quantum key exchange combining classical ECDH with NIST ML-KEM. No code changes required.';
      }
      return 'VERIFIED PQC: Quantum-resistant cryptographic primitive or library detected. Zero vulnerability (100/100 compliance).';
    }
    if (f.ruleId === 'CR-ALG-RSA-KEYGEN' || f.ruleId === 'CR-ALG-RSA-ENCRYPT' || f.ruleId === 'PQC-PUB-RSA-KEYGEN') {
      return 'RSA encryption / key exchange detected. Vulnerable to Harvest Now Decrypt Later via Shor’s quantum algorithm.';
    }
    if (f.ruleId === 'CR-ALG-ECDH' || f.ruleId === 'PQC-PUB-ECDH-KEYEX') {
      return 'Elliptic Curve Diffie-Hellman key exchange. Intercepted traffic can be decrypted once quantum supercomputers arrive.';
    }
    if (f.ruleId === 'CR-ALG-ECDSA' || f.ruleId === 'PQC-PUB-ECDSA-SIGN') {
      return 'Elliptic Curve digital signature. Quantum computers will be able to forge valid signatures.';
    }
    if (f.category === 'weak-legacy') {
      return 'Legacy insecure cipher. Vulnerable to everyday attacks, not just quantum computers.';
    }
    return f.quantumMigrationRelevance;
  };

  const loadScan = async () => {
    if (!scanId) return;
    setIsLoading(true);
    try {
      const data = await api.getScan(scanId);
      setScan(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load scan findings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScan();
  }, [scanId]);

  const handleDownloadPdf = async () => {
    if (!scan) return;
    setIsDownloadingPdf(true);
    try {
      await api.downloadReportPDF(
        scan.id,
        `QuantumShield-Report-${scan.projectName || 'Repo'}-${scan.id}.pdf`
      );
    } catch (err: any) {
      alert(err.message || 'Failed to download PDF report');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadJson = async () => {
    if (!scan) return;
    setIsDownloadingJson(true);
    try {
      await api.downloadReportJSON(
        scan.id,
        `quantumshield-report-${scan.id}.json`
      );
    } catch (err: any) {
      alert(err.message || 'Failed to download JSON report');
    } finally {
      setIsDownloadingJson(false);
    }
  };

  const filteredFindings = (scan?.findings || []).filter(f => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.filePath.toLowerCase().includes(search.toLowerCase()) ||
      f.ruleId.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || f.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    const matchesImpact = impactFilter === 'ALL' || f.quantumImpactType === impactFilter;

    return matchesSearch && matchesSeverity && matchesCategory && matchesImpact;
  });

  const vulnerabilitiesCount = (scan?.findings || []).filter(f => f.severity !== 'Informational').length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Scan Findings & PQC Readiness Explorer"
          subtitle={`Archive: ${scan?.uploadedFileName || '...'} • Rules v${scan?.rulesVersion || '2024.1'}`}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">Analyzing cryptographic findings and inventory...</p>
            </div>
          ) : scan ? (
            <>
              {/* Back to Project & Report Action Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Link
                  to={`/app/projects/${scan.projectId}`}
                  className="text-xs font-semibold text-slate-600 hover:text-navy-950 flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {scan.projectName || 'Project'}</span>
                </Link>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Layman Mode Toggle */}
                  <button
                    onClick={() => setIsPlainEnglishMode(!isPlainEnglishMode)}
                    className={`text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow-xs transition-all border ${
                      isPlainEnglishMode
                        ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                    title="Toggle Plain English explanations"
                  >
                    <Code2 className={`w-3.5 h-3.5 ${isPlainEnglishMode ? 'text-amber-300' : 'text-indigo-600'}`} />
                    <span>{isPlainEnglishMode ? 'Plain English: ON' : 'Explain in Plain English'}</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    disabled={isDownloadingJson}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors"
                  >
                    {isDownloadingJson ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>Export JSON</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors"
                  >
                    {isDownloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                    <span>Download Executive PDF</span>
                  </button>
                </div>
              </div>

              {/* Layman's Executive Summary Banner when Plain English is ON */}
              {isPlainEnglishMode && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white shadow-md border border-indigo-700/50">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>Plain English Summary for Non-Security Stakeholders</span>
                        <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-medium">
                          Layman Mode Active
                        </span>
                      </h3>
                      <p className="text-xs text-indigo-100/90 leading-relaxed">
                        {scan.readinessScore < 50
                          ? `Your codebase uses older cryptographic locks (found ${scan.readinessAssessment.shorVulnerableCount} classical algorithms, including RSA or ECC). While these still resist ordinary laptops, quantum computers will break them quickly. Attackers are collecting encrypted traffic now to decrypt later ("Harvest Now, Decrypt Later"). Your engineering team should plan an upgrade to NIST ML-KEM.`
                          : scan.readinessScore < 80
                          ? `Your codebase has moderate quantum readiness. It has ${scan.readinessAssessment.shorVulnerableCount} older algorithms that should be replaced with NIST FIPS 203/204 standards over the next 1–2 release cycles.`
                          : scan.readinessScore === 100
                          ? `Outstanding! Your codebase has achieved 100% Quantum Readiness. Zero vulnerabilities were detected. All ${scan.findings.length} findings represent verified NIST post-quantum standard adoptions (ML-KEM, ML-DSA, SLH-DSA). No code changes are required.`
                          : `Great job! Your codebase shows strong quantum resilience, with ${scan.readinessAssessment.pqcDetectedCount} post-quantum algorithms detected and very little legacy exposure.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* READINESS ASSESSMENT SUMMARY CARD */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Overall Post-Quantum Readiness Score
                    </p>
                    <ReadinessScoreGauge
                      score={scan.readinessScore}
                      riskLevel={scan.riskLevel}
                      size="lg"
                    />
                    <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                      {scan.readinessAssessment.calculationMethod}
                    </p>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-red-50/70 rounded-lg border border-red-200">
                      <p className="text-[10px] uppercase font-bold text-red-800">Shor Vulnerable</p>
                      <p className="text-2xl font-extrabold text-red-700 mt-1">
                        {scan.readinessAssessment.shorVulnerableCount}
                      </p>
                      <p className="text-[11px] text-red-600 mt-0.5">RSA, ECC, ECDSA, DH</p>
                    </div>

                    <div className="p-3 bg-orange-50/70 rounded-lg border border-orange-200">
                      <p className="text-[10px] uppercase font-bold text-orange-800">HNDL Exposure</p>
                      <p className="text-2xl font-extrabold text-orange-700 mt-1">
                        {scan.readinessAssessment.harvestNowDecryptLaterCount}
                      </p>
                      <p className="text-[11px] text-orange-600 mt-0.5">Key agreement & cipher</p>
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                      <p className="text-[10px] uppercase font-bold text-emerald-800">PQC Implemented</p>
                      <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                        {scan.readinessAssessment.pqcDetectedCount}
                      </p>
                      <p className="text-[11px] text-emerald-600 mt-0.5">ML-KEM / ML-DSA</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-700">Broken Ciphers</p>
                      <p className="text-2xl font-extrabold text-slate-800 mt-1">
                        {scan.readinessAssessment.legacyWeakCount}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">DES, 3DES, MD5, SHA1</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 italic">
                  * {scan.readinessAssessment.disclaimer}
                </div>
              </div>

              {/* ALGORITHM INVENTORY TABLE */}
              <AlgorithmInventoryTable inventory={scan.algorithmInventory} />

              {/* FINDINGS EXPLORER TABLE & FILTERS */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                        {vulnerabilitiesCount === 0
                          ? `Verified Cryptographic Standards & Indicators (${filteredFindings.length} Verified PQC Items • 0 Vulnerabilities)`
                          : `Findings Explorer (${filteredFindings.length} of ${scan.findings.length})`}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {vulnerabilitiesCount === 0
                          ? 'All cryptographic primitives in this scan conform to NIST Post-Quantum standards (Zero vulnerabilities found)'
                          : 'Inspect exact file locations, code snippets, and remediation roadmaps'}
                      </p>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search finding, file, or rule..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Severity Filter */}
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="p-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
                    >
                      <option value="ALL">All Severities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Informational">Informational</option>
                    </select>

                    {/* Category Filter */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="p-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="public-key">Public-Key Cryptography</option>
                      <option value="cryptographic-api">Cryptographic APIs</option>
                      <option value="protocol-config">Protocol & Config</option>
                      <option value="pqc-implementation">PQC Implementation</option>
                      <option value="weak-legacy">Weak / Legacy Cipher</option>
                    </select>

                    {/* Quantum Impact Filter */}
                    <select
                      value={impactFilter}
                      onChange={(e) => setImpactFilter(e.target.value)}
                      className="p-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
                    >
                      <option value="ALL">All Quantum Impacts</option>
                      <option value="harvest-now-decrypt-later">Harvest Now Decrypt Later</option>
                      <option value="future-forgeability">Future Forgeability</option>
                      <option value="quantum-resistant">Quantum Resistant</option>
                      <option value="crypto-agility">Crypto Agility</option>
                      <option value="not-quantum-specific">Non-Quantum Legacy</option>
                    </select>
                  </div>
                </div>

                {/* Table Content */}
                {filteredFindings.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500">
                    No findings match the applied filter criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                          <th className="py-3 px-5">{vulnerabilitiesCount === 0 ? 'Status' : 'Severity'}</th>
                          <th className="py-3 px-4">Finding Title</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Quantum Impact</th>
                          <th className="py-3 px-4">Classification</th>
                          <th className="py-3 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFindings.map((finding) => (
                          <tr
                            key={finding.findingId}
                            onClick={() => setSelectedFinding(finding)}
                            className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                          >
                            <td className="py-3.5 px-5">
                              <SeverityBadge severity={finding.severity} size="sm" />
                            </td>
                            <td className="py-3.5 px-4 font-bold text-navy-950">
                              <div>{finding.title}</div>
                              {isPlainEnglishMode && (
                                <p className="text-[11px] font-normal text-indigo-800 mt-1 bg-indigo-50/80 p-1.5 rounded border border-indigo-100 leading-snug">
                                  💡 <strong>Plain English:</strong> {getLaymanFindingSummary(finding)}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                              {finding.filePath}:{finding.line}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                finding.quantumImpactType === 'harvest-now-decrypt-later' ? 'bg-red-50 text-red-700 border border-red-200' :
                                finding.quantumImpactType === 'quantum-resistant' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                finding.quantumImpactType === 'future-forgeability' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {finding.quantumImpactType.replace(/-/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                              {finding.classification}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFinding(finding);
                                }}
                                className="text-brand-600 hover:text-brand-700 font-semibold text-xs hover:underline"
                              >
                                View Details & AI
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </main>
      </div>

      {/* Finding Detail Modal */}
      {selectedFinding && scanId && (
        <FindingDetailModal
          finding={selectedFinding}
          scanId={scanId}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </div>
  );
};
