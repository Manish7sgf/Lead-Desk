import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ArrowUpRight } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-100 font-mono text-[11px] font-bold shadow-sm group-hover:border-zinc-500 transition-colors">
            L
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-zinc-100 tracking-tight">LeadDesk</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">mini</span>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === '/'
                ? 'text-zinc-100 bg-zinc-800/90 border border-zinc-700/80 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
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
                    ? 'text-zinc-100 bg-zinc-800/90 border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Admin Triage</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800 flex items-center gap-1.5 transition-all"
                title="Sign out of admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center gap-1 transition-all"
            >
              <span>Admin Portal</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
