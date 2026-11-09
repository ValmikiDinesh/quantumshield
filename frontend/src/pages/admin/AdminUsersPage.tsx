import React, { useEffect, useState } from 'react';
import { Users, Search, KeyRound, Trash2, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminClient';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Password Reset Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.listUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const openResetModal = (user: any) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || newPassword.length < 8) return;
    setIsSavingPassword(true);
    setError(null);
    try {
      await adminApi.resetUserPassword(selectedUser._id, newPassword);
      setSuccessMsg(`Password successfully reset for ${selectedUser.email}.`);
      setIsResetModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(`Delete user ${user.email}? This action is irreversible.`)) return;
    try {
      await adminApi.deleteUser(user._id);
      setSuccessMsg(`User ${user.email} successfully deleted.`);
      await loadUsers();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <AdminLayout
      title="Global User Directory"
      subtitle="Cross-tenant account management, security resets, and membership audit"
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
              placeholder="Search by customer email or full name..."
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

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No users found matching query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Assigned Organization</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-200">
                        {u.organizationId?.name || 'Unassigned'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Plan: {u.organizationId?.plan || 'none'}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => openResetModal(u)}
                        title="Set Temporary Password"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        title="Delete User"
                        className="p-1.5 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {isResetModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>Reset Password: {selectedUser.email}</span>
              </h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-slate-400">
                Enter a new temporary password for this user. They will be able to log in immediately with these credentials.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password (min 8 chars)</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="TemporaryPass@2026"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword || newPassword.length < 8}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {isSavingPassword ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
