import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, vendorAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { ArrowLeft, Upload, FileCheck, Building, User, Phone, Mail, MapPin, ShieldCheck, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const LOCATIONS = [
  'Jamshedpur',
  'Kalinganagar',
  'West Bokaro',
  'Angul',
  'Sukinda'
];

const NewRequest = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Jamshedpur');
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverId, setSelectedApproverId] = useState('');
  
  // Real use: Start all form fields completely empty
  const [formData, setFormData] = useState({
    owner_name: '',
    company_name: '',
    address: '',
    phone: '',
    email: '',
    gst_number: ''
  });

  const [files, setFiles] = useState({
    work_order: null,
    registration: null,
    pf: null,
    esi: null
  });

  const [uploadProgress, setUploadProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovers(location);
  }, [location]);

  const fetchApprovers = async (selectedLoc) => {
    try {
      const list = await authAPI.getApprovers(selectedLoc);
      setApprovers(list);
      if (list.length > 0) {
        setSelectedApproverId(list[0].id);
      } else {
        setSelectedApproverId('');
      }
    } catch (err) {
      console.error('Failed to fetch approvers', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, docType) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validation 1: Check File Extension (PDF only)
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError(`File "${selectedFile.name}" must be in PDF format (.pdf).`);
        return;
      }
      // Validation 2: Check File Size (Max 15MB)
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError(`File "${selectedFile.name}" exceeds the maximum 15MB size limit.`);
        return;
      }
      setError('');
    }
    setFiles(prev => ({ ...prev, [docType]: selectedFile }));
  };

  // Helper for quick testing demo datasets
  const handleAutoFillSamplePDFs = async () => {
    try {
      setUploadProgress('Loading pre-formatted sample vendor data and sample PDFs...');
      
      setFormData({
        owner_name: 'Ramesh Kumar',
        company_name: 'Apex Infrastructure Ltd',
        address: 'Industrial Area, Phase-2, Jamshedpur',
        phone: '+91 9876543210',
        email: 'ramesh@apexinfra.com',
        gst_number: '20AAACB1234C1Z5'
      });

      const createDummyPdfBlob = (title, content) => {
        const dummyPdfHeader = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj\n4 0 obj << /Length ${content.length + 100} >> stream\nBT /F1 12 Tf 50 700 TD (${title}) Tj 0 -20 TD (${content}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n350\n%%EOF`;
        return new File([dummyPdfHeader], `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
      };

      const woFile = createDummyPdfBlob("Work Order", `Work Order Number: WO/2026/JAM/88421\nCompany Name: Apex Infrastructure Ltd\nVendor Name: Ramesh Kumar\nIssue Date: 2026-01-15\nValidity Period: 2026-01-15 to 2027-01-14`);
      const regFile = createDummyPdfBlob("Registration Certificate", `Registration Number: REG/JH/2024/99120\nCompany Name: Apex Infrastructure Ltd\nGST Number: 20AAACB1234C1Z5\nRegistration Date: 2024-03-10`);
      const pfFile = createDummyPdfBlob("PF Certificate", `EPFO Regional Office: Jamshedpur\nEmployer Name: Apex Infrastructure Ltd\nPF Code Number: PY/KRP/0012345/000\nRegistration Date: 2023-08-20`);
      const esiFile = createDummyPdfBlob("ESI Certificate", `ESIC Regional Office: Jamshedpur\nEmployer Name: Apex Infrastructure Ltd\nESI Code Number: 31000998877665544\nRegistration Date: 2023-09-05`);

      setFiles({
        work_order: woFile,
        registration: regFile,
        pf: pfFile,
        esi: esiFile
      });

      setUploadProgress('Sample data attached!');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Real validation 1: Check required fields
    if (!formData.owner_name.trim() || !formData.company_name.trim() || !formData.address.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.gst_number.trim()) {
      setError('Please fill in all vendor company and owner information fields.');
      return;
    }

    // Real validation 2: GST Number format check (15 chars)
    if (formData.gst_number.trim().length !== 15) {
      setError('GST Number must be exactly 15 characters (e.g. 20AAACB1234C1Z5).');
      return;
    }

    // Real validation 3: Check selected approver
    if (!selectedApproverId) {
      setError(`Please select an Approver for the ${location} site location.`);
      return;
    }

    // Real validation 4: Check all 4 files are attached
    if (!files.work_order || !files.registration || !files.pf || !files.esi) {
      setError('You MUST upload all four required PDF documents (Work Order, Registration, PF, and ESI certificates).');
      return;
    }

    setLoading(true);
    try {
      setUploadProgress('Step 1/3: Registering vendor profile...');
      const reqPayload = {
        ...formData,
        location,
        approver_id: parseInt(selectedApproverId)
      };
      
      const createdReq = await vendorAPI.createRequest(reqPayload);
      
      setUploadProgress('Step 2/3: Uploading compliance PDF documents...');
      await vendorAPI.uploadDocuments(createdReq.id, files);

      setUploadProgress('Step 3/3: Submission complete! Redirecting to Dashboard...');
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit registration request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Link to="/vendor/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          
          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-indigo-400" /> New Vendor Registration
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter real company information, pick site approver, and upload 4 compliance PDF documents.
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleAutoFillSamplePDFs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm self-start sm:self-auto"
              title="Click to fill sample demo data"
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Auto-Fill Test Sample Data
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {uploadProgress && (
            <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
              <span>{uploadProgress}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Location Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400" /> 1. Select Target Plant / Location Code
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-center border transition-all ${
                      location === loc
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Vendor Basic Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Owner / Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Company / Firm Name *
                </label>
                <input
                  type="text"
                  required
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Apex Infrastructure Ltd"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Registered Office Address *
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Plot No 42, Industrial Area, Phase-2"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  GST Number (GSTIN) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                  placeholder="15-character GSTIN (e.g. 20AAACB1234C1Z5)"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                />
              </div>
            </div>

            {/* Step 3: Document Uploads (4 mandatory PDFs) */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                2. Upload Four Mandatory Compliance Documents (.pdf only, max 15MB)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Work Order */}
                <div className={`p-4 rounded-xl border transition-all ${files.work_order ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      1. Work Order PDF *
                    </span>
                    {files.work_order && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'work_order')}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  {files.work_order && <p className="text-[11px] text-indigo-300 mt-1 truncate">Attached: {files.work_order.name}</p>}
                </div>

                {/* 2. Registration Certificate */}
                <div className={`p-4 rounded-xl border transition-all ${files.registration ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      2. Registration Certificate PDF *
                    </span>
                    {files.registration && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'registration')}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  {files.registration && <p className="text-[11px] text-indigo-300 mt-1 truncate">Attached: {files.registration.name}</p>}
                </div>

                {/* 3. PF Certificate */}
                <div className={`p-4 rounded-xl border transition-all ${files.pf ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      3. PF Certificate PDF *
                    </span>
                    {files.pf && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'pf')}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  {files.pf && <p className="text-[11px] text-indigo-300 mt-1 truncate">Attached: {files.pf.name}</p>}
                </div>

                {/* 4. ESI Certificate */}
                <div className={`p-4 rounded-xl border transition-all ${files.esi ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      4. ESI Certificate PDF *
                    </span>
                    {files.esi && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'esi')}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  {files.esi && <p className="text-[11px] text-indigo-300 mt-1 truncate">Attached: {files.esi.name}</p>}
                </div>

              </div>
            </div>

            {/* Step 4: Select Approver */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Select Approver for {location} Location *
              </label>
              {approvers.length === 0 ? (
                <div className="text-sm text-amber-400 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  No registered approvers found specifically for location "{location}". System will assign default site approver.
                </div>
              ) : (
                <select
                  value={selectedApproverId}
                  onChange={(e) => setSelectedApproverId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {approvers.map((appr) => (
                    <option key={appr.id} value={appr.id}>
                      {appr.name} ({appr.location} Approver)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 text-base"
              >
                {loading ? 'Submitting Registration Documents...' : 'Submit Vendor Registration Request'}
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  );
};

export default NewRequest;
