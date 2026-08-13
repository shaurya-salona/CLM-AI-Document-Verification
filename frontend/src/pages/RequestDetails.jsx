import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { approverAPI, aiAPI, API_BASE_URL } from '../services/api';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import AIRemarksCard from '../components/AIRemarksCard';
import ValidationResultsCard from '../components/ValidationResultsCard';
import { ArrowLeft, Building, MapPin, User, Phone, Mail, FileText, CheckCircle2, XCircle, Bot, ShieldAlert, Download, RefreshCw, Eye, X, AlertTriangle, Users, Briefcase } from 'lucide-react';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [validationReport, setValidationReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const data = await approverAPI.getRequestById(id);
      setRequest(data);
      if (data.documents && data.documents.length > 0) {
        setSelectedDoc(data.documents[0]);
      }
      const valReport = await approverAPI.getValidationResults(id);
      setValidationReport(valReport);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReRunAI = async () => {
    setAiGenerating(true);
    try {
      await aiAPI.generateRemarks(id);
      await fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approverAPI.approveRequest(parseInt(id), decisionRemarks);
      await fetchDetails();
      setTimeout(() => navigate('/approver/dashboard'), 800);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await approverAPI.rejectRequest(parseInt(id), decisionRemarks);
      await fetchDetails();
      setTimeout(() => navigate('/approver/dashboard'), 800);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyTsl = async () => {
    setActionLoading(true);
    try {
      await approverAPI.verifyTslRegistration(parseInt(id));
      await fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const openPdfModal = (url, title) => {
    setPreviewPdfUrl(url);
    setPreviewPdfTitle(title);
  };

  const closePdfModal = () => {
    setPreviewPdfUrl(null);
    setPreviewPdfTitle('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
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
            <Link to="/approver/dashboard" className="text-emerald-400 hover:underline mt-2 inline-block">Return to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const hasDocuments = request.documents && request.documents.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative font-sans antialiased text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Link to="/approver/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Approver Workstation
        </Link>

        {/* Top Request Summary Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-semibold">
                  Request #{request.id}
                </span>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {request.vendor_type || 'Contractor'}
                </span>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{request.company_name}</h1>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Submitted by owner {request.vendor_name} on {new Date(request.created_at).toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleReRunAI}
              disabled={aiGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer disabled:opacity-50 self-start md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} /> 
              {aiGenerating ? 'Running AI Engine...' : 'Re-Run AI Verification'}
            </button>
          </div>

          {/* Vendor Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-0.5">Owner Name</span>
              <strong className="text-white font-semibold text-sm">{request.vendor_name}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-0.5">Location Code</span>
              <strong className="text-sky-300 font-semibold text-sm">{request.location}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-0.5">Labour Capacity</span>
              <strong className="text-amber-300 font-mono text-xs">{request.labour_capacity || 1} Workers</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-0.5">Phone / Email</span>
              <strong className="text-slate-200 font-semibold block truncate">{request.phone}</strong>
              <span className="text-slate-400 text-[11px] truncate block">{request.email}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-0.5">GST Number</span>
              <strong className="text-amber-300 font-mono text-xs">{request.gst_number || 'N/A'}</strong>
            </div>
          </div>

          {/* TSL Registration Verification Banner */}
          <div className={`mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${request.tsl_registration_verified ? 'bg-emerald-950/20 border-emerald-700/30' : 'bg-amber-950/20 border-amber-700/30'}`}>
            <div className="flex items-center gap-3">
              <ShieldAlert className={`w-5 h-5 ${request.tsl_registration_verified ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div>
                <p className={`text-sm font-bold ${request.tsl_registration_verified ? 'text-emerald-300' : 'text-amber-300'}`}>
                  TSL Procurement Registration: {request.tsl_registration_verified ? '✅ VERIFIED' : '⚠️ PENDING VERIFICATION'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  TSL Vendor Code: <strong className="text-slate-200 font-mono">{request.tsl_vendor_code || 'Not provided'}</strong>
                  {request.tsl_verification_date && <span className="ml-3 text-emerald-400">· Verified at {new Date(request.tsl_verification_date).toLocaleString()}</span>}
                </p>
              </div>
            </div>
            {!request.tsl_registration_verified && (
              <button
                onClick={handleVerifyTsl}
                disabled={actionLoading}
                className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Verifying...' : 'Mark TSL Registration Verified'}
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Python Validation Engine, AI Remarks & Documents Inspection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left 2 Columns: Validation Results & AI Remarks */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Deterministic Python Validation Results */}
            <ValidationResultsCard validationReport={validationReport} />

            <div className="flex items-center justify-between pt-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" /> AI Document Verification Remarks
              </h3>
              <span className="text-xs text-slate-400">Rule & Standards Advisory Engine</span>
            </div>

            {/* AI Remarks List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {request.ai_remarks?.map((air) => (
                <AIRemarksCard key={air.id} remarkData={air.remarks} docType={air.document_type} />
              ))}
            </div>

            {/* Extracted Text Inspector */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" /> Extracted OCR Text Inspection
              </h4>

              {hasDocuments ? (
                <>
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {request.documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap capitalize cursor-pointer ${
                          selectedDoc?.id === doc.id
                            ? 'bg-sky-600 text-white shadow'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {doc.document_type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {selectedDoc ? (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {selectedDoc.extracted_text || "No text extracted."}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-4 text-center">Select a document tab above to inspect OCR text.</div>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>No OCR text available because no PDF documents were uploaded.</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Uploaded PDFs & Approver Action Panel */}
          <div className="space-y-6">
            
            {/* Uploaded Documents Download List */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Uploaded PDF Documents ({request.documents?.length || 0})
              </h3>
              
              {hasDocuments ? (
                <div className="space-y-2">
                  {request.documents.map((doc) => {
                    const fallbackUrl = doc.file_path ? `${API_BASE_URL}/${doc.file_path.replace(/\\/g, '/')}` : '';
                    const pdfSource = doc.file_data || fallbackUrl;
                    const docTitle = doc.document_type.replace('_', ' ').toUpperCase();
                    return (
                      <div key={doc.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-xs text-white capitalize block">
                            {doc.document_type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-mono truncate block max-w-[140px]">
                            {doc.file_data ? 'Direct DB Storage' : (doc.file_path ? doc.file_path.split('/').pop() : 'DB File')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openPdfModal(pdfSource, docTitle)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect PDF
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>No PDF files were uploaded for this request.</span>
                </div>
              )}
            </div>

            {/* Human Approver Decision Panel */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Human Approver Decision
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                The AI engine provides verification remarks only. You as the human approver render the final decision.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Official Decision Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={decisionRemarks}
                    onChange={(e) => setDecisionRemarks(e.target.value)}
                    placeholder="Enter compliance review observations or reason for approval / rejection..."
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* PDF Document Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl h-[85vh] rounded-2xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" /> {previewPdfTitle} Preview
              </h3>
              <button
                onClick={closePdfModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-900">
              <iframe
                src={previewPdfUrl}
                title={previewPdfTitle}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RequestDetails;
