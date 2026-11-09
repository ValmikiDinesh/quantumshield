import React, { useEffect, useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  Radio,
  Trash2,
  CheckCircle2,
  Loader2,
  HardDrive,
  Megaphone,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminClient';

export const AdminSystemPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Maintenance form
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  // Scan queue pause form
  const [scanPauseEnabled, setScanPauseEnabled] = useState(false);
  const [scanPauseReason, setScanPauseReason] = useState('');
  const [isSavingScanPause, setIsSavingScanPause] = useState(false);

  // Announcement form
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementSeverity, setAnnouncementSeverity] = useState<'info' | 'warning' | 'alert'>('info');
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

  // Storage Purge state
  const [isPurgingStorage, setIsPurgingStorage] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSettings();
      setSettings(data);
      if (data.maintenanceMode) {
        setMaintenanceEnabled(data.maintenanceMode.enabled || false);
        setMaintenanceMsg(data.maintenanceMode.message || 'System maintenance in progress.');
      }
      if (data.scanQueuePaused) {
        setScanPauseEnabled(data.scanQueuePaused.enabled || false);
        setScanPauseReason(data.scanQueuePaused.reason || 'Scanning engine paused for maintenance.');
      }
      if (data.broadcastAnnouncement) {
        setAnnouncementEnabled(data.broadcastAnnouncement.enabled || false);
        setAnnouncementTitle(data.broadcastAnnouncement.title || '');
        setAnnouncementMsg(data.broadcastAnnouncement.message || '');
        setAnnouncementSeverity(data.broadcastAnnouncement.severity || 'info');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load system settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMaintenance(true);
    setError(null);
    try {
      await adminApi.updateSetting('maintenanceMode', {
        enabled: maintenanceEnabled,
        message: maintenanceMsg,
      });
      setSuccessMsg(`Maintenance mode ${maintenanceEnabled ? 'ENABLED' : 'DISABLED'}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update maintenance mode');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  const handleSaveScanPause = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingScanPause(true);
    setError(null);
    try {
      await adminApi.updateSetting('scanQueuePaused', {
        enabled: scanPauseEnabled,
        reason: scanPauseReason,
      });
      setSuccessMsg(`Scan queue ${scanPauseEnabled ? 'PAUSED' : 'RESUMED'}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update scan pause state');
    } finally {
      setIsSavingScanPause(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnnouncement(true);
    setError(null);
    try {
      await adminApi.updateSetting('broadcastAnnouncement', {
        enabled: announcementEnabled,
        title: announcementTitle,
        message: announcementMsg,
        severity: announcementSeverity,
      });
      setSuccessMsg(`Announcement banner ${announcementEnabled ? 'PUBLISHED' : 'CLEARED'}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update announcement');
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const handlePurgeStorage = async () => {
    if (!window.confirm('Purge all temporary scan worktrees and extracted archives older than 24h?')) return;
    setIsPurgingStorage(true);
    try {
      const res = await adminApi.purgeTempStorage();
      setSuccessMsg(`Storage Purge Completed: Cleared ${res.purgedCount} items, reclaimed ${res.reclaimedMB} MB.`);
    } catch (err: any) {
      setError(err.message || 'Storage purge failed');
    } finally {
      setIsPurgingStorage(false);
    }
  };

  return (
    <AdminLayout
      title="Platform Operations & System Switches"
      subtitle="Emergency maintenance toggles, broadcast announcements, and server disk hygiene"
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
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-mono">Loading platform switches...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Scan Pause */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Global Scan Engine Pause</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  scanPauseEnabled
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {scanPauseEnabled ? 'PAUSED' : 'ONLINE'}
              </span>
            </div>

            <form onSubmit={handleSaveScanPause} className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                When paused, new repository clone and ZIP upload scans will be rejected with HTTP 503 until resumed. Running scans will finish gracefully.
              </p>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scanPauseEnabled}
                  onChange={(e) => setScanPauseEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Pause incoming scan submissions</span>
              </label>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pause Reason (Shown to Users)</label>
                <input
                  type="text"
                  value={scanPauseReason}
                  onChange={(e) => setScanPauseReason(e.target.value)}
                  placeholder="e.g. Upgrading NIST PQC Rule Catalog to v2.1..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingScanPause}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50"
              >
                {isSavingScanPause ? 'Updating...' : 'Update Scan Engine State'}
              </button>
            </form>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Emergency Maintenance Mode</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  maintenanceEnabled
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {maintenanceEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Renders a persistent maintenance banner at the top of all customer screens alerting users to pending infrastructure maintenance.
              </p>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceEnabled}
                  onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Enable Maintenance Banner</span>
              </label>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Banner Notice</label>
                <input
                  type="text"
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  placeholder="e.g. Scheduled platform maintenance is taking place..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingMaintenance}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50"
              >
                {isSavingMaintenance ? 'Updating...' : 'Update Maintenance Mode'}
              </button>
            </form>
          </div>

          {/* Broadcast Announcement Publisher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Megaphone className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Broadcast Announcement Publisher</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  announcementEnabled
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {announcementEnabled ? 'BROADCASTING' : 'OFF'}
              </span>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementEnabled}
                  onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Publish Announcement to All Customers</span>
              </label>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. NIST PQC Standards (FIPS 203 & 204) Supported"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message</label>
                <textarea
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  rows={2}
                  placeholder="Full announcement message..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Severity / Accent</label>
                <select
                  value={announcementSeverity}
                  onChange={(e) => setAnnouncementSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="alert">Critical Alert (Red)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSavingAnnouncement}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50"
              >
                {isSavingAnnouncement ? 'Saving...' : 'Publish Announcement'}
              </button>
            </form>
          </div>

          {/* Storage & Disk Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Temporary Disk Storage & Worktree Hygiene</h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-4">
                The scanner creates temporary folders in <code className="text-slate-200">/tmp/quantumshield-*</code> when extracting uploaded ZIP files or cloning remote Git repositories.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Clicking the button below will immediately scan the staging directories and delete all worktrees and extracted files older than 24 hours to prevent host disk exhaustion.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePurgeStorage}
                disabled={isPurgingStorage}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-red-950/60 text-slate-200 hover:text-red-300 border border-slate-700 hover:border-red-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>{isPurgingStorage ? 'Purging Disk...' : 'Execute 1-Click Staging Storage Purge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
