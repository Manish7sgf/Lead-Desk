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
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 flex-1 flex flex-col justify-center">
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-8 space-y-1">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mx-auto mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Admin Authentication</h1>
          <p className="text-zinc-400 text-xs">Sign in to manage lead triage and status updates</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

        <div className="mt-6 pt-4 border-t border-zinc-800/60 text-center text-[11px] text-zinc-500">
          Default dev credentials: <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">admin</code> / <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">admin123</code>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
