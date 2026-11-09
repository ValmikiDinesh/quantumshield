import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Invalid administrative credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 antialiased text-slate-100">
      <div className="w-full max-w-md">
        {/* Header Icon */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center mb-4 shadow-xl shadow-indigo-600/10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">QuantumShield Operator Console</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Valmiki Softwares Root Control Plane</p>
          <div className="inline-block mt-3 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-[10px] font-mono text-red-300">
            RESTRICTED ACCESS • AUTHORIZED PERSONNEL ONLY
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Operator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@valmikisoftwares.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In To Control Plane'}</span>
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-500 leading-relaxed font-mono">
            Every authentication attempt, IP address, and subsequent tenant inspection is permanently logged in the immutable audit trail.
          </p>
        </div>
      </div>
    </div>
  );
};
