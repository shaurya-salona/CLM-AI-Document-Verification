import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  MapPin, 
  ArrowRight, 
  UserPlus, 
  Building, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Shield, 
  LockKeyhole, 
  Sparkles, 
  Award,
  Loader2 
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
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   MAIN REGISTER PAGE COMPONENT
   ============================================================================ */

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole = searchParams.get('role') === 'approver' ? 'approver' : 'vendor';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    location: 'Jamshedpur'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'approver' || roleParam === 'vendor') {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register(formData);
      // Auto login after successful registration
      const user = await login(formData.email, formData.password);
      if (user.role === 'approver') {
        navigate('/approver/dashboard');
      } else {
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const isVendorRole = formData.role === 'vendor';

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
          <EnterpriseBadge icon={LockKeyhole} label="Secure Registration" />
          <EnterpriseBadge icon={Shield} label="SSL Protected" />
          <EnterpriseBadge icon={Award} label="ISO Compliant" />
        </div>
      </header>

      {/* Main Form Section */}
      <main className="relative z-10 my-auto py-8 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full">
        
        <div className="glass-panel bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top Gradient Accent Line */}
          <div className={`absolute top-0 inset-x-8 h-px bg-gradient-to-r ${isVendorRole ? 'from-transparent via-sky-500/50 to-transparent' : 'from-transparent via-emerald-500/50 to-transparent'}`}></div>

          {/* Form Header */}
          <div className="text-center mb-6">
            <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3 ${isVendorRole ? 'bg-gradient-to-tr from-blue-600 to-sky-400 shadow-blue-600/30' : 'bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-emerald-600/30'}`}>
              {isVendorRole ? <Building className="w-6 h-6 text-white" /> : <UserCheck className="w-6 h-6 text-white" />}
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Create {isVendorRole ? 'Vendor Partner' : 'TSL Site Approver'} Profile
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isVendorRole 
                ? 'Register your official Vendor Partner profile to submit compliance documents.' 
                : 'Register your official TSL Site Approver profile for your assigned plant location.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Account Type / Role <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'vendor' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isVendorRole
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" /> Vendor Account
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'approver' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isVendorRole
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Approver Account
                </button>
              </div>
            </div>

            {/* Name Input */}
            <FormInput
              id="name"
              type="text"
              label={isVendorRole ? "Vendor Company Owner / Contact Person" : "TSL Approver Name"}
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isVendorRole ? "e.g. Ramesh Kumar" : "e.g. Rajesh Sharma"}
              icon={User}
              focusRingColor={isVendorRole ? 'focus:ring-sky-500 focus:border-sky-500' : 'focus:ring-emerald-500 focus:border-emerald-500'}
            />

            {/* Email Input */}
            <FormInput
              id="email"
              type="email"
              label="Official Work Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={isVendorRole ? "vendor@company.com" : "approver@clm.com"}
              icon={Mail}
              focusRingColor={isVendorRole ? 'focus:ring-sky-500 focus:border-sky-500' : 'focus:ring-emerald-500 focus:border-emerald-500'}
            />

            {/* Password Input */}
            <FormInput
              id="password"
              type="password"
              label="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              icon={Lock}
              focusRingColor={isVendorRole ? 'focus:ring-sky-500 focus:border-sky-500' : 'focus:ring-emerald-500 focus:border-emerald-500'}
            />

            {/* Plant Location Select */}
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isVendorRole ? "Target Plant Location" : "Assigned Approver Plant Site Location"} <span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800/90 rounded-xl text-slate-100 focus:outline-none focus:ring-2 ${isVendorRole ? 'focus:ring-sky-500 focus:border-sky-500' : 'focus:ring-emerald-500 focus:border-emerald-500'} text-sm transition-all duration-300 cursor-pointer`}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-slate-900 text-slate-100">{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50 ${
                  isVendorRole
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-sky-500/25'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating {isVendorRole ? 'Vendor' : 'Approver'} Account...</span>
                  </>
                ) : (
                  <>Complete Registration <UserPlus className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 font-semibold hover:text-sky-300 hover:underline transition-colors">
              Sign In to Workspace
            </Link>
          </div>

        </div>
      </main>

      {/* Corporate Footer */}
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

export default Register;
