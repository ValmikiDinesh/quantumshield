import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LaymanGuideModal } from './LaymanGuideModal';
import { formatPlanName } from '../../utils/planUtils';

interface Props {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<Props> = ({ title, subtitle }) => {
  const { user, organization, logout } = useAuth();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="text-lg font-bold text-navy-950 tracking-tight leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Plain English Guide Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 text-xs font-semibold transition-colors shadow-xs"
            title="Learn about quantum security in plain English"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Plain English Guide</span>
            <span className="sm:hidden">Guide</span>
          </button>

          {/* Security badge indicator */}
          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Zero Code Execution Policy</span>
          </div>

          {/* Active Subscription Badge */}
          {organization && (
            <Link
              to="/app/billing"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 hover:bg-emerald-100/80 transition-all text-xs font-semibold shadow-2xs group"
              title="Current Active Subscription — Click to view billing & quotas"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>{formatPlanName(organization.plan)}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded-full leading-none">
                Active
              </span>
            </Link>
          )}

          {/* User profile dropdown & logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{user?.email}</p>
            </div>

            <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>

            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <LaymanGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};
