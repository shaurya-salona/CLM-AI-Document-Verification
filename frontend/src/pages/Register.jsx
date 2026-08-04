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
   MAIN REGISTER PAGE COMPONENT (VENDOR ACCOUNT REGISTRATION ONLY)
   ============================================================================ */

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendor',
    location: 'Jamshedpur'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register(formData);
      // Auto login after successful vendor registration
      await login(formData.email, formData.password);
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
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
          <EnterpriseBadge icon={LockKeyhole} label="Secure Registration" />
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
              Register Vendor Partner Profile
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create your vendor partner account to submit compliance documents for Tata Steel site locations.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input */}
            <FormInput
              id="name"
              type="text"
              label="Vendor Company Owner / Contact Person"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              icon={User}
              focusRingColor="focus:ring-sky-500 focus:border-sky-500"
            />

            {/* Email Input */}
            <FormInput
              id="email"
              type="email"
              label="Official Work Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="vendor@company.com"
              icon={Mail}
              focusRingColor="focus:ring-sky-500 focus:border-sky-500"
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
              focusRingColor="focus:ring-sky-500 focus:border-sky-500"
            />

            {/* Plant Location Select */}
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Target Plant Site Location <span className="text-rose-400">*</span>
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
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800/90 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all duration-300 cursor-pointer"
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
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-lg shadow-sky-500/25 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Vendor Profile...</span>
                  </>
                ) : (
                  <>Complete Vendor Registration <UserPlus className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-slate-400">
            Already have a vendor account?{' '}
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
