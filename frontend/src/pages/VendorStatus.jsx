import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { approverAPI, API_BASE_URL } from '../services/api';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Building, MapPin, User, FileText, CheckCircle2, Clock, ShieldCheck, Download, AlertCircle } from 'lucide-react';

const VendorStatus = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const data = await approverAPI.getRequestById(id);
      setRequest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">Request Not Found</h3>
            <Link to="/vendor/dashboard" className="text-indigo-400 hover:underline mt-2 inline-block">Return to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Link to="/vendor/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Request Header Summary */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  Registration Req #{request.id}
                </span>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{request.company_name}</h1>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Submitted on {new Date(request.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Registration Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Owner / Contact Name</span>
              <strong className="text-white text-sm">{request.vendor_name}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Target Plant Location</span>
              <strong className="text-sky-300 text-sm">{request.location}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Assigned Site Approver</span>
              <strong className="text-emerald-300 text-sm">{request.approver}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">GST Number</span>
              <strong className="text-amber-300 font-mono">{request.gst_number || 'N/A'}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
              <span className="text-slate-500 block mb-0.5">Registered Office Address</span>
              <strong className="text-slate-200">{request.address || 'N/A'}</strong>
            </div>
          </div>

          {/* Official Approver Decision Remarks (If Approved or Rejected) */}
          {request.decision_remarks && (
            <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-indigo-500/30 text-sm text-slate-200">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Official Approver Decision Remarks
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{request.decision_remarks}</p>
            </div>
          )}
        </div>

        {/* Submitted Documents Checklist */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" /> Submitted Verification Documents ({request.documents?.length || 0})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {request.documents?.map((doc) => {
              const docUrl = `${API_BASE_URL}/${doc.file_path.replace(/\\/g, '/')}`;
              return (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
                        {doc.file_path.split('/').pop()}
                      </p>
                    </div>
                  </div>

                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Download Uploaded Document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
};

export default VendorStatus;
