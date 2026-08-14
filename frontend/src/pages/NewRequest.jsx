import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, vendorAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, 
  ArrowRight, 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  FileCheck, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Upload,
  Check,
  Send,
  HelpCircle,
  Users,
  Briefcase,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

const LOCATIONS = [
  'Jamshedpur',
  'Kalinganagar',
  'West Bokaro',
  'Angul',
  'Sukinda'
];

const WIZARD_STEPS = [
  { id: 1, title: 'Plant Site', subtitle: 'Location & Vendor Type' },
  { id: 2, title: 'Company Details', subtitle: 'Owner & Address Info' },
  { id: 3, title: 'Compliance PDFs', subtitle: 'Document Uploads' },
  { id: 4, title: 'Review & Submit', subtitle: 'Final Inspection' }
];

const NewRequest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [location, setLocation] = useState('Jamshedpur');
  const [vendorType, setVendorType] = useState('Contractor'); // 'Contractor' or 'Supplier'
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverId, setSelectedApproverId] = useState('');
  
  const getOneYearFromToday = () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    tsl_vendor_code: '',
    owner_name: '',
    company_name: '',
    nature_of_work: '',
    labour_capacity: 1,
    licence_flag: 'No',
    licence_number: 'N.A.',
    licence_expiry_date: getOneYearFromToday(),
    capping_detail: 'NA',
    ec_policy_doc: '',
    pf_flag: true,
    pf_code: '',
    esi_flag: true,
    esi_code: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
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

  const [declaration, setDeclaration] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovers(location);
  }, [location]);

  // Update PF/ESI flags dynamically when Vendor Type changes
  useEffect(() => {
    const isContractor = vendorType === 'Contractor';
    setFormData(prev => ({
      ...prev,
      pf_flag: isContractor,
      esi_flag: isContractor,
      labour_capacity: isContractor ? Math.min(prev.labour_capacity || 1, 9) : Math.min(prev.labour_capacity || 1, 4),
      pf_code: isContractor ? prev.pf_code : 'N.A.',
      esi_code: isContractor ? prev.esi_code : 'N.A.'
    }));
  }, [vendorType]);

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
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError(`File "${selectedFile.name}" must be in PDF format (.pdf).`);
        return;
      }
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
      setError('');
      setUploadProgress('Auto-filling real sample vendor payload...');
      
      const isContractor = vendorType === 'Contractor';

      setFormData({
        tsl_vendor_code: isContractor ? 'TSL/VEND/2026/C/00124' : 'TSL/VEND/2026/S/00087',
        owner_name: 'Ramesh Kumar',
        company_name: isContractor ? 'Apex Infrastructure Ltd' : 'Tata Metal Supplier Corp',
        nature_of_work: isContractor ? 'Industrial Civil Fabrication & Maintenance' : 'Steel & Refractory Supply',
        labour_capacity: isContractor ? 8 : 4,
        licence_flag: 'No',
        licence_number: 'N.A.',
        licence_expiry_date: getOneYearFromToday(),
        capping_detail: 'NA',
        ec_policy_doc: 'N/A',
        pf_flag: isContractor,
        pf_code: isContractor ? 'PY/KRP/0012345/000' : 'N.A.',
        esi_flag: isContractor,
        esi_code: isContractor ? '31000998877665544' : 'N.A.',
        address: 'Industrial Area, Phase-2',
        city: 'Jamshedpur',
        state: 'Jharkhand',
        pin_code: '831002',
        phone: '+91 9876543210',
        email: 'contact@vendorcorp.com',
        gst_number: '20AAACB1234C1Z5'
      });

      const createDummyPdfBlob = (title, content) => {
        const dummyPdfHeader = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj\n4 0 obj << /Length ${content.length + 100} >> stream\nBT /F1 12 Tf 50 700 TD (${title}) Tj 0 -20 TD (${content}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n350\n%%EOF`;
        return new File([dummyPdfHeader], `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
      };

      const docLabel = isContractor ? "Work Order" : "Purchase Order";
      const woFile = createDummyPdfBlob(docLabel, `${docLabel} Number: WO/2026/JAM/88421\nCompany Name: Apex Infrastructure Ltd\nVendor Name: Ramesh Kumar\nValidity: 2026-01-15 to 2027-01-14`);
      const regFile = createDummyPdfBlob("Registration Certificate", `Registration Number: REG/JH/2024/99120\nGST Number: 20AAACB1234C1Z5`);
      
      let pfFile = null;
      let esiFile = null;

      if (isContractor) {
        pfFile = createDummyPdfBlob("PF Certificate", `EPFO Office: Jamshedpur\nPF Code Number: PY/KRP/0012345/000`);
        esiFile = createDummyPdfBlob("ESI Certificate", `ESIC Office: Jamshedpur\nESI Code Number: 31000998877665544`);
      }

      setFiles({
        work_order: woFile,
        registration: regFile,
        pf: pfFile,
        esi: esiFile
      });

      setDeclaration(true);
      setUploadProgress('Sample vendor payload loaded successfully!');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Step Validation logic
  const handleNextStep = () => {
    setError('');

    if (currentStep === 1) {
      if (!selectedApproverId) {
        setError(`Please select an assigned Approver for the ${location} plant site.`);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const capacityNum = parseInt(formData.labour_capacity || 0);
      if (vendorType === 'Contractor' && capacityNum > 9) {
        setError('Contractor Labour Capacity cannot exceed 9.');
        return;
      }
      if (vendorType === 'Supplier' && capacityNum > 4) {
        setError('Supplier Labour Capacity cannot exceed 4.');
        return;
      }
      if (!formData.owner_name.trim() || !formData.company_name.trim() || !formData.address.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.gst_number.trim()) {
        setError('Please fill in all company and owner information fields.');
        return;
      }
      if (formData.gst_number.trim().length !== 15) {
        setError('GST Number must be exactly 15 characters (e.g. 20AAACB1234C1Z5).');
        return;
      }
      if (vendorType === 'Contractor' && (!formData.pf_code.trim() || !formData.esi_code.trim())) {
        setError('Contractor registration requires valid PF Code and ESI Code.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const isContractor = vendorType === 'Contractor';
      if (isContractor) {
        if (!files.work_order || !files.registration || !files.pf || !files.esi) {
          setError('Contractors MUST upload all 4 mandatory PDF documents (Work Order, Registration, PF, and ESI certificates).');
          return;
        }
      } else {
        if (!files.work_order || !files.registration) {
          setError('Suppliers MUST upload Purchase Order (P.O.) and Registration PDF documents.');
          return;
        }
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!declaration) {
      setError('Please check the declaration box to confirm document accuracy.');
      return;
    }

    setLoading(true);
    try {
      setUploadProgress('Step 1/3: Registering vendor profile...');
      const reqPayload = {
        ...formData,
        vendor_type: vendorType,
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

  const selectedApproverObj = approvers.find(a => String(a.id) === String(selectedApproverId));
  const isContractor = vendorType === 'Contractor';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/vendor/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={handleAutoFillSamplePDFs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm"
            title="Click to fill sample demo data"
          >
            <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Auto-Fill Test Sample Data
          </button>
        </div>

        {/* WIZARD PROGRESS STEPPER BAR */}
        <div className="mb-8 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {WIZARD_STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div 
                  key={step.id}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.id);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    isCompleted ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-sky-500/20 border-sky-500/50 shadow-md shadow-sky-500/10' 
                      : isCompleted 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-transform ${
                    isActive 
                      ? 'bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md shadow-sky-500/30 scale-105' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>

                  <div className="truncate">
                    <span className={`block text-xs font-bold truncate ${isActive ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}`}>
                      Step {step.id}: {step.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{step.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN WIZARD CONTAINER CARD */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl relative overflow-hidden">
          
          {/* Header Title */}
          <div className="border-b border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                Vendor Onboarding Wizard • Step {currentStep} of 4 ({vendorType})
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-2">
                {currentStep === 1 && <MapPin className="w-6 h-6 text-sky-400" />}
                {currentStep === 2 && <Building className="w-6 h-6 text-indigo-400" />}
                {currentStep === 3 && <Upload className="w-6 h-6 text-emerald-400" />}
                {currentStep === 4 && <Send className="w-6 h-6 text-amber-400" />}
                {WIZARD_STEPS[currentStep - 1].title}
              </h1>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress Toast */}
          {uploadProgress && (
            <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-3 animate-fadeIn">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
              <span>{uploadProgress}</span>
            </div>
          )}

          {/* Step 1: Location & Vendor Type */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Vendor Type Selection (Contractor vs Supplier) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Select Vendor Registration Type <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setVendorType('Contractor')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      vendorType === 'Contractor'
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xl ring-2 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">Contractor</span>
                      {vendorType === 'Contractor' && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Labor Contractor. Max 9 labor capacity. Requires Work Order, Registration, PF & ESI Allotment Letters.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVendorType('Supplier')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      vendorType === 'Supplier'
                        ? 'bg-sky-950/60 border-sky-500 text-white shadow-xl ring-2 ring-sky-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">Supplier</span>
                      {vendorType === 'Supplier' && <CheckCircle className="w-4 h-4 text-sky-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Material / Service Supplier. Max 4 labor capacity. Requires P.O. / D.O. and Registration document.
                    </p>
                  </button>
                </div>
              </div>

              {/* Plant Location Code */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-400" /> Select Target Plant Site Location Code <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`py-3 px-3 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        location === loc
                          ? 'bg-gradient-to-r from-blue-600 to-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/25'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section G: Approver Selection */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Assigned Site Approver for {location} <span className="text-rose-400">*</span>
                </label>
                {approvers.length === 0 ? (
                  <div className="text-xs text-amber-400 p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    No site approvers registered specifically for location "{location}". The system will assign the default plant approver.
                  </div>
                ) : (
                  <select
                    value={selectedApproverId}
                    onChange={(e) => setSelectedApproverId(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {approvers.map((appr) => (
                      <option key={appr.id} value={appr.id} className="bg-slate-900 text-slate-100">
                        {appr.name} ({appr.location} Site Approver)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Vendor Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">

              {/* Section A-0: TSL Procurement Registration (SOP Requirement #1) */}
              <div className="bg-amber-950/20 border border-amber-700/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tata Steel Registration Verification (Mandatory)</span>
                </div>
                <p className="text-xs text-amber-300/70 mb-4">
                  The vendor must be registered with <strong>Tata Steel Limited (TSL) Procurement</strong> and possess a valid Work Order / Purchase Order before CLM registration. Enter the TSL Vendor Code assigned by Tata Steel Procurement.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    TSL Procurement Vendor Code <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="tsl_vendor_code"
                    value={formData.tsl_vendor_code}
                    onChange={handleInputChange}
                    placeholder="e.g. TSL/VEND/2026/C/00124"
                    className="block w-full px-3.5 py-2.5 bg-slate-950/70 border border-amber-700/40 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    The CWR Cell approver will verify this code against Tata Steel's Procurement registration records.
                  </p>
                </div>
              </div>

              {/* Section B: Nature of Work & Labour Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nature of Work (per W.O. / P.O.) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="nature_of_work"
                    value={formData.nature_of_work}
                    onChange={handleInputChange}
                    placeholder="e.g. Civil Fabrication / Refractory Maintenance"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Labour Capacity (Max {isContractor ? 9 : 4}) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={isContractor ? 9 : 4}
                    name="labour_capacity"
                    value={formData.labour_capacity}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {isContractor ? 'Contractor limit: Max 9' : 'Supplier limit: Max 4'}
                  </span>
                </div>
              </div>

              {/* Work Order Validity End Date, Capping Detail & Statutory Licence Exemption */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Licence Expiry Date (W.O. / P.O. End Date) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    name="licence_expiry_date"
                    value={formData.licence_expiry_date}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sky-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Capping Detail
                  </label>
                  <input
                    type="text"
                    name="capping_detail"
                    value={formData.capping_detail}
                    onChange={handleInputChange}
                    placeholder="NA"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-[11px] text-slate-400 block mb-1">Labour Licence Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 w-fit">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Statutory Licence Exempt (Capacity ≤ {isContractor ? 9 : 4})
                  </span>
                </div>
              </div>

              {/* Sections C & D: PF & ESI Codes (Contractor mandatory, Supplier N/A) */}
              {isContractor && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      PF Code Number (EPFO) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required={isContractor}
                      name="pf_code"
                      value={formData.pf_code}
                      onChange={handleInputChange}
                      placeholder="e.g. PY/KRP/0012345/000"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      ESI Code Number (ESIC) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required={isContractor}
                      name="esi_code"
                      value={formData.esi_code}
                      onChange={handleInputChange}
                      placeholder="e.g. 31000998877665544"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Section E: Vendor Owner & Company Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Owner / Contact Person Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Company / Firm Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Apex Infrastructure Ltd"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Contact Phone (10 digits) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Official Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Statutory GST Number (GSTIN) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleInputChange}
                    placeholder="15-character GSTIN (e.g. 20AAACB1234C1Z5)"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Section F: Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Registered Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Plot No 42, Industrial Area, Phase-2"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Jamshedpur"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Jharkhand"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">PIN Code (6 digits)</label>
                  <input
                    type="text"
                    maxLength={6}
                    name="pin_code"
                    value={formData.pin_code}
                    onChange={handleInputChange}
                    placeholder="831002"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Step 3: Document Uploads */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-slate-400 mb-2">
                Upload required compliance certificates in PDF format (.pdf, maximum 15MB per file).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Work Order / Purchase Order */}
                <div className={`p-4 rounded-2xl border transition-all ${files.work_order ? 'bg-sky-950/30 border-sky-500/50' : 'bg-slate-950/60 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      1. {isContractor ? 'Work Order PDF' : 'Purchase Order (P.O.) / D.O. PDF'} <span className="text-rose-400">*</span>
                    </span>
                    {files.work_order && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'work_order')}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                  />
                  {files.work_order && <p className="text-[11px] text-sky-300 mt-1.5 truncate">Attached: {files.work_order.name}</p>}
                </div>

                {/* 2. Registration Certificate */}
                <div className={`p-4 rounded-2xl border transition-all ${files.registration ? 'bg-sky-950/30 border-sky-500/50' : 'bg-slate-950/60 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      2. Vendor Registration Document PDF <span className="text-rose-400">*</span>
                    </span>
                    {files.registration && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'registration')}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                  />
                  {files.registration && <p className="text-[11px] text-sky-300 mt-1.5 truncate">Attached: {files.registration.name}</p>}
                </div>

                {/* 3. PF Certificate (Contractor Only) */}
                {isContractor && (
                  <div className={`p-4 rounded-2xl border transition-all ${files.pf ? 'bg-sky-950/30 border-sky-500/50' : 'bg-slate-950/60 border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        3. PF Code Allotment Letter PDF <span className="text-rose-400">*</span>
                      </span>
                      {files.pf && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'pf')}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                    />
                    {files.pf && <p className="text-[11px] text-sky-300 mt-1.5 truncate">Attached: {files.pf.name}</p>}
                  </div>
                )}

                {/* 4. ESI Certificate (Contractor Only) */}
                {isContractor && (
                  <div className={`p-4 rounded-2xl border transition-all ${files.esi ? 'bg-sky-950/30 border-sky-500/50' : 'bg-slate-950/60 border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        4. ESI Code Allotment Letter PDF <span className="text-rose-400">*</span>
                      </span>
                      {files.esi && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'esi')}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                    />
                    {files.esi && <p className="text-[11px] text-sky-300 mt-1.5 truncate">Attached: {files.esi.name}</p>}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Step 4: Summary Review & Final Submission */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Vendor Submission Summary Inspection
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Vendor Type:</span>
                    <strong className="text-indigo-300 text-sm">{vendorType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Plant Site:</span>
                    <strong className="text-sky-300 text-sm">{location}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Assigned Site Approver:</span>
                    <strong className="text-emerald-300 text-sm">{selectedApproverObj?.name || 'Assigned Approver'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Company Name:</span>
                    <strong className="text-white font-semibold">{formData.company_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nature of Work:</span>
                    <strong className="text-slate-200">{formData.nature_of_work || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Labour Capacity:</span>
                    <strong className="text-amber-300 font-mono">{formData.labour_capacity} Workers</strong>
                  </div>
                  {isContractor && (
                    <>
                      <div>
                        <span className="text-slate-500 block">PF Code:</span>
                        <strong className="text-emerald-400 font-mono">{formData.pf_code}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ESI Code:</span>
                        <strong className="text-emerald-400 font-mono">{formData.esi_code}</strong>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-slate-500 block">GSTIN:</span>
                    <strong className="text-amber-300 font-mono">{formData.gst_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone & Email:</span>
                    <strong className="text-slate-300">{formData.phone} • {formData.email}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">Attached Statutory PDF Certificates:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1.5 truncate">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> {isContractor ? 'Work Order' : 'P.O. / D.O.'}
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1.5 truncate">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> Registration
                    </div>
                    {isContractor && (
                      <>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1.5 truncate">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> PF Certificate
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1.5 truncate">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> ESI Certificate
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declaration}
                    onChange={(e) => setDeclaration(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I hereby declare that all uploaded statutory compliance certificates are genuine, accurate, and valid for Tata Steel contract labor registration.
                  </span>
                </label>
              </div>

            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4 mt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {loading ? 'Submitting Registration...' : 'Submit Vendor Registration Request 🚀'}
              </button>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default NewRequest;
