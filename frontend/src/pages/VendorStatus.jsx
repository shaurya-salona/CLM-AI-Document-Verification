import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { approverAPI, API_BASE_URL } from '../services/api';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Building, MapPin, User, FileText, CheckCircle2, Clock, ShieldCheck, Download, AlertCircle, Printer, FileSpreadsheet } from 'lucide-react';

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

  const handleDownloadRegistrationDoc = () => {
    if (!request) return;
    
    const printWindow = window.open('', '_blank');
    const isContractor = (request.vendor_type === 'Contractor');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tata Steel CLM - Vendor Registration Document #${request.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
          .logo-text { font-size: 24px; font-weight: 800; color: #0369a1; letter-spacing: -0.5px; }
          .sub-header { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .title { text-align: center; font-size: 20px; font-weight: 700; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; margin-bottom: 20px; color: #0f172a; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
          th { background: #f1f5f9; font-weight: 700; color: #334155; width: 30%; }
          .section-title { font-size: 14px; font-weight: 700; color: #0284c7; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 15px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-text">TATA STEEL</div>
            <div class="sub-header">Contract Worker Management System</div>
          </div>
          <div>
            <span class="status-badge">Application Status: ${request.status}</span>
          </div>
        </div>

        <div class="title">Online Vendor Registration Summary Document</div>

        <div class="section-title">1. Plant & Vendor Profile Information</div>
        <table>
          <tr><th>Registration Request ID</th><td>#${request.id}</td></tr>
          <tr><th>Target Plant Site Location</th><td>${request.location}</td></tr>
          <tr><th>Assigned Site Approver</th><td>${request.approver}</td></tr>
          <tr><th>Vendor Type</th><td>${request.vendor_type}</td></tr>
          <tr><th>Company / Firm Name</th><td>${request.company_name}</td></tr>
          <tr><th>Owner / Contact Person</th><td>${request.vendor_name}</td></tr>
          <tr><th>Contact Phone & Email</th><td>${request.phone} | ${request.email}</td></tr>
        </table>

        <div class="section-title">2. Statutory Compliance Details (Misc Detail)</div>
        <table>
          <tr><th>Nature of Work</th><td>${request.nature_of_work || 'N/A'}</td></tr>
          <tr><th>Labour Capacity</th><td>${request.labour_capacity} Workers (Max Limit: ${isContractor ? 9 : 4})</td></tr>
          <tr><th>Labour Licence Flag</th><td>${request.licence_flag || 'No'} (Statutory Exempt ≤ 9)</td></tr>
          <tr><th>Labour Licence Number</th><td>${request.licence_number || 'N.A.'}</td></tr>
          <tr><th>Licence Expiry Date</th><td>${request.licence_expiry_date || 'N/A'}</td></tr>
          <tr><th>PF Code (EPFO)</th><td>${request.pf_code || 'N.A.'}</td></tr>
          <tr><th>ESI Code (ESIC)</th><td>${request.esi_code || 'N.A.'}</td></tr>
          <tr><th>Statutory GSTIN</th><td>${request.gst_number || 'N.A.'}</td></tr>
        </table>

        <div class="section-title">3. Registered Address Details</div>
        <table>
          <tr><th>Registered Address</th><td>${request.address || 'N/A'}</td></tr>
          <tr><th>City & State</th><td>${request.city || ''}, ${request.state || ''}</td></tr>
          <tr><th>PIN Code</th><td>${request.pin_code || 'N/A'}</td></tr>
        </table>

        <div class="section-title">4. Verification & Approval Decision</div>
        <table>
          <tr><th>Decision Remarks by Approver</th><td>${request.decision_remarks || 'N/A'}</td></tr>
          <tr><th>Submission Date</th><td>${new Date(request.created_at).toLocaleString()}</td></tr>
        </table>

        <div class="footer">
          Official System Generated Document • Tata Steel Contract Labor Management System
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-6">
          <Link to="/vendor/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <button
            onClick={handleDownloadRegistrationDoc}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Download Registration Document
          </button>
        </div>

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

          {/* Official Approver Decision Remarks */}
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
              const fallbackUrl = doc.file_path ? `${API_BASE_URL}/${doc.file_path.replace(/\\/g, '/')}` : '';
              const docSource = doc.file_data || fallbackUrl;
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
                      <p className="text-[11px] text-emerald-400 font-mono truncate max-w-[180px]">
                        {doc.file_data ? 'Direct DB Storage' : (doc.file_path ? doc.file_path.split('/').pop() : 'DB File')}
                      </p>
                    </div>
                  </div>

                  <a
                    href={docSource}
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
