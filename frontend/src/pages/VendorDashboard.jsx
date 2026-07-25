import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI } from '../services/api';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { 
  FilePlus, 
  FileText, 
  Building, 
  MapPin, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  ShieldCheck,
  FileCheck,
  Award,
  Sparkles,
  Info
} from 'lucide-react';

const VendorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);

  useEffect(() => {
    fetchVendorRequests(true);

    // Background real-time polling every 10 seconds
    const interval = setInterval(() => {
      fetchVendorRequests(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchVendorRequests = async (showMainLoader = false) => {
    if (showMainLoader) setLoading(true);
    setIsLiveRefreshing(true);
    try {
      const data = await vendorAPI.getStatus();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch vendor requests", err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsLiveRefreshing(false), 800);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-3xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                Real-Time Live Auto-Sync Active
              </span>
              <span className="text-xs text-slate-500">• Tata Steel CLM Vendor Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Vendor Onboarding & Registration Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Submit company registration profile, upload statutory PDFs, and track site approver verification status.
            </p>
          </div>

          <Link
            to="/vendor/new-request"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-sky-500/20 transition-all active:scale-98 flex-shrink-0"
          >
            <FilePlus className="w-4 h-4" /> Submit Registration Request
          </Link>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/[0.08] hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Verification</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{pendingCount}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Awaiting site approver review</span>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/[0.08] hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Registrations</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{approvedCount}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Active approved vendor profiles</span>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/[0.08] hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Action Required / Rejected</span>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{rejectedCount}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Requires document correction</span>
            </div>
          </div>
        </div>


        {/* Submissions List Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" /> My Vendor Submissions
            </h3>
            <div className="flex items-center gap-3">
              {isLiveRefreshing && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-sky-400" /> Live Syncing...
                </span>
              )}
              <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                {requests.length} Total Submissions
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading your registration submissions...</div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-inner">
                <FileText className="w-8 h-8 text-sky-400/50" />
              </div>
              <h4 className="text-lg font-bold text-white">No Registration Requests Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                You haven't submitted any vendor registration requests yet. Click below to submit your company profile and compliance documents.
              </p>
              <Link
                to="/vendor/new-request"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/20 transition-all hover:from-blue-500 hover:to-sky-400"
              >
                <FilePlus className="w-4 h-4" /> Submit Registration Request
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {requests.map((req) => (
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
                        <MapPin className="w-3.5 h-3.5 text-sky-400" /> Target Site: <strong className="text-sky-300">{req.location}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        Assigned Approver: <strong className="text-slate-200">{req.approver}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Submitted: {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {req.decision_remarks && (
                      <div className="mt-2 text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                        <strong className="text-amber-400">Official Decision Remarks:</strong> {req.decision_remarks}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Link
                      to={`/vendor/status/${req.id}`}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      View Details & Uploaded PDFs <ArrowUpRight className="w-4 h-4" />
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

export default VendorDashboard;
