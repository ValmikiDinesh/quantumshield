import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { ProjectDTO, ScanSummaryDTO, ScanComparisonDTO, FindingDTO } from '../../types';
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
      setError('Please select both Base Scan (A) and Target Scan (B).');
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
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Scans to Compare
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.scanCount} scans)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Baseline Scan A (Older)</label>
                <select
                  value={scanAId}
                  onChange={(e) => setScanAId(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Scan B (Newer)</label>
                <select
                  value={scanBId}
                  onChange={(e) => setScanBId(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
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

            <div className="flex justify-end">
              <button
                onClick={runComparison}
                disabled={isLoading || !scanAId || !scanBId || scanAId === scanBId}
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
                <span>Run Comparison Diff</span>
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
              {/* Score Delta Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center items-center">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Baseline Scan A</p>
                    <p className="text-2xl font-extrabold text-navy-950 mt-1">{comparison.scanA.readinessScore} / 100</p>
                    <p className="text-xs text-slate-500 mt-0.5">{comparison.scanA.riskLevel}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(comparison.scanA.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm ${
                      comparison.scoreDelta > 0 ? 'bg-emerald-100 text-emerald-700' :
                      comparison.scoreDelta < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {comparison.scoreDelta > 0 ? (
                        <TrendingUp className="w-6 h-6" />
                      ) : comparison.scoreDelta < 0 ? (
                        <TrendingDown className="w-6 h-6" />
                      ) : (
                        <Minus className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-base font-extrabold ${
                      comparison.scoreDelta > 0 ? 'text-emerald-600' :
                      comparison.scoreDelta < 0 ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} Readiness Points
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {comparison.scoreDelta > 0 ? 'Security posture improved' :
                       comparison.scoreDelta < 0 ? 'Regression: newly added cryptographic risks' : 'No net score change'}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Target Scan B</p>
                    <p className="text-2xl font-extrabold text-navy-950 mt-1">{comparison.scanB.readinessScore} / 100</p>
                    <p className="text-xs text-slate-500 mt-0.5">{comparison.scanB.riskLevel}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(comparison.scanB.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Three Diff Buckets: New Findings, Resolved Findings, Unchanged */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NEW FINDINGS */}
                <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 bg-red-50/80 border-b border-red-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-red-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">
                        New Findings Introduced ({comparison.newFindings.length})
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {comparison.newFindings.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">
                        No new findings introduced in this scan.
                      </p>
                    ) : (
                      comparison.newFindings.map((f) => (
                        <div
                          key={f.findingId}
                          onClick={() => setSelectedFinding(f)}
                          className="py-3 cursor-pointer hover:bg-slate-50"
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

                {/* RESOLVED FINDINGS */}
                <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 bg-emerald-50/80 border-b border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Resolved Findings Fixed ({comparison.resolvedFindings.length})
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {comparison.resolvedFindings.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">
                        No findings resolved compared to baseline.
                      </p>
                    ) : (
                      comparison.resolvedFindings.map((f) => (
                        <div
                          key={f.findingId}
                          onClick={() => setSelectedFinding(f)}
                          className="py-3 cursor-pointer hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <SeverityBadge severity={f.severity} size="sm" />
                            <span className="text-[11px] font-mono text-slate-400">{f.filePath}:{f.line}</span>
                          </div>
                          <p className="text-xs font-bold text-navy-950 line-through text-slate-400">{f.title}</p>
                          <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Successfully remediated or removed</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
