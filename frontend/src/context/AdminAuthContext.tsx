import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { adminApi, AdminUser } from '../api/adminClient';

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = 'quantumshield_admin_last_activity';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lastRecordedRef = useRef<number>(Date.now());

  const logout = useCallback(() => {
    adminApi.removeToken();
    try {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch {}
    setAdmin(null);
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }, []);

  // Update activity timestamp in localStorage (throttled to at most once per 3 seconds)
  const recordActivity = useCallback(() => {
    // CRITICAL: Never record or track admin activity when navigating user/customer pages
    if (!window.location.pathname.startsWith('/admin')) {
      return;
    }
    const now = Date.now();
    if (now - lastRecordedRef.current > 3000) {
      lastRecordedRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } catch {}
    }
  }, []);

  // 1. Activity event listeners: ONLY active when on /admin/* routes
  useEffect(() => {
    if (!window.location.pathname.startsWith('/admin')) {
      return;
    }

    recordActivity();

    const handleUserAction = () => {
      recordActivity();
    };

    window.addEventListener('mousedown', handleUserAction, { passive: true });
    window.addEventListener('keydown', handleUserAction, { passive: true });
    window.addEventListener('scroll', handleUserAction, { passive: true });
    window.addEventListener('touchstart', handleUserAction, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handleUserAction);
      window.removeEventListener('keydown', handleUserAction);
      window.removeEventListener('scroll', handleUserAction);
      window.removeEventListener('touchstart', handleUserAction);
    };
  }, [recordActivity]);

  // 2. Inactivity polling loop: Checks every 15 seconds, ONLY on /admin routes (excluding /admin/login)
  useEffect(() => {
    const interval = setInterval(() => {
      // CRITICAL: NEVER run inactivity checks on customer routes (/app, /projects, etc.)
      if (!window.location.pathname.startsWith('/admin')) {
        return;
      }

      // If already on login page or no token exists, do nothing
      if (window.location.pathname === '/admin/login' || !adminApi.getToken()) {
        return;
      }

      const storedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
      const elapsed = Date.now() - storedActivity;

      // If truly inactive for >= 30 minutes across ALL admin tabs
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        adminApi.removeToken();
        try {
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        } catch {}
        setAdmin(null);
        window.location.href = '/admin/login?reason=timeout';
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // 3. Initial session verification
  useEffect(() => {
    const verifySession = async () => {
      const token = adminApi.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await adminApi.getProfile();
        setAdmin(res.admin);
      } catch {
        adminApi.removeToken();
        try {
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        } catch {}
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, passwordPlain: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await adminApi.login(email, passwordPlain);
      const now = Date.now();
      lastRecordedRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } catch {}
      setAdmin(res.admin);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
