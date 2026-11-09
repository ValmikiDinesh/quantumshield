import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, Bell, X } from 'lucide-react';

export const PlatformAnnouncementBanner: React.FC = () => {
  const [banner, setBanner] = useState<{
    maintenance?: { enabled: boolean; message: string };
    announcement?: { enabled: boolean; title: string; message: string; severity: string };
  } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        const res = await fetch(`${baseUrl}/announcement`);
        if (res.ok) {
          const data = await res.json();
          setBanner(data);
        }
      } catch {
        // Non-blocking
      }
    };

    fetchAnnouncement();
  }, []);

  if (isDismissed || !banner) return null;

  // 1. Maintenance Mode takes highest priority
  if (banner.maintenance?.enabled) {
    return (
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600 shadow-sm">
        <div className="flex items-center space-x-2 mx-auto">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0 animate-bounce" />
          <span>{banner.maintenance.message || 'Scheduled platform maintenance is in progress.'}</span>
        </div>
      </div>
    );
  }

  // 2. Broadcast Announcement
  if (banner.announcement?.enabled && (banner.announcement.title || banner.announcement.message)) {
    const isAlert = banner.announcement.severity === 'alert';
    const isWarning = banner.announcement.severity === 'warning';

    return (
      <div
        className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b shadow-sm ${
          isAlert
            ? 'bg-red-600 text-white border-red-700'
            : isWarning
            ? 'bg-amber-500 text-slate-950 border-amber-600'
            : 'bg-indigo-600 text-white border-indigo-700'
        }`}
      >
        <div className="flex items-center space-x-2 mx-auto">
          {isAlert ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <Bell className="w-4 h-4 shrink-0" />
          )}
          <span>
            {banner.announcement.title && <strong className="mr-1.5">{banner.announcement.title}:</strong>}
            {banner.announcement.message}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-current opacity-70 hover:opacity-100 p-0.5 ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};
