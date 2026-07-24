import React, { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  RefreshCw, 
  Inbox, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const STATUS_OPTIONS = ["New", "Contacted", "Closed"];

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [activeLead, setActiveLead] = useState(null);

  const { logout } = useAuth();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      const res = await client.get('/leads', { params });
      setLeads(res.data);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Failed to load leads list from backend database.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, logout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const handleStatusChange = async (leadId, newStatus) => {
    setUpdatingId(leadId);
    try {
      const res = await client.patch(`/leads/${leadId}`, { status: newStatus });
      setLeads((prev) =>
        prev.map((item) => (item.id === leadId ? res.data : item))
      );
      if (activeLead && activeLead.id === leadId) {
        setActiveLead(res.data);
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError('Failed to update lead status in backend database.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter leads client-side by tab
  const filteredLeads = leads.filter((lead) => {
    if (statusFilter === 'All') return true;
    return lead.status === statusFilter;
  });

  // Calculate counts
  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === 'New').length;
  const contactedCount = leads.filter((l) => l.status === 'Contacted').length;
  const closedCount = leads.filter((l) => l.status === 'Closed').length;

  const renderStatusDot = (statusStr) => {
    switch (statusStr) {
      case 'New':
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>;
      case 'Contacted':
        return <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>;
      case 'Closed':
        return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 flex-shrink-0"></span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight">Lead Triage Queue</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Overview of inbound client submissions and status workflow
          </p>
        </div>
        
        <button
          onClick={fetchLeads}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-zinc-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Control Bar: Integrated Filter Tabs + Search */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-2.5 mb-6 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Status Filter Segment Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-[#09090b] border border-zinc-800/60 rounded-xl">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'All'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/50">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('New')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'New'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>New</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/50">
              {newCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Contacted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'Contacted'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>Contacted</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/50">
              {contactedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'Closed'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Closed</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/50">
              {closedCount}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead by name or email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-800/80 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 transition-all"
          />
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        {error && (
          <div className="p-3 bg-red-950/30 border-b border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {loading && leads.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
            <span>Loading lead queue...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-zinc-300">No leads found</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {searchQuery || statusFilter !== 'All'
                  ? 'No entries match your filter criteria'
                  : 'Submit a new lead on the public landing page to test intake'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-[#09090b]/60 text-zinc-400 text-[11px] font-mono font-medium uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Lead</th>
                  <th className="py-3 px-4 sm:px-6">Budget</th>
                  <th className="py-3 px-4 sm:px-6">Description</th>
                  <th className="py-3 px-4 sm:px-6">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs text-zinc-300">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setActiveLead(lead)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Lead info */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-medium text-zinc-100 group-hover:text-white transition-colors">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {lead.email}
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-zinc-300">
                        {lead.budget_range}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="py-3.5 px-4 sm:px-6 max-w-xs">
                      <p className="text-zinc-400 text-xs line-clamp-1 leading-relaxed">
                        {lead.message}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-[11px] text-zinc-500 font-mono">
                      {new Date(lead.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Status Dropdown */}
                    <td
                      className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          disabled={updatingId === lead.id}
                          className="px-2.5 py-1 rounded-lg bg-[#09090b] border border-zinc-800 text-[11px] font-medium text-zinc-200 focus:outline-none focus:border-zinc-600 transition-all cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="bg-zinc-900 text-zinc-100">
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side Slide-Over Drawer for Lead Details */}
      {activeLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#121215] border-l border-zinc-800/80 h-full p-6 flex flex-col justify-between shadow-2xl animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2">
                  {renderStatusDot(activeLead.status)}
                  <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    {activeLead.status} Lead
                  </span>
                </div>
                <button
                  onClick={() => setActiveLead(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lead metadata */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100">{activeLead.name}</h3>
                  <a
                    href={`mailto:${activeLead.email}`}
                    className="text-xs text-zinc-400 font-mono hover:text-zinc-200 inline-flex items-center gap-1 transition-colors mt-0.5"
                  >
                    <span>{activeLead.email}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Budget Bracket</span>
                    <span className="text-xs font-semibold text-zinc-200 font-mono mt-0.5 block">{activeLead.budget_range}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Created On</span>
                    <span className="text-xs font-semibold text-zinc-200 font-mono mt-0.5 block">
                      {new Date(activeLead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="pt-2">
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    Update Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(activeLead.id, st)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                          activeLead.status === st
                            ? 'bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm'
                            : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Body */}
                <div className="pt-2">
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    Project Requirements
                  </label>
                  <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800/80 text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto font-sans">
                    {activeLead.message}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/80">
              <button
                onClick={() => setActiveLead(null)}
                className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
