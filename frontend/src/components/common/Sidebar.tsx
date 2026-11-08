import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  GitCompare,
  CreditCard,
  BookOpen,
  Shield,
  PlusCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatPlanName } from '../../utils/planUtils';

interface Props {
  onNewScanClick?: () => void;
}

export const Sidebar: React.FC<Props> = ({ onNewScanClick }) => {
  const { organization } = useAuth();

  const navItems = [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Projects', to: '/app/projects', icon: FolderGit2 },
    { label: 'Scan Comparison', to: '/app/compare', icon: GitCompare },
    { label: 'Plan & Billing', to: '/app/billing', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col border-r border-navy-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800">
        <Link to="/app" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white tracking-tight">QuantumShield</span>
              <span className="text-[10px] bg-brand-900/60 text-blue-300 font-semibold px-1 rounded border border-blue-700/50">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Valmiki Softwares</p>
          </div>
        </Link>
      </div>

      {/* Organization badge */}
      {organization && (
        <div className="px-5 py-3.5 bg-navy-900/80 border-b border-navy-800/80 flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Organization</p>
            <p className="text-xs font-semibold text-white truncate">{organization.name}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 shrink-0">
            {formatPlanName(organization.plan)}
          </span>
        </div>
      )}

      {/* Primary Action Button */}
      {onNewScanClick && (
        <div className="p-4">
          <button
            onClick={onNewScanClick}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload & Scan Repo</span>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Active Subscription Summary Widget */}
      {organization && (
        <div className="mx-3 mb-2 p-3.5 rounded-xl bg-gradient-to-br from-navy-900 to-navy-950 border border-navy-800 text-xs shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Subscription</span>
            <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              Active
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <p className="font-bold text-white text-xs truncate">
              {formatPlanName(organization.plan)}
            </p>
          </div>
          <div className="space-y-1 mb-2.5 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Monthly Scans:</span>
              <span className="font-semibold text-slate-200">
                {organization.currentScansCount || 0} / {organization.maxScansPerMonth || 75}
              </span>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    ((organization.currentScansCount || 0) / (organization.maxScansPerMonth || 75)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
          <Link
            to="/app/billing"
            className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center justify-between group pt-1 border-t border-navy-800/60"
          >
            <span>Manage Plan & Invoices</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      )}

      {/* Standards Reference Card */}
      <div className="p-4 m-3 rounded-lg bg-navy-900/90 border border-navy-800 text-xs">
        <div className="flex items-center space-x-1.5 text-blue-400 font-semibold mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>NIST Standards</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
          Standardized PQC algorithms: ML-KEM (FIPS 203), ML-DSA (FIPS 204), and SLH-DSA (FIPS 205).
        </p>
        <a
          href="https://csrc.nist.gov/pubs/fips/203/final"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-blue-400 hover:underline flex items-center space-x-1 font-medium"
        >
          <span>Read NIST FIPS 203</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-navy-800 text-[11px] text-slate-500">
        QuantumShield v1.0.0
      </div>
    </aside>
  );
};
