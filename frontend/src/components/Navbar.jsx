import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, FileText, UserCheck, MapPin } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isVendor = user.role === 'vendor';

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Title */}
          <Link to={isVendor ? "/vendor/dashboard" : "/approver/dashboard"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                Tata Steel CLM <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">AI Verification</span>
              </span>
              <p className="text-xs text-slate-400">Contract Labor Management System</p>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="flex items-center gap-4">
            {isVendor ? (
              <>
                <Link 
                  to="/vendor/dashboard" 
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-sky-400" /> Dashboard
                </Link>
                <Link 
                  to="/vendor/new-request" 
                  className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  + New Request
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/approver/dashboard" 
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Pending Requests
                </Link>
              </>
            )}

            {/* User Profile & Role Info */}
            <div className="pl-4 border-l border-slate-800 flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-slate-200">{user.name}</div>
                <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                  <span className={`capitalize text-[11px] font-semibold px-1.5 py-0.2 rounded ${user.role === 'approver' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'}`}>
                    {user.role}
                  </span>
                  {user.location && (
                    <span className="flex items-center gap-0.5 text-slate-400">
                      • <MapPin className="w-3 h-3 text-slate-500" /> {user.location}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </nav>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
