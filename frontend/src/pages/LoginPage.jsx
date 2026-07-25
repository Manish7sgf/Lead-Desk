import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }

    setSubmitting(true);
    setError('');

    const res = await login(username.trim(), password);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Authentication failed. Please check credentials.');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 flex-1 flex flex-col justify-center transition-colors">
      <div className="bg-white border border-slate-200 dark:bg-[#121215] dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-8 space-y-1">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 mx-auto mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Admin Authentication</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-xs">Sign in to manage lead triage and status updates</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800/50 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-[#09090b] dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-zinc-500 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-[#09090b] dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-zinc-500 transition-all"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800/60 text-center text-[11px] text-slate-500 dark:text-zinc-500">
          Default dev credentials: <code className="text-slate-900 bg-slate-100 dark:text-zinc-300 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800">admin</code> / <code className="text-slate-900 bg-slate-100 dark:text-zinc-300 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800">admin123</code>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
