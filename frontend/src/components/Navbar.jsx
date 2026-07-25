import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, ArrowUpRight, Sun, Moon, Monitor } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 dark:border-zinc-800/60 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-5 h-5 rounded-md bg-slate-900 text-white dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700/80 flex items-center justify-center font-mono text-[11px] font-bold shadow-sm group-hover:border-zinc-500 transition-colors">
            L
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-slate-900 dark:text-zinc-100 tracking-tight">LeadDesk</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:border-zinc-700/50">mini</span>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === '/'
                ? 'text-slate-900 bg-slate-100 border border-slate-200 dark:text-zinc-100 dark:bg-zinc-800/90 dark:border-zinc-700/80 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Submit Lead
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === '/admin'
                    ? 'text-slate-900 bg-slate-100 border border-slate-200 dark:text-zinc-100 dark:bg-zinc-800/90 dark:border-zinc-700/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span>Admin Triage</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-all"
                title="Sign out of admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-300 dark:hover:text-white border border-slate-200 dark:border-zinc-800 flex items-center gap-1 transition-all"
            >
              <span>Admin Portal</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
            </Link>
          )}

          {/* 3-Theme Switcher Segment Bar */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 ml-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-1 rounded-md transition-all ${
                theme === 'light'
                  ? 'bg-white text-amber-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-1 rounded-md transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-800 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-1 rounded-md transition-all ${
                theme === 'system'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
              title="System Default Theme"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
