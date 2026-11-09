import React, { useEffect, useState } from 'react';
import { ScrollText, Search, Filter, Loader2, AlertCircle, Eye, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminClient';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');

  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.listAuditLogs({
        action: actionFilter || undefined,
        limit: 100,
      });
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <AdminLayout
      title="Administrative Audit Trail"
      subtitle="Immutable, tamper-evident log of all operator overrides and administrative actions"
    >
      {error && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="ADMIN_LOGIN">ADMIN_LOGIN</option>
            <option value="ORG_PLAN_OVERRIDE">ORG_PLAN_OVERRIDE</option>
            <option value="ORG_SUSPEND">ORG_SUSPEND</option>
            <option value="ORG_ACTIVATE">ORG_ACTIVATE</option>
            <option value="USER_PASSWORD_RESET">USER_PASSWORD_RESET</option>
            <option value="USER_DELETE">USER_DELETE</option>
            <option value="MANUAL_PAYMENT_CREDIT">MANUAL_PAYMENT_CREDIT</option>
            <option value="IMPERSONATE_ORG">IMPERSONATE_ORG</option>
            <option value="PURGE_TEMP_STORAGE">PURGE_TEMP_STORAGE</option>
            <option value="PLATFORM_SETTING_UPDATE">PLATFORM_SETTING_UPDATE</option>
          </select>
        </div>

        <button
          onClick={loadLogs}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
        >
          Refresh Log Feed
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-mono">Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <ScrollText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Operator</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target Type</th>
                  <th className="px-5 py-3.5">Target ID</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors font-mono text-[11px]">
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 font-semibold text-white">
                      {log.adminEmail}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded font-bold uppercase bg-slate-800 text-indigo-300 border border-indigo-900/60">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {log.targetType}
                    </td>

                    <td className="px-5 py-4 text-slate-400 truncate max-w-xs">
                      {log.targetId || '—'}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {log.ipAddress || 'unknown'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          title="View JSON Payload"
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ScrollText className="w-4 h-4 text-indigo-400" />
                <span>Audit Details: {selectedLog.action}</span>
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 text-indigo-200 overflow-x-auto max-h-80">
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
