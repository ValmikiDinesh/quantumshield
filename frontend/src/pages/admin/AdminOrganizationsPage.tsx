import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Eye,
  Sliders,
  ShieldBan,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  X,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminClient';

export const AdminOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Form states for Plan Modal
  const [editPlan, setEditPlan] = useState('none');
  const [editMaxProjects, setEditMaxProjects] = useState(1);
  const [editMaxScans, setEditMaxScans] = useState(0);
  const [editReason, setEditReason] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Form states for Status Modal
  const [statusReason, setStatusReason] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const loadOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.listOrganizations({
        search: search.trim() || undefined,
        plan: planFilter || undefined,
        status: statusFilter || undefined,
      });
      setOrganizations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [planFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrganizations();
  };

  const openPlanModal = (org: any) => {
    setSelectedOrg(org);
    setEditPlan(org.plan);
    setEditMaxProjects(org.maxProjects || 1);
    setEditMaxScans(org.maxScansPerMonth || 0);
    setEditReason('');
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    setIsSavingPlan(true);
    setError(null);
    try {
      await adminApi.updateOrgPlan(selectedOrg._id, {
        plan: editPlan,
        maxProjects: Number(editMaxProjects),
        maxScansPerMonth: Number(editMaxScans),
        reason: editReason,
      });
      setSuccessMsg(`Successfully updated limits for ${selectedOrg.name}.`);
      setIsPlanModalOpen(false);
      await loadOrganizations();
    } catch (err: any) {
      setError(err.message || 'Failed to update plan');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const openStatusModal = (org: any) => {
    setSelectedOrg(org);
    setStatusReason('');
    setIsStatusModalOpen(true);
  };

  const handleToggleStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    setIsSavingStatus(true);
    setError(null);
    const newStatus = selectedOrg.status === 'suspended' ? 'active' : 'suspended';
    try {
      await adminApi.updateOrgStatus(selectedOrg._id, {
        status: newStatus,
        reason: statusReason,
      });
      setSuccessMsg(`Organization ${selectedOrg.name} is now ${newStatus}.`);
      setIsStatusModalOpen(false);
      await loadOrganizations();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleImpersonate = async (orgId: string, orgName: string) => {
    if (!window.confirm(`Inspect ${orgName} workspace as customer? A temporary 30-minute session will be created and logged.`)) return;
    try {
      const res = await adminApi.impersonateTenant(orgId);
      // Store temporary customer token under customer key
      localStorage.setItem('quantumshield_token', res.customerToken);
      window.open('/app', '_blank');
    } catch (err: any) {
      alert(`Impersonation failed: ${err.message}`);
    }
  };

  return (
    <AdminLayout
      title="Tenant & Organization Directory"
      subtitle="Manage workspaces, grant plan overrides, and handle support requests"
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
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by organization name or slug..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2 shrink-0">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Plan Tiers</option>
            <option value="enterprise">Enterprise Shield</option>
            <option value="team">Team Security</option>
            <option value="developer">Developer Pro</option>
            <option value="single_scan">Single Scan</option>
            <option value="none">Unsubscribed (None)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No organizations matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Organization</th>
                  <th className="px-5 py-3.5">Active Plan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Limits (Projects / Scans)</th>
                  <th className="px-5 py-3.5">Members</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {organizations.map((org) => {
                  const isSuspended = org.status === 'suspended';
                  return (
                    <tr key={org._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{org.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{org.slug}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                            org.plan === 'enterprise'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : org.plan === 'team'
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              : org.plan === 'developer'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : org.plan === 'single_scan'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {org.plan === 'none' ? 'Unsubscribed' : org.plan}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-bold uppercase">
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-bold uppercase">
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px]">
                        <div>Projects: {org.projectCount || 0} / {org.maxProjects}</div>
                        <div className="text-slate-400">Scans: {org.scanCount || 0} / {org.maxScansPerMonth} mo</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-200">{org.userCount || 1} users</span>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleImpersonate(org._id, org.name)}
                          title="Inspect as Tenant (Customer Portal)"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openPlanModal(org)}
                          title="Override Plan & Quotas"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openStatusModal(org)}
                          title={isSuspended ? 'Reactivate Organization' : 'Suspend Organization'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSuspended
                              ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400'
                              : 'bg-red-950/80 hover:bg-red-900 text-red-400'
                          }`}
                        >
                          {isSuspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Override Modal */}
      {isPlanModalOpen && selectedOrg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Override Limits: {selectedOrg.name}</span>
              </h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subscription Tier</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="none">Unsubscribed (None)</option>
                  <option value="single_scan">Single Scan (₹299)</option>
                  <option value="developer">Developer Pro (₹3,999/mo)</option>
                  <option value="team">Team Security (₹15,999/mo)</option>
                  <option value="enterprise">Enterprise Shield (₹39,999/mo)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Projects</label>
                  <input
                    type="number"
                    value={editMaxProjects}
                    onChange={(e) => setEditMaxProjects(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Scans / Month</label>
                  <input
                    type="number"
                    value={editMaxScans}
                    onChange={(e) => setEditMaxScans(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Enterprise pilot trial agreement"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {isSavingPlan ? 'Saving...' : 'Apply Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Toggle Modal */}
      {isStatusModalOpen && selectedOrg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                {selectedOrg.status === 'suspended' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldBan className="w-4 h-4 text-red-400" />
                )}
                <span>
                  {selectedOrg.status === 'suspended' ? 'Reactivate' : 'Suspend'} {selectedOrg.name}
                </span>
              </h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleToggleStatus} className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                {selectedOrg.status === 'suspended'
                  ? 'Reactivating this organization will immediately restore code auditing and dashboard access for all its members.'
                  : 'Suspending this organization will immediately block all its members from running scans or modifying projects.'}
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Administrative Justification</label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Chargeback investigation / Terms of service violation"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStatus}
                  className={`px-4 py-2 text-white font-bold rounded-lg disabled:opacity-50 ${
                    selectedOrg.status === 'suspended' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {isSavingStatus ? 'Updating...' : selectedOrg.status === 'suspended' ? 'Reactivate Org' : 'Suspend Org'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
