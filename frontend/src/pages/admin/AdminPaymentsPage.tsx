import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Search,
  Download,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  X,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminClient';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // Manual Credit Modal
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [creditPlan, setCreditPlan] = useState('developer');
  const [creditAmountINR, setCreditAmountINR] = useState(3999);
  const [creditNotes, setCreditNotes] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isCrediting, setIsCrediting] = useState(false);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [payData, orgData] = await Promise.all([
        adminApi.listPayments({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          plan: planFilter || undefined,
        }),
        adminApi.listOrganizations(),
      ]);
      setPayments(payData);
      setOrganizations(orgData);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter, planFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPayments();
  };

  const handleManualCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !creditAmountINR) return;

    setIsCrediting(true);
    setError(null);
    try {
      await adminApi.manualCreditPayment({
        organizationId: selectedOrgId,
        plan: creditPlan,
        amountINR: Number(creditAmountINR),
        referenceNotes: creditNotes,
        customerEmail,
      });
      setSuccessMsg(`Successfully credited ${creditPlan} to organization.`);
      setIsCreditModalOpen(false);
      await loadPayments();
    } catch (err: any) {
      setError(err.message || 'Manual credit failed');
    } finally {
      setIsCrediting(false);
    }
  };

  return (
    <AdminLayout
      title="Financial Telemetry & Razorpay Reconciliation"
      subtitle="Track live transactions, issue manual bank transfer credits, and export tax reports"
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

      {/* Action and Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer email, order ID, or payment ID..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="paid">Settled (Paid)</option>
            <option value="created">Created (Pending)</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={() => adminApi.downloadAccountingCSV()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (organizations.length > 0) setSelectedOrgId(organizations[0]._id);
              setIsCreditModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-md shadow-emerald-900/40"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manual Bank Credit</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading transactions...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 text-center">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Invoice / Receipt</th>
                  <th className="px-5 py-3.5">Organization</th>
                  <th className="px-5 py-3.5">Customer Email</th>
                  <th className="px-5 py-3.5">Tier</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Razorpay Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.map((p) => {
                  const isPaid = p.status === 'paid';
                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-white text-[11px]">
                        {p.receipt}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-200">
                          {p.organizationId?.name || 'Manual / Deleted'}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                        {p.customerEmail}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {p.plan}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-bold text-white">
                        ₹{(p.amountINR || p.amount / 100).toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-bold uppercase">
                            <span>PAID</span>
                          </span>
                        ) : p.status === 'created' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-[10px] font-bold uppercase">
                            <span>PENDING</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-bold uppercase">
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 font-mono text-[10px] text-slate-500">
                        <div>{p.razorpayOrderId}</div>
                        {p.razorpayPaymentId && <div className="text-indigo-400">{p.razorpayPaymentId}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Credit Modal */}
      {isCreditModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Record Manual Bank Transfer / Wire Credit</span>
              </h3>
              <button onClick={() => setIsCreditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualCredit} className="space-y-4 text-xs">
              <p className="text-slate-400">
                Record an offline wire, NEFT, or corporate PO payment. This creates a verified paid transaction and automatically activates the customer's subscription.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Organization</label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.slug}) - Currently: {org.plan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plan Tier</label>
                  <select
                    value={creditPlan}
                    onChange={(e) => {
                      const p = e.target.value;
                      setCreditPlan(p);
                      if (p === 'single_scan') setCreditAmountINR(299);
                      if (p === 'developer') setCreditAmountINR(3999);
                      if (p === 'team') setCreditAmountINR(15999);
                      if (p === 'enterprise') setCreditAmountINR(39999);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="single_scan">Single Scan (₹299)</option>
                    <option value="developer">Developer Pro (₹3,999)</option>
                    <option value="team">Team Security (₹15,999)</option>
                    <option value="enterprise">Enterprise Shield (₹39,999)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    value={creditAmountINR}
                    onChange={(e) => setCreditAmountINR(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer / Invoicing Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="accounts@customer.com"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bank Reference / UTR Number</label>
                <input
                  type="text"
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  placeholder="e.g. HDFC NEFT UTR N123456789 / PO-2026-09"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreditModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCrediting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {isCrediting ? 'Recording...' : 'Record Payment & Upgrade Org'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
