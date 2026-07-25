import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { approverAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Building, 
  Calendar, 
  Eye, 
  ShieldCheck, 
  RefreshCw,
  Search,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const ApproverDashboard = () => {
  const { user } = useAuth();
  const [allRequests, setAllRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests(true);

    // Real-Time Background Polling (refreshes data every 10 seconds automatically)
    const interval = setInterval(() => {
      fetchRequests(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async (showMainLoader = false) => {
    if (showMainLoader) setLoading(true);
    setIsLiveRefreshing(true);
    try {
      // Fetch all requests assigned to location/approver for accurate metrics
      const data = await approverAPI.getRequests(null);
      setAllRequests(data);
    } catch (err) {
      console.error('Failed to load approver requests', err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsLiveRefreshing(false), 800);
    }
  };

  // Accurate Metric Counters derived from all assigned requests
  const pendingCount = allRequests.filter((r) => r.status === 'Pending').length;
  const approvedCount = allRequests.filter((r) => r.status === 'Approved').length;
  const rejectedCount = allRequests.filter((r) => r.status === 'Rejected').length;

  // Filter requests based on selected tab and search term
  const tabFilteredRequests = allRequests.filter((req) => {
    if (activeTab === 'All') return true;
    return req.status === activeTab;
  });

  const filteredRequests = tabFilteredRequests.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      req.company_name?.toLowerCase().includes(term) ||
      req.vendor_name?.toLowerCase().includes(term) ||
      req.gst_number?.toLowerCase().includes(term) ||
      String(req.id).includes(term)
    );
  });

  const tabsConfig = [
    { id: 'Pending', label: 'Pending', count: pendingCount, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'Approved', label: 'Approved', count: approvedCount, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'Rejected', label: 'Rejected', count: rejectedCount, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'All', label: 'All', count: allRequests.length, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-3xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <MapPin className="w-3.5 h-3.5" /> Assigned Plant Location: {user?.location || 'All Sites'}
              </span>
              <span className="text-xs text-slate-500">• Tata Steel Approver Workstation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Site Approver Workstation
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review vendor registrations, inspect OCR text layer & AI compliance remarks, and approve or reject submissions.
            </p>
          </div>

          {/* Clean Single Line Horizontal Tab Bar */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto whitespace-nowrap self-start md:self-auto max-w-full">
            {tabsConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${
                  activeTab === tab.id ? 'bg-white/20 text-white border-white/30' : tab.color
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Overview Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/[0.08]">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Submissions</div>
            <div className="text-3xl font-extrabold text-white mt-2">{allRequests.length}</div>
            <div className="text-xs text-slate-500 mt-1">Plant site location submissions</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/[0.08] border-l-4 border-l-amber-500">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Action</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-2">{pendingCount}</div>
            <div className="text-xs text-slate-500 mt-1">Requires human review</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/[0.08] border-l-4 border-l-emerald-500">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Vendors</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">{approvedCount}</div>
            <div className="text-xs text-slate-500 mt-1">Authorized labor contracts</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/[0.08] border-l-4 border-l-rose-500">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected Submissions</div>
            <div className="text-3xl font-extrabold text-rose-400 mt-2">{rejectedCount}</div>
            <div className="text-xs text-slate-500 mt-1">Declined or sent for edit</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Vendor, Company, GSTIN or REQ ID..."
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs transition-all"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {isLiveRefreshing && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Live Auto-Syncing...
              </span>
            )}
            <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Showing <strong className="text-white">{filteredRequests.length}</strong> of {allRequests.length} Submissions
            </span>
          </div>
        </div>

        {/* Requests List Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" /> {activeTab} Submissions for {user?.location || 'Plant Site'}
            </h3>
            <span className="text-xs text-slate-400">AI Document Audit Enabled</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading location vendor requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
              </div>
              <h4 className="text-lg font-bold text-white">No {activeTab} Requests Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                There are currently no vendor requests matching tab "{activeTab}" for plant location {user?.location}.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredRequests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-semibold">
                        REQ #{req.id}
                      </span>
                      <h4 className="font-bold text-white text-lg">{req.company_name}</h4>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" /> Owner: <strong className="text-slate-200">{req.vendor_name}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Plant Site: <strong className="text-emerald-300">{req.location}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        GSTIN: <strong className="text-slate-200 font-mono">{req.gst_number || 'N/A'}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Submitted: {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-indigo-300 mt-2 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" /> AI Statutory Verification Remarks Ready
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Link
                      to={`/approver/request/${req.id}`}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Eye className="w-4 h-4" /> Review Request & AI Remarks
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ApproverDashboard;
