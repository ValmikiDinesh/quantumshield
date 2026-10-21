import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ProjectDTO, ScanSummaryDTO, ScanComparisonDTO, FindingDTO, SeverityLevel } from '../../types';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { FindingDetailModal } from '../../components/scanner/FindingDetailModal';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Minus,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ScanComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialScanA = searchParams.get('scanAId') || '';
  const initialScanB = searchParams.get('scanBId') || '';

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectScans, setProjectScans] = useState<ScanSummaryDTO[]>([]);
  const [scanAId, setScanAId] = useState(initialScanA);
  const [scanBId, setScanBId] = useState(initialScanB);
  const [comparison, setComparison] = useState<ScanComparisonDTO | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<FindingDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active diff tab and filters
  const [activeDiffTab, setActiveDiffTab] = useState<'all' | 'new' | 'resolved' | 'unchanged'>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Load projects on mount
  useEffect(() => {
    const init = async () => {
      try {
        const projs = await api.listProjects();
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    init();
  }, []);

  // When selected project changes, load its scans
  useEffect(() => {
    if (!selectedProjectId) return;
    const loadScans = async () => {
      try {
        const scans = await api.listProjectScans(selectedProjectId);
        setProjectScans(scans);
        if (scans.length >= 2) {
          if (!scanAId) setScanAId(scans[1].id);
          if (!scanBId) setScanBId(scans[0].id);
        } else if (scans.length === 1) {
          if (!scanAId) setScanAId(scans[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadScans();
  }, [selectedProjectId]);

  // Execute comparison
  const runComparison = async () => {
    if (!scanAId || !scanBId) {
      setError('Please select both Baseline Scan (A) and Target Scan (B).');
      return;
    }
    if (scanAId === scanBId) {
      setError('Please choose two different scans to compare.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await api.compareScans(scanAId, scanBId);
      setComparison(data);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scanAId && scanBId && scanAId !== scanBId) {
      runComparison();
    }
  }, [scanAId, scanBId]);

  // Filter helper
  const filterList = (list: FindingDTO[]) => {
    return list.filter((f) => {
      const matchesSeverity = severityFilter === 'ALL' || f.severity === severityFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.filePath.toLowerCase().includes(q) ||
        f.ruleId.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q);
      return matchesSeverity && matchesSearch;
    });
  };

  const filteredNew = useMemo(() => (comparison ? filterList(comparison.newFindings) : []), [comparison, severityFilter, searchQuery]);
  const filteredResolved = useMemo(() => (comparison ? filterList(comparison.resolvedFindings) : []), [comparison, severityFilter, searchQuery]);
  const filteredUnchanged = useMemo(() => (comparison ? filterList(comparison.unchangedFindings) : []), [comparison, severityFilter, searchQuery]);

  const copyDiffSummary = () => {
    if (!comparison) return;
    const summaryMarkdown = `### QuantumShield Cryptographic Scan Diff
- **Baseline Scan (A)**: ${comparison.scanA.uploadedFileName} (Score: ${comparison.scanA.readinessScore}/100)
- **Target Scan (B)**: ${comparison.scanB.uploadedFileName} (Score: ${comparison.scanB.readinessScore}/100)
- **Readiness Delta**: ${comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} points
- **New Findings Introduced**: ${comparison.newFindings.length}
- **Resolved Findings Fixed**: ${comparison.resolvedFindings.length}
- **Unchanged Findings**: ${comparison.unchangedFindings.length}`;

    navigator.clipboard.writeText(summaryMarkdown);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Scan Comparison & Cryptographic Diff"
          subtitle="Audit progress, identify newly introduced vulnerabilities, and verify resolved issues"
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <GitCompare className="w-4 h-4 text-brand-600" />
                <span>Select Baseline & Target Scans</span>
              </h3>
              {projectScans.length < 2 && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Tip: Upload at least 2 scans for this repository to run comparisons.
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white shadow-2xs focus:border-brand-500 focus:outline-hidden"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.scanCount} scans)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Baseline Scan A (Older Baseline)</label>
                <select
                  value={scanAId}
                  onChange={(e) => setScanAId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white shadow-2xs focus:border-brand-500 focus:outline-hidden"
                >
                  <option value="">Select Baseline Scan</option>
                  {projectScans.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.createdAt).toLocaleDateString()} — Score: {s.readinessScore} ({s.uploadedFileName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Scan B (Newer Audit)</label>
                <select
                  value={scanBId}
                  onChange={(e) => setScanBId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white shadow-2xs focus:border-brand-500 focus:outline-hidden"
                >
                  <option value="">Select Target Scan</option>
                  {projectScans.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.createdAt).toLocaleDateString()} — Score: {s.readinessScore} ({s.uploadedFileName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <span className="text-[11px] text-slate-400">
                Comparisons run 100% deterministic cryptographic rule diffing.
              </span>

              <button
                onClick={runComparison}
                disabled={isLoading || !scanAId || !scanBId || scanAId === scanBId}
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-5 py-2 rounded-xl flex items-center space-x-1.5 shadow-2xs disabled:opacity-50 transition-all"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
                <span>Compute Comparison Diff</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Comparison Output */}
          {comparison && (
            <div className="space-y-6">
              {/* Score Delta Progression Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-600" />
                    <span>Cryptographic Posture Migration Progress</span>
                  </h4>

                  <button
                    onClick={copyDiffSummary}
                    className="text-slate-500 hover:text-brand-600 flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSummary ? 'Copied Summary' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center items-center">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Baseline Scan (A)</p>
                    <p className="text-2xl font-extrabold text-navy-950 mt-1">{comparison.scanA.readinessScore} / 100</p>
                    <p className="text-xs text-slate-500 mt-0.5">{comparison.scanA.riskLevel}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      {new Date(comparison.scanA.createdAt).toLocaleDateString()} • {comparison.scanA.findingsCount} findings
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-xs ${
                      comparison.scoreDelta > 0 ? 'bg-emerald-100 text-emerald-700' :
                      comparison.scoreDelta < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {comparison.scoreDelta > 0 ? (
                        <TrendingUp className="w-7 h-7" />
                      ) : comparison.scoreDelta < 0 ? (
                        <TrendingDown className="w-7 h-7" />
                      ) : (
                        <Minus className="w-7 h-7" />
                      )}
                    </div>
                    <span className={`text-lg font-extrabold ${
                      comparison.scoreDelta > 0 ? 'text-emerald-600' :
                      comparison.scoreDelta < 0 ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} Readiness Points
                    </span>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs text-center font-medium">
                      {comparison.scoreDelta > 0 ? 'Post-quantum resilience improved' :
                       comparison.scoreDelta < 0 ? 'Security regression: newly introduced cryptographic exposures' : 'No net score change between scans'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Target Scan (B)</p>
                    <p className="text-2xl font-extrabold text-navy-950 mt-1">{comparison.scanB.readinessScore} / 100</p>
                    <p className="text-xs text-slate-500 mt-0.5">{comparison.scanB.riskLevel}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      {new Date(comparison.scanB.createdAt).toLocaleDateString()} • {comparison.scanB.findingsCount} findings
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                {/* Diff Category Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setActiveDiffTab('all')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      activeDiffTab === 'all'
                        ? 'bg-navy-950 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Changes ({comparison.newFindings.length + comparison.resolvedFindings.length + comparison.unchangedFindings.length})
                  </button>
                  <button
                    onClick={() => setActiveDiffTab('new')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      activeDiffTab === 'new'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Risks ({comparison.newFindings.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveDiffTab('resolved')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      activeDiffTab === 'resolved'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Remediated ({comparison.resolvedFindings.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveDiffTab('unchanged')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      activeDiffTab === 'unchanged'
                        ? 'bg-slate-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Persistent Unchanged ({comparison.unchangedFindings.length})</span>
                  </button>
                </div>

                {/* Search & Severity Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter findings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden w-44"
                    />
                  </div>

                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                    className="p-1.5 px-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Informational">Informational</option>
                  </select>
                </div>
              </div>

              {/* Diff Columns / Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NEW FINDINGS PANEL */}
                {(activeDiffTab === 'all' || activeDiffTab === 'new') && (
                  <div className="bg-white rounded-2xl border border-red-200 shadow-2xs overflow-hidden">
                    <div className="px-5 py-3.5 bg-red-50/80 border-b border-red-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Plus className="w-4 h-4 text-red-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">
                          New Cryptographic Risks Introduced ({filteredNew.length})
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {filteredNew.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center">
                          No new risks introduced matching criteria.
                        </p>
                      ) : (
                        filteredNew.map((f) => (
                          <div
                            key={f.findingId}
                            onClick={() => setSelectedFinding(f)}
                            className="py-3 px-2 rounded-xl cursor-pointer hover:bg-slate-50/80 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <SeverityBadge severity={f.severity} size="sm" />
                              <span className="text-[11px] font-mono text-slate-400">{f.filePath}:{f.line}</span>
                            </div>
                            <p className="text-xs font-bold text-navy-950">{f.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{f.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* RESOLVED FINDINGS PANEL */}
                {(activeDiffTab === 'all' || activeDiffTab === 'resolved') && (
                  <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xs overflow-hidden">
                    <div className="px-5 py-3.5 bg-emerald-50/80 border-b border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          Resolved Cryptographic Issues ({filteredResolved.length})
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {filteredResolved.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center">
                          No resolved findings matching criteria.
                        </p>
                      ) : (
                        filteredResolved.map((f) => (
                          <div
                            key={f.findingId}
                            onClick={() => setSelectedFinding(f)}
                            className="py-3 px-2 rounded-xl cursor-pointer hover:bg-slate-50/80 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <SeverityBadge severity={f.severity} size="sm" />
                              <span className="text-[11px] font-mono text-slate-400">{f.filePath}:{f.line}</span>
                            </div>
                            <p className="text-xs font-bold text-navy-950 line-through text-slate-400">{f.title}</p>
                            <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
                              Remediated: Cryptographic asset upgraded or removed
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* UNCHANGED FINDINGS PANEL */}
                {(activeDiffTab === 'all' || activeDiffTab === 'unchanged') && (
                  <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden ${
                    activeDiffTab === 'all' ? 'lg:col-span-2' : ''
                  }`}>
                    <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Persistent Unchanged Findings ({filteredUnchanged.length})
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Present in both Scan A and Scan B</span>
                    </div>

                    <div className="p-4 divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {filteredUnchanged.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center">
                          No persistent unchanged findings matching criteria.
                        </p>
                      ) : (
                        filteredUnchanged.map((f) => (
                          <div
                            key={f.findingId}
                            onClick={() => setSelectedFinding(f)}
                            className="py-3 px-2 rounded-xl cursor-pointer hover:bg-slate-50/80 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <SeverityBadge severity={f.severity} size="sm" />
                              <span className="text-[11px] font-mono text-slate-400">{f.filePath}:{f.line}</span>
                            </div>
                            <p className="text-xs font-bold text-navy-950">{f.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{f.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Finding Detail Modal if clicked */}
          {selectedFinding && scanBId && (
            <FindingDetailModal
              finding={selectedFinding}
              scanId={scanBId}
              onClose={() => setSelectedFinding(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};
