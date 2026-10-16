import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { PlanTier } from '../../types';
import {
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

export const OrganizationBillingPage: React.FC = () => {
  const { organization, refreshProfile } = useAuth();
  const [orgData, setOrgData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrg = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCurrentOrganization();
      setOrgData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load organization settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrg();
  }, []);

  const handleUpdatePlan = async (tier: PlanTier) => {
    if (orgData?.plan === tier) return;
    setIsUpdating(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.updatePlan(tier);
      setMessage(`Plan successfully simulated: upgraded to ${tier.toUpperCase()} tier.`);
      await refreshProfile();
      await loadOrg();
    } catch (err: any) {
      setError(err.message || 'Plan update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Organization & Subscription Management"
          subtitle="Manage active tier limits, project quotas, and simulated billing"
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">Loading subscription details...</p>
            </div>
          ) : orgData ? (
            <>
              {/* Organization Overview Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold text-lg">
                      <Building className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-navy-950">{orgData.name}</h2>
                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {orgData.plan} Tier
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Organization Slug: <span className="font-mono">{orgData.slug}</span> • Member since {new Date(orgData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quota Usage Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-700">
                      <span>Project Quota Utilization</span>
                      <span>{orgData.currentProjectsCount} / {orgData.maxProjects} projects</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (orgData.currentProjectsCount / orgData.maxProjects) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-700">
                      <span>Monthly Scan Limit</span>
                      <span>{orgData.currentScansCount} / {orgData.maxScansPerMonth} scans this month</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (orgData.currentScansCount / orgData.maxScansPerMonth) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice Regarding MVP Billing */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start space-x-3">
                <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">MVP Simulated Billing Architecture: </span>
                  Plan selections below instantly update project quotas and scan rates in MongoDB without charging credit cards.
                  Real production payments will connect to a verified provider (Stripe/Paddle) with webhook validation.
                </div>
              </div>

              {/* Subscription Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {(orgData.pricingPlans || []).map((plan: any) => {
                  const isCurrent = orgData.plan === plan.tier;
                  return (
                    <div
                      key={plan.tier}
                      className={`bg-white rounded-xl p-6 flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-2 border-brand-600 shadow-md ring-2 ring-brand-100'
                          : 'border border-slate-200 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-bold text-navy-950">{plan.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-600 text-white">
                              Active Plan
                            </span>
                          )}
                        </div>

                        <div className="my-3">
                          <span className="text-3xl font-extrabold text-navy-950">${plan.priceMonthly}</span>
                          <span className="text-xs text-slate-500"> / month</span>
                        </div>

                        <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                          {plan.features.map((f: string, idx: number) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        {isCurrent ? (
                          <div className="w-full text-center py-2 px-3 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                            Current Plan
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdatePlan(plan.tier)}
                            disabled={isUpdating}
                            className="w-full py-2 px-3 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Switch to {plan.tier.toUpperCase()}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};
