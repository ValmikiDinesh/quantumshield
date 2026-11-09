import React, { useEffect, useState } from 'react';
import {
  ScanLine,
  Search,
  Filter,
  Eye,
  StopCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Clock,
  X,
  FileCode,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminClient';

export const AdminScansPage: React.FC = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('');

  // Scan Detail Modal
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const loadScans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.listScans({
        status: statusFilter || undefined,
        limit: 50,
      });
      setScans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load scans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, [statusFilter]);

  const openScanDetail = async (scanId: string) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const data = await adminApi.getScan(scanId);
      setSelectedScan(data);
    } catch (err: any) {
      alert(`Failed to load scan details: ${err.message}`);
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleAbortScan = async (scanId: string) => {
    if (!window.confirm('Abort this running scan?')) return;
    try {
      await adminApi.abortScan(scanId);
      setSuccessMsg('Scan aborted successfully.');
      await loadScans();
    } catch (err: any) {
      alert(`Abort failed: ${err.message}`);
    }
  };

  return (
    <AdminLayout
      title="Global Scan Observer & Queue Monitor"
      subtitle="Monitor running scans, debug failed audit stack traces, and manage execution workloads"
    >
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Scans</option>
            <option value="analyzing">Analyzing (Running)</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <button
          onClick={loadScans}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
        >
          Refresh Feed
        </button>
      </div>

      {/* Scans Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading scan feed...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="py-20 text-center">
            <ScanLine className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No scans matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Scan ID</th>
                  <th className="px-5 py-3.5">Organization</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Findings</th>
                  <th className="px-5 py-3.5">PQC Score</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scans.map((s) => {
                  const isRunning = ['queued', 'cloning', 'extracting', 'analyzing'].includes(s.status);
                  const isCompleted = s.status === 'completed';
                  return (
                    <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-white text-[11px]">
                        {String(s._id).slice(-8).toUpperCase()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-200">
                          {s.organizationId?.name || 'Deleted Org'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {s.organizationId?.slug}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-200">{s.projectId?.name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {s.projectId?.projectType || 'repo'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isRunning ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-[10px] font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                            <span>{s.status}</span>
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-bold uppercase">
                            <span>COMPLETED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-bold uppercase">
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono">
                        {s.findings?.length || 0} findings
                      </td>

                      <td className="px-5 py-4 font-mono">
                        {typeof s.readinessScore === 'number' ? (
                          <span
                            className={`font-bold ${
                              s.readinessScore >= 80
                                ? 'text-emerald-400'
                                : s.readinessScore >= 50
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}
                          >
                            {s.readinessScore}/100
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openScanDetail(s._id)}
                          title="Inspect Findings & Diagnostics"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isRunning && (
                          <button
                            onClick={() => handleAbortScan(s._id)}
                            title="Abort Runaway Scan"
                            className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 rounded-lg transition-colors"
                          >
                            <StopCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scan Detail Inspector Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ScanLine className="w-4 h-4 text-indigo-400" />
                <span>Scan Diagnostics: {selectedScan?._id}</span>
              </h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading scan report and algorithm inventory...</p>
              </div>
            ) : selectedScan ? (
              <div className="flex-1 overflow-y-auto space-y-4 text-xs">
                {selectedScan.errorMessage && (
                  <div className="p-4 bg-red-950/60 border border-red-800 text-red-200 rounded-xl space-y-1">
                    <span className="font-bold text-xs flex items-center space-x-1.5 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Failure Diagnostic Stack / Error:</span>
                    </span>
                    <pre className="font-mono text-[11px] whitespace-pre-wrap bg-black/40 p-2.5 rounded-lg border border-red-900/40 text-red-300">
                      {selectedScan.errorMessage}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Status:</span>
                    <span className="text-white font-bold uppercase">{selectedScan.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PQC Score:</span>
                    <span className="text-white font-bold">{selectedScan.readinessScore || 0}/100</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Files Scanned:</span>
                    <span className="text-white font-bold">{selectedScan.totalFilesScanned || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration:</span>
                    <span className="text-white font-bold">
                      {selectedScan.durationMs ? `${(selectedScan.durationMs / 1000).toFixed(1)}s` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2">Cryptographic Findings ({selectedScan.findings?.length || 0})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(selectedScan.findings || []).map((f: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">{f.title || f.ruleId}</span>
                          <span
                            className={`px-2 py-0.2 rounded font-mono text-[9px] uppercase font-bold ${
                              f.severity === 'critical'
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : f.severity === 'high'
                                ? 'bg-orange-950 text-orange-300 border border-orange-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {f.filePath}:{f.lineNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
