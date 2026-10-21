import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { DashboardStatsDTO, ProjectDTO } from '../../types';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { ReadinessScoreGauge } from '../../components/common/ReadinessScoreGauge';
import {
  FolderGit2,
  FileScan,
  ShieldAlert,
  ShieldCheck,
  Plus,
  ArrowRight,
  Download,
  AlertTriangle,
  Loader2,
  Activity,
  Layers,
  Clock,
  GitCompare,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, projectsData] = await Promise.all([
        api.getDashboardStats(),
        api.listProjects(),
      ]);
      setStats(statsData);
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format Recharts data for severity distribution
  const severityChartData = stats
    ? [
        { name: 'Critical', count: stats.findingsBySeverity.critical, color: '#DC2626' },
        { name: 'High', count: stats.findingsBySeverity.high, color: '#EA580C' },
        { name: 'Medium', count: stats.findingsBySeverity.medium, color: '#D97706' },
        { name: 'Low', count: stats.findingsBySeverity.low, color: '#2563EB' },
        { name: 'Info', count: stats.findingsBySeverity.info, color: '#64748B' },
      ]
    : [];

  // Algorithm portfolio donut chart data
  const algorithmDonutData = stats
    ? [
        {
          name: 'Shor Vulnerable',
          value: stats.algorithmInventorySummary.asymmetricShorVulnerable,
          color: '#DC2626',
        },
        {
          name: 'PQC / Hybrid Ready',
          value: stats.algorithmInventorySummary.pqcOrHybridDetected,
          color: '#16A34A',
        },
        {
          name: 'Symmetric / Hash',
          value: stats.algorithmInventorySummary.symmetricOrHash,
          color: '#2563EB',
        },
        {
          name: 'Legacy Broken',
          value: stats.algorithmInventorySummary.legacyWeak,
          color: '#F59E0B',
        },
      ].filter((item) => item.value > 0)
    : [];

  const totalInventoryCount = stats
    ? stats.algorithmInventorySummary.asymmetricShorVulnerable +
      stats.algorithmInventorySummary.pqcOrHybridDetected +
      stats.algorithmInventorySummary.symmetricOrHash +
      stats.algorithmInventorySummary.legacyWeak
    : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Security Overview & PQC Posture"
          subtitle="Enterprise cryptographic discovery, vulnerability tracking & NIST migration readiness"
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={loadData} className="font-bold underline">Retry</button>
            </div>
          )}

          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">Loading security posture metrics...</p>
            </div>
          ) : stats ? (
            <>
              {/* TOP SUMMARY STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Projects */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Projects</p>
                    <p className="text-3xl font-extrabold text-navy-950 mt-1">{stats.totalProjects}</p>
                    <Link to="/app/projects" className="text-[11px] text-brand-600 font-semibold hover:underline mt-1 inline-block">
                      Manage Repositories →
                    </Link>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                    <FolderGit2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Total Scans Completed */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scans Executed</p>
                    <p className="text-3xl font-extrabold text-navy-950 mt-1">{stats.totalScans}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Deterministic rules</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <FileScan className="w-6 h-6" />
                  </div>
                </div>

                {/* Average Readiness Score */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Avg PQC Readiness</p>
                    <ReadinessScoreGauge
                      score={stats.averageReadinessScore}
                      riskLevel={
                        stats.averageReadinessScore < 40 ? 'Critical Action Required' :
                        stats.averageReadinessScore < 65 ? 'Migration Planning Needed' :
                        stats.averageReadinessScore < 85 ? 'Early Stage Transition' : 'Post-Quantum Prepared'
                      }
                      size="sm"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                {/* Shor Vulnerable Keys / HNDL threat */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Shor-Vulnerable</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">HNDL Risk</span>
                    </div>
                    <p className="text-3xl font-extrabold text-red-600 mt-1">
                      {stats.algorithmInventorySummary.asymmetricShorVulnerable}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      {stats.algorithmInventorySummary.pqcOrHybridDetected} PQC items adopted
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* SEVERITY BREAKDOWN & ALGORITHM CATEGORIES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Findings by Severity Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand-600" />
                        <span>Active Findings by Severity</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cryptographic findings across scanned repositories
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-700 border border-slate-200">
                      {Object.values(stats.findingsBySeverity).reduce((a, b) => a + b, 0)} Total Findings
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {severityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cryptographic Portfolio Donut Chart & Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-brand-600" />
                      <span>Algorithm Portfolio</span>
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">
                      Distribution by quantum resilience status
                    </p>

                    {/* Donut Chart */}
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={algorithmDonutData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                          >
                            {algorithmDonutData.map((entry, index) => (
                              <Cell key={`donut-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* List summary */}
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-red-900 text-xs">Shor Vulnerable (RSA / ECC)</p>
                          <p className="text-[10px] text-red-700">Immediate HNDL threat</p>
                        </div>
                        <span className="font-extrabold text-red-700 text-sm">
                          {stats.algorithmInventorySummary.asymmetricShorVulnerable}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-emerald-900 text-xs">PQC / Hybrid (FIPS 203/204)</p>
                          <p className="text-[10px] text-emerald-700">ML-KEM / ML-DSA</p>
                        </div>
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {stats.algorithmInventorySummary.pqcOrHybridDetected}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-amber-900 text-xs">Legacy Insecure (MD5 / SHA1)</p>
                          <p className="text-[10px] text-amber-700">Broken classical ciphers</p>
                        </div>
                        <span className="font-extrabold text-amber-700 text-sm">
                          {stats.algorithmInventorySummary.legacyWeak}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                    CNSA 2.0 mandate: Transition key exchanges and signatures by 2030.
                  </div>
                </div>
              </div>

              {/* PROJECTS NEEDING REVIEW QUEUE */}
              {stats.projectsNeedingReview.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-6 py-4 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Action Required: Repositories with Critical Quantum Vulnerabilities
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {stats.projectsNeedingReview.length} Repositories
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {stats.projectsNeedingReview.map((p) => (
                      <div key={p.id} className="p-4 px-6 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                        <div>
                          <Link to={`/app/projects/${p.id}`} className="text-sm font-bold text-navy-950 hover:text-brand-600">
                            {p.name}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.description || 'No description provided'} • <span className="font-semibold uppercase">{p.projectType}</span>
                          </p>
                        </div>

                        <div className="flex items-center space-x-4">
                          {p.latestScan && (
                            <div className="text-right">
                              <span className="text-xs font-bold text-red-600">
                                {p.latestScan.criticalCount} Critical, {p.latestScan.highCount} High
                              </span>
                              <p className="text-[11px] text-slate-400">Readiness: {p.latestScan.readinessScore}/100</p>
                            </div>
                          )}

                          <Link
                            to={`/app/projects/${p.id}`}
                            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-2xs"
                          >
                            <span>Open Project</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECENT SCANS LIST WITH QUICK COMPARE */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileScan className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                      Recent Scan Activity & Audit Trail
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link to="/app/compare" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Compare Scans</span>
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link to="/app/projects" className="text-xs text-slate-500 font-semibold hover:text-navy-950">
                      View All Projects
                    </Link>
                  </div>
                </div>

                {stats.recentScans.length === 0 ? (
                  <div className="p-10 text-center">
                    <FileScan className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No scans executed yet.</p>
                    <Link
                      to="/app/projects"
                      className="mt-3 inline-block bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
                    >
                      Create Project & Scan
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
                          <th className="py-3 px-6">Archive Name</th>
                          <th className="py-3 px-4">Readiness Score</th>
                          <th className="py-3 px-4">Vulnerability Count</th>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.recentScans.map((scan) => (
                          <tr key={scan.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-6 font-semibold text-navy-950">
                              <Link to={`/app/scans/${scan.id}`} className="hover:text-brand-600 flex items-center gap-1.5">
                                <FileScan className="w-3.5 h-3.5 text-slate-400" />
                                <span>{scan.uploadedFileName}</span>
                              </Link>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                scan.readinessScore < 40 ? 'bg-red-50 text-red-700 border-red-200' :
                                scan.readinessScore < 65 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                scan.readinessScore < 85 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {scan.readinessScore} / 100
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              <span className="font-semibold">{scan.findingsCount} findings</span>
                              <span className="text-slate-400 text-[11px] ml-1">
                                ({scan.criticalCount} crit, {scan.highCount} high)
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                              {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-6 text-right space-x-3">
                              <Link
                                to={`/app/scans/${scan.id}`}
                                className="text-xs font-bold text-brand-600 hover:underline"
                              >
                                View Findings
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
