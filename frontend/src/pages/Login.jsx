import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  ArrowRight, 
  UserPlus, 
  Building, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Shield, 
  LockKeyhole, 
  Award,
  Loader2,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';

/* ============================================================================
   REUSABLE ENTERPRISE UI COMPONENTS
   ============================================================================ */

// 1. Enterprise Badge Component
const EnterpriseBadge = ({ icon: Icon, label }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300 backdrop-blur-md shadow-sm">
    <Icon className="w-3.5 h-3.5 text-sky-400" />
    <span>{label}</span>
  </div>
);

// 2. Reusable Floating Label Input Component with Password Toggle
const FormInput = ({ 
  id, 
  type = 'text', 
  label, 
  value, 
  onChange, 
  required = false, 
  icon: Icon, 
  placeholder,
  focusRingColor = 'focus:ring-sky-500 focus:border-sky-500'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-slate-300 tracking-wide">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={isPasswordType && showPassword ? 'text' : type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3.5'} ${isPasswordType ? 'pr-10' : 'pr-3.5'} py-2.5 bg-slate-950/70 border border-slate-800/90 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 ${focusRingColor} text-sm transition-all duration-300 font-sans shadow-inner`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

// 3. Reusable Enterprise Gradient Button
const PrimaryButton = ({ 
  loading, 
  children, 
  gradient = 'from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-indigo-600/25',
  type = 'submit' 
}) => (
  <button
    type={type}
    disabled={loading}
    className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
  >
    {loading ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin text-white" />
        <span>Authenticating...</span>
      </>
    ) : children}
  </button>
);

/* ============================================================================
   MAIN LOGIN PAGE COMPONENT
   ============================================================================ */

const Login = () => {
  // Vendor Form State
  const [vendorEmail, setVendorEmail] = useState('vendor@clm.com');
  const [vendorPassword, setVendorPassword] = useState('password123');
  const [vendorRemember, setVendorRemember] = useState(true);
  const [vendorError, setVendorError] = useState('');
  const [vendorLoading, setVendorLoading] = useState(false);

  // TSL Approver Form State (Compact Down Side Section)
  const [showApproverLogin, setShowApproverLogin] = useState(false);
  const [approverEmail, setApproverEmail] = useState('approver_jamshedpur@clm.com');
  const [approverPassword, setApproverPassword] = useState('password123');
  const [approverError, setApproverError] = useState('');
  const [approverLoading, setApproverLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Vendor Login Submission
  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setVendorError('');
    setVendorLoading(true);

    try {
      const user = await login(vendorEmail, vendorPassword);
      if (user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        setVendorError('Account registered as Approver. Please use the TSL Approver Section at the bottom.');
      }
    } catch (err) {
      setVendorError(err.response?.data?.detail || 'Vendor authentication failed. Please verify email and password.');
    } finally {
      setVendorLoading(false);
    }
  };

  // Approver Login Submission
  const handleApproverSubmit = async (e) => {
    e.preventDefault();
    setApproverError('');
    setApproverLoading(true);

    try {
      const user = await login(approverEmail, approverPassword);
      if (user.role === 'approver') {
        navigate('/approver/dashboard');
      } else {
        setApproverError('Account registered as Vendor. Please use the Vendor Portal form above.');
      }
    } catch (err) {
      setApproverError(err.response?.data?.detail || 'Approver authentication failed. Please verify email and password.');
    } finally {
      setApproverLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans antialiased selection:bg-sky-500 selection:text-white">
      
      {/* Dynamic Background Radial Mesh & Animated Ambient Glow Blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000"></div>

      {/* Top Enterprise Badges Header */}
      <header className="relative z-20 pt-6 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
        {/* Tata Steel Corporate Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/15">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
              TATA STEEL <span className="text-slate-500 font-normal">|</span> <span className="text-sky-400 text-sm font-semibold">CLM Enterprise</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Contract Labor Management System</p>
          </div>
        </div>

        {/* Security & Compliance Badges */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <EnterpriseBadge icon={LockKeyhole} label="Secure Login" />
          <EnterpriseBadge icon={Shield} label="SSL Protected" />
          <EnterpriseBadge icon={FileCheck} label="Statutory Compliance" />
          <EnterpriseBadge icon={Award} label="ISO Compliant" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 my-auto py-8 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full">
        
        {/* Page Hero Header */}
        <div className="text-center max-w-lg mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <FileCheck className="w-3.5 h-3.5" /> Tata Steel Vendor Onboarding & Compliance Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Vendor Partner Portal
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to submit company profile details and compliance certificates.
          </p>
        </div>

        {/* PRIMARY MAIN CARD: VENDOR PARTNER PORTAL */}
        <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] hover:border-sky-500/40 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-sky-500/10">
          
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform duration-300">
                <Building className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/10 text-sky-400 border border-blue-500/20">
                Vendor Partner Login
              </span>
            </div>

            {/* Validation Error Alert */}
            {vendorError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <span className="text-base leading-none">⚠️</span>
                <span>{vendorError}</span>
              </div>
            )}

            {/* Vendor Form */}
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <FormInput
                id="vendor-email"
                type="email"
                label="Vendor Work Email"
                required
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="vendor@clm.com"
                icon={User}
                focusRingColor="focus:ring-sky-500 focus:border-sky-500"
              />

              <FormInput
                id="vendor-password"
                type="password"
                label="Password"
                required
                value={vendorPassword}
                onChange={(e) => setVendorPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                focusRingColor="focus:ring-sky-500 focus:border-sky-500"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={vendorRemember}
                    onChange={(e) => setVendorRemember(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500/20 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact Tata Steel System Administrator to reset vendor password."); }} className="text-sky-400 font-medium hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>

              <div className="pt-2">
                <PrimaryButton 
                  loading={vendorLoading}
                  gradient="from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-sky-500/25"
                >
                  Sign In to Vendor Portal <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
              </div>
            </form>
          </div>

          {/* Vendor Register Link */}
          <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>New vendor partner?</span>
            <Link to="/register" className="text-sky-400 font-semibold hover:text-sky-300 hover:underline flex items-center gap-1 transition-colors">
              <UserPlus className="w-3.5 h-3.5" /> Register Vendor Account
            </Link>
          </div>

        </div>

        {/* =================================================================
           COMPACT DOWN SIDE SECTION: TSL APPROVER PORTAL LOGIN
           ================================================================= */}
        <div className="mt-6">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 transition-all duration-300 hover:border-emerald-500/30">
            <button
              type="button"
              onClick={() => setShowApproverLogin(!showApproverLogin)}
              className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-slate-200">TSL Approver Portal Login</span>
                  <p className="text-[11px] text-slate-400">Authorized Tata Steel Officers & Site Approvers</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[11px] text-emerald-400 font-medium">{showApproverLogin ? 'Close' : 'Sign In'}</span>
                {showApproverLogin ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showApproverLogin && (
              <div className="mt-4 pt-4 border-t border-slate-800/60 animate-fadeIn">
                {approverError && (
                  <div className="mb-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{approverError}</span>
                  </div>
                )}

                <form onSubmit={handleApproverSubmit} className="space-y-3">
                  <FormInput
                    id="approver-email"
                    type="email"
                    label="TSL Approver Email"
                    required
                    value={approverEmail}
                    onChange={(e) => setApproverEmail(e.target.value)}
                    placeholder="approver_jamshedpur@clm.com"
                    icon={User}
                    focusRingColor="focus:ring-emerald-500 focus:border-emerald-500"
                  />

                  <FormInput
                    id="approver-password"
                    type="password"
                    label="Password"
                    required
                    value={approverPassword}
                    onChange={(e) => setApproverPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={Lock}
                    focusRingColor="focus:ring-emerald-500 focus:border-emerald-500"
                  />

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={approverLoading}
                      className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {approverLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Authenticating Approver...</span>
                        </>
                      ) : (
                        <>Sign In as TSL Site Approver <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1 justify-center">
                  <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>Sites: Jamshedpur • Kalinganagar • West Bokaro • Angul • Sukinda</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 py-6 px-4 text-center border-t border-slate-900 bg-slate-950/80 backdrop-blur-md text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Tata Steel Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Contract Labor Management System</span>
            <span>•</span>
            <span className="text-sky-400 font-medium">Version 1.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Login;
