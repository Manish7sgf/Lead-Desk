import React, { useState, useEffect, useCallback, useRef } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  RefreshCw, 
  Inbox, 
  X,
  ExternalLink,
  Download,
  Star,
  Save,
  CheckCircle2,
  AlertCircle
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
  
  // Custom Admin Notes state
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Checkbox multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [exporting, setExporting] = useState(false);

  const searchInputRef = useRef(null);
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

  // Sync adminNotes when activeLead changes
  useEffect(() => {
    if (activeLead) {
      setAdminNotes(activeLead.notes || '');
      setNotesSuccess(false);
    }
  }, [activeLead]);

  // Keyboard shortcut (/) to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      setError('Failed to update lead status in database.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStar = async (leadId, e) => {
    if (e) e.stopPropagation();
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const newStarred = !targetLead.is_starred;
    setLeads((prev) =>
      prev.map((item) => (item.id === leadId ? { ...item, is_starred: newStarred } : item))
    );

    try {
      const res = await client.patch(`/leads/${leadId}`, { is_starred: newStarred });
      setLeads((prev) =>
        prev.map((item) => (item.id === leadId ? res.data : item))
      );
      if (activeLead && activeLead.id === leadId) {
        setActiveLead(res.data);
      }
    } catch (err) {
      console.error("Star toggle error:", err);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeLead) return;
    setSavingNotes(true);
    try {
      const res = await client.patch(`/leads/${activeLead.id}`, { notes: adminNotes });
      setLeads((prev) =>
        prev.map((item) => (item.id === activeLead.id ? res.data : item))
      );
      setActiveLead(res.data);
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Failed to save admin notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await client.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leaddesk_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV Export error:", err);
      alert("Failed to export leads CSV.");
    } finally {
      setExporting(false);
    }
  };

  // Checkbox select handler
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) => client.patch(`/leads/${id}`, { status: newStatus }))
      );
      await fetchLeads();
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk status error:", err);
      setError("Failed to execute bulk status update.");
    } finally {
      setLoading(false);
    }
  };

  // Filter leads client-side by tab
  const filteredLeads = leads.filter((lead) => {
    if (statusFilter === 'Starred') return lead.is_starred;
    if (statusFilter === 'All') return true;
    return lead.status === statusFilter;
  });

  // Calculate counts
  const totalCount = leads.length;
  const starredCount = leads.filter((l) => l.is_starred).length;
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

  const renderPriorityBadge = (priorityStr) => {
    if (priorityStr === 'High') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-950/60 border border-red-800/60 text-red-400">
          High
        </span>
      );
    }
    if (priorityStr === 'Medium') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 border border-amber-800/60 text-amber-400">
          Med
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800">
        Std
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header title & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight">Lead Triage Queue</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Real-time lead processing, admin notes, priority flagging, and CSV exports
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting || totalCount === 0}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            title="Download CSV export of all leads"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={fetchLeads}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-zinc-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Bulk action bar if selection active */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-between animate-fadeIn text-xs">
          <span className="font-mono text-zinc-300">
            Selected <strong className="text-white">{selectedIds.length}</strong> lead(s)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Bulk Mark As:</span>
            <button
              onClick={() => handleBulkStatusChange('Contacted')}
              className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 font-medium hover:bg-sky-900 transition-colors"
            >
              Contacted
            </button>
            <button
              onClick={() => handleBulkStatusChange('Closed')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-medium hover:bg-emerald-900 transition-colors"
            >
              Closed
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

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
            onClick={() => setStatusFilter('Starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'Starred'
                ? 'bg-zinc-800 text-amber-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400/30" />
            <span>Starred</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-amber-400/80 border border-zinc-700/50">
              {starredCount}
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

        {/* Search input with keyboard shortcut indicator */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or email... (/)"
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#09090b] border border-zinc-800/80 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 transition-all"
          />
          <kbd className="absolute right-2 top-2 text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded">
            /
          </kbd>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        {error && (
          <div className="p-3 bg-red-950/30 border-b border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
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
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-zinc-800 bg-[#09090b] accent-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 w-8"></th>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-4">Budget & Priority</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs text-zinc-300">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setActiveLead(lead)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={(e) => toggleSelectOne(lead.id, e)}
                        className="rounded border-zinc-800 bg-[#09090b] accent-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Star Button */}
                    <td className="py-3.5 px-2 text-center" onClick={(e) => handleToggleStar(lead.id, e)}>
                      <button className="text-zinc-600 hover:text-amber-400 transition-colors">
                        <Star className={`w-3.5 h-3.5 ${lead.is_starred ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Lead info */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-100 group-hover:text-white transition-colors flex items-center gap-1.5">
                        <span>{lead.name}</span>
                        {lead.notes && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="Has admin notes"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {lead.email}
                      </div>
                    </td>

                    {/* Budget & Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-zinc-300">
                          {lead.budget_range}
                        </span>
                        {renderPriorityBadge(lead.priority)}
                      </div>
                    </td>

                    {/* Message Preview */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-zinc-400 text-xs line-clamp-1 leading-relaxed">
                        {lead.message}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-zinc-500 font-mono">
                      {new Date(lead.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Status Dropdown */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
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

      {/* Side Slide-Over Drawer for Lead Details & Admin Notes */}
      {activeLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#121215] border-l border-zinc-800/80 h-full p-6 flex flex-col justify-between shadow-2xl animate-fadeIn overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleToggleStar(activeLead.id, e)}>
                    <Star className={`w-4 h-4 ${activeLead.is_starred ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                  </button>
                  {renderStatusDot(activeLead.status)}
                  <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    {activeLead.status} Lead
                  </span>
                  {renderPriorityBadge(activeLead.priority)}
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

                <div className="grid grid-cols-2 gap-3 pt-1">
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
                <div>
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

                {/* Project Requirements */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    Project Requirements
                  </label>
                  <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800/80 text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                    {activeLead.message}
                  </div>
                </div>

                {/* Internal Admin Notes Editor */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      Internal Admin Notes
                    </label>
                    {notesSuccess && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono animate-fadeIn">
                        <CheckCircle2 className="w-3 h-3" /> Saved to DB
                      </span>
                    )}
                  </div>
                  <textarea
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add private admin notes (e.g. called client on Friday, sent proposal...)"
                    className="w-full p-3 rounded-xl bg-[#09090b] border border-zinc-800 text-zinc-200 text-xs placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all resize-none"
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 mt-6">
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
