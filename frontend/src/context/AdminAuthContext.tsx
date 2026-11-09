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

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const inactivityTimerRef = useRef<any>(null);

  const logout = useCallback(() => {
    adminApi.removeToken();
    setAdmin(null);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (admin) {
      inactivityTimerRef.current = setTimeout(() => {
        alert('Your administrative session has timed out due to 30 minutes of inactivity.');
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [admin, logout]);

  useEffect(() => {
    const handleActivity = () => resetInactivityTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

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
