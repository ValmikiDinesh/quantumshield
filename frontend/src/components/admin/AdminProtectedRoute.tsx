import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Loader2 } from 'lucide-react';

export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Verifying Operator Credentials...</p>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export const AdminPublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, isLoading } = useAdminAuth();

  if (isLoading) return null;
  if (admin) return <Navigate to="/admin/dashboard" replace />;

  return <>{children}</>;
};
