import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  ScanLine,
  Sliders,
  ScrollText,
  LogOut,
  ShieldAlert,
  Sparkles,
  Trash2,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminApi } from '../../api/adminClient';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Telemetry & Overview', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Tenants & Organizations', path: '/admin/organizations', icon: Building2 },
  { name: 'Global User Directory', path: '/admin/users', icon: Users },
  { name: 'Financials & Razorpay', path: '/admin/payments', icon: CreditCard },
  { name: 'Global Scan Observer', path: '/admin/scans', icon: ScanLine },
  { name: 'System Ops & Controls', path: '/admin/system', icon: Sliders },
  { name: 'Audit Trail', path: '/admin/audit-logs', icon: ScrollText },
];

export const AdminLayout: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({
  children,
  title,
  subtitle,
}) => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const handleQuickPurge = async () => {
    if (!window.confirm('Purge all leftover temporary scan worktrees and extracted archives older than 24h?')) return;
    setIsPurging(true);
    try {
      const res = await adminApi.purgeTempStorage();
      alert(`Storage Purge Completed: Cleared ${res.purgedCount} items, reclaimed ${res.reclaimedMB} MB of disk space.`);
    } catch (err: any) {
      alert(`Purge failed: ${err.message}`);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Banner Alert / Security Context */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/40 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-indigo-300">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white tracking-wider">QUANTUMSHIELD OPERATOR CONSOLE</span>
          <span className="hidden sm:inline text-slate-400">• Internal Control Plane (Valmiki Softwares)</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/app"
            target="_blank"
            className="text-slate-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors"
          >
            <span>Customer Portal</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-semibold">{admin?.email}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 hidden md:flex flex-col justify-between shrink-0">
          <div>
            {/* Header Brand */}
            <div className="p-5 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-white flex items-center space-x-1.5">
                    <span>QuantumShield</span>
                    <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                      ADMIN
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-400 font-medium">Root Operator Console</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800/80 space-y-3">
            <button
              onClick={handleQuickPurge}
              disabled={isPurging}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isPurging ? 'Purging Temp...' : 'Clean Temp Storage'}</span>
            </button>

            <div className="flex items-center justify-between pt-1">
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{admin?.name}</p>
                <span className="inline-block text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/60">
                  {admin?.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign out of Admin"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header Bar */}
          <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Host: Online</span>
              </div>
            </div>
          </header>

          {/* Mobile Drawer */}
          {isMobileOpen && (
            <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                      isActive ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/20 rounded-lg mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Body Content */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
