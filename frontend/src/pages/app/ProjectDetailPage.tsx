import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ProjectDTO, ScanSummaryDTO, ScanDetailDTO } from '../../types';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { ZipUploadZone } from '../../components/scanner/ZipUploadZone';
import {
  FolderGit2,
  FileScan,
  ArrowRight,
  GitCompare,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [scans, setScans] = useState<ScanSummaryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [projectData, scansData] = await Promise.all([
        api.getProject(id),
        api.listProjectScans(id),
      ]);
      setProject(projectData);
      setScans(scansData);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleScanCompleted = (scan: ScanDetailDTO) => {
    // Navigate straight to the scan findings explorer for immediate feedback
    navigate(`/app/scans/${scan.id}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={project?.name || 'Project Details'}
          subtitle={`Repository scan history & PQC readiness assessments`}
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
              <p className="text-xs font-semibold text-slate-600">Loading project data...</p>
            </div>
          ) : project ? (
            <>
              {/* Project Metadata Banner */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-brand-700 border border-blue-200">
                      {project.projectType}
                    </span>
                    <span className="text-xs text-slate-400">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-navy-950">{project.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Scans Run</p>
                    <p className="text-xl font-extrabold text-navy-950">{project.scanCount}</p>
                  </div>
                  {project.latestScan && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Current Score</p>
                      <p className={`text-xl font-extrabold ${
                        project.latestScan.readinessScore < 40 ? 'text-red-600' :
                        project.latestScan.readinessScore < 65 ? 'text-orange-600' :
                        project.latestScan.readinessScore < 85 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {project.latestScan.readinessScore}/100
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Zone */}
              <ZipUploadZone
                projectId={project.id}
                projectName={project.name}
                onScanCompleted={handleScanCompleted}
              />

              {/* Historical Scans Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                    Scan History ({scans.length})
                  </h3>
                  {scans.length >= 2 && (
                    <Link
                      to={`/app/compare?scanAId=${scans[1].id}&scanBId=${scans[0].id}`}
                      className="text-xs text-brand-600 font-semibold hover:underline flex items-center space-x-1"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Compare Last 2 Scans</span>
                    </Link>
                  )}
                </div>

                {scans.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    No scans have been performed yet. Use the upload box or quick demo buttons above to run your first scan.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
                          <th className="py-3 px-6">Archive Name</th>
                          <th className="py-3 px-4">Readiness Score</th>
                          <th className="py-3 px-4">Files Analyzed</th>
                          <th className="py-3 px-4">Findings</th>
                          <th className="py-3 px-4">Duration</th>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {scans.map((scan) => (
                          <tr key={scan.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-6 font-semibold text-slate-800">
                              <Link to={`/app/scans/${scan.id}`} className="hover:text-brand-600">
                                {scan.uploadedFileName}
                              </Link>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                                scan.readinessScore < 40 ? 'bg-red-100 text-red-700' :
                                scan.readinessScore < 65 ? 'bg-orange-100 text-orange-700' :
                                scan.readinessScore < 85 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {scan.readinessScore} / 100
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {scan.supportedFileCount} source files
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-800">{scan.findingsCount}</span>
                              <span className="text-slate-400 ml-1">({scan.criticalCount} crit, {scan.highCount} high)</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {(scan.durationMs / 1000).toFixed(2)}s
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <Link
                                to={`/app/scans/${scan.id}`}
                                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs inline-flex items-center space-x-1"
                              >
                                <span>Explorer</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
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
    </div>
  );
};
