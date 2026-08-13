import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  MapPin, 
  UserPlus, 
  Building, 
  Eye, 
  EyeOff, 
  Shield, 
  LockKeyhole, 
  Award,
  Loader2,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

const LOCATIONS = ['Jamshedpur', 'Kalinganagar', 'West Bokaro', 'Angul', 'Sukinda'];

/* ============================================================================
   REUSABLE ENTERPRISE UI COMPONENTS
   ============================================================================ */

const EnterpriseBadge = ({ icon: Icon, label }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300 backdrop-blur-md shadow-sm">
    <Icon className="w-3.5 h-3.5 text-sky-400" />
    <span>{label}</span>
  </div>
);

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
      <label htmlFor={id} className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
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
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3.5'} ${isPasswordType ? 'pr-10' : 'pr-3.5'} py-2.5 bg-slate-950/70 border border-slate-800/90 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 ${focusRingColor} text-sm transition-all duration-300 shadow-inner`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-sky-400" />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   MAIN REGISTER PAGE COMPONENT (WITH EMAIL OTP VERIFICATION)
   ============================================================================ */

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // Step 1: User Profile Form, Step 2: Email OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendor',
    location: 'Jamshedpur'
  });

  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Step 1: Request Email Verification OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.sendOtp(formData.email, 'registration');
      setDemoOtp(res.otp_demo || '123456');
      setInfoMsg(`Security Verification Code sent to ${formData.email}.`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please verify email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Register Account
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!otpCode.trim() || otpCode.length < 4) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP Code
      await authAPI.verifyOtp(formData.email, otpCode);
      
      // 2. Complete Account Registration
      await authAPI.register(formData);
      
      // 3. Auto login after verification
      await login(formData.email, formData.password);
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans antialiased selection:bg-sky-500 selection:text-white">
      
      {/* Background Ambient Mesh & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Top Corporate Branding & Enterprise Badges */}
      <header className="relative z-20 pt-6 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
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

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <EnterpriseBadge icon={LockKeyhole} label="2FA OTP Security" />
          <EnterpriseBadge icon={Shield} label="SSL Protected" />
          <EnterpriseBadge icon={Award} label="ISO Compliant" />
        </div>
      </header>

      {/* Main Form Section */}
      <main className="relative z-10 my-auto py-8 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full">
        
        <div className="glass-panel bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top Gradient Accent Line */}
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>

          {/* Form Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3 bg-gradient-to-tr from-blue-600 to-sky-400 shadow-blue-600/30">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {step === 1 ? 'Register Vendor Partner Profile' : 'Email OTP Verification'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {step === 1 
                ? 'Create your vendor account to submit compliance documents for Tata Steel site locations.'
                : `Enter the 6-digit security code sent to ${formData.email}`}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span>{infoMsg}</span>
                <p className="mt-1 text-[11px] text-amber-300">
                  📩 Please check your email inbox (and spam folder) for your 6-digit security code.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: INITIAL REGISTRATION FORM */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <FormInput
                id="name"
                type="text"
                label="Vendor Company Owner / Contact Person"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                icon={User}
              />

              <FormInput
                id="email"
                type="email"
                label="Official Work Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@company.com"
                icon={Mail}
              />

              <FormInput
                id="password"
                type="password"
                label="Password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                icon={Lock}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase mb-1.5">
                  Tata Steel Plant Site Location <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4 text-sky-400" />
                  </div>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800/90 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-all shadow-inner"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="bg-slate-900 text-slate-100">
                        {loc} Plant Site
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending OTP Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-sky-300" />
                    <span>Send Email Verification OTP</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: EMAIL OTP VERIFICATION FORM */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase mb-1.5">
                  Enter 6-Digit Email Verification Code <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    placeholder="e.g. 482910 or 123456"
                    className="block w-full pl-10 pr-3.5 py-3 bg-slate-950/90 border border-amber-500/50 rounded-xl text-slate-100 font-mono text-center tracking-[0.4em] text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Code valid for 10 minutes</span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-sky-400 hover:underline font-semibold"
                >
                  Resend OTP Code
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Verify & Complete Registration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Footer Link */}
          <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already registered as a Tata Steel Vendor?{' '}
              <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors underline">
                Sign In to CLM Portal
              </Link>
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 border-t border-slate-900 text-center text-[11px] text-slate-500">
        © 2026 Tata Steel Limited. Contract Labor Management (CLM) AI Verification System.
      </footer>

    </div>
  );
};

export default Register;
