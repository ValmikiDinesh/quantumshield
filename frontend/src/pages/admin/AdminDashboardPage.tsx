import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  Building2,
  Users,
  ScanLine,
  AlertTriangle,
  Server,
  Activity,
  HardDrive,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminClient';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load telemetry data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m`;
  };

  return (
    <AdminLayout
      title="Telemetry & Platform Command Center"
      subtitle="Live multi-tenant metrics, financial accounting, and host telemetry"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/80 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">QuantumShield Live Fleet Telemetry</h3>
            <p className="text-xs text-slate-400">Database connected • Cryptographic scan workers ready</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => adminApi.downloadAccountingCSV()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Financial CSV</span>
          </button>
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-200 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500 font-mono">Aggregating telemetry across all tenants...</p>
        </div>
      ) : stats ? (
        <>
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Gross Revenue (Collected)</span>
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                ₹{Number(stats.grossRevenueINR || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                <span>{stats.totalSettledPayments} settled Razorpay payments</span>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Estimated MRR</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                ₹{Number(stats.monthlyRecurringRevenueINR || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">Monthly recurring subscription run-rate</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Organizations</span>
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{stats.totalOrgs}</div>
              <p className="text-[11px] text-slate-400">Across {stats.totalUsers} registered users</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Scans Run</span>
                <ScanLine className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{stats.totalScans}</div>
              <p className="text-[11px] text-slate-400">
                {stats.scansRunning} running • {stats.scansFailed} failed
              </p>
            </div>
          </div>

          {/* Plan Distribution Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Tenant Subscription Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] font-mono text-purple-400 uppercase font-bold">Enterprise Shield</span>
                <div className="text-2xl font-extrabold text-white mt-1">{stats.planCounts?.enterprise || 0}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">₹39,999 / mo</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] font-mono text-indigo-400 uppercase font-bold">Team Security</span>
                <div className="text-2xl font-extrabold text-white mt-1">{stats.planCounts?.team || 0}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">₹15,999 / mo</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] font-mono text-blue-400 uppercase font-bold">Developer Pro</span>
                <div className="text-2xl font-extrabold text-white mt-1">{stats.planCounts?.developer || 0}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">₹3,999 / mo</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">Single Scan</span>
                <div className="text-2xl font-extrabold text-white mt-1">{stats.planCounts?.single_scan || 0}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">₹299 / pass</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Unsubscribed</span>
                <div className="text-2xl font-extrabold text-white mt-1">{stats.planCounts?.none || 0}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">0 scans remaining</p>
              </div>
            </div>
          </div>

          {/* Host & Server Health Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Host Server Health</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Database Connection</span>
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>MongoDB {stats.telemetry?.databaseState}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Server Uptime</span>
                  <span className="font-mono text-slate-200">
                    {formatUptime(stats.telemetry?.uptimeSeconds || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Node Engine</span>
                  <span className="font-mono text-slate-200">{stats.telemetry?.nodeVersion}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Memory Utilization (RSS / Heap)</span>
                  <span className="font-mono text-indigo-300">
                    {stats.telemetry?.memoryRssMB} MB RSS • {stats.telemetry?.memoryHeapUsedMB} MB Heap
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  <span>Administrative Actions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage active tenants, adjust enterprise quotas, inspect scans, or pause the engine.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/admin/organizations"
                  className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Manage Organizations
                </Link>
                <Link
                  to="/admin/payments"
                  className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Reconcile Payments
                </Link>
                <Link
                  to="/admin/scans"
                  className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Global Scan Explorer
                </Link>
                <Link
                  to="/admin/system"
                  className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Platform Controls
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </AdminLayout>
  );
};
