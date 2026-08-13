import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ExternalLink, Building2, Briefcase, Info } from 'lucide-react';

const ValidationResultsCard = ({ validationReport }) => {
  if (!validationReport) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-xs text-slate-400">
        Loading Python Validation Results...
      </div>
    );
  }

  const { overall_valid, validation_checks, critical_errors, warnings, vendor_type } = validationReport;
  const isContractor = (vendor_type === 'Contractor');

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            isContractor 
              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
              : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
          }`}>
            {vendor_type || 'Contractor'} Statutory Audit Rules
          </span>
          <h4 className="font-bold text-white text-sm flex items-center gap-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Python Validation Engine Audit
          </h4>
        </div>

        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
          overall_valid 
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        }`}>
          {overall_valid ? '100% VALIDATED' : 'DISCREPANCIES FOUND'}
        </span>
      </div>

      <div className="space-y-2">
        {validation_checks?.map((check, index) => {
          const isExemptionCheck = check.check_name.includes('exemption');
          return (
            <div 
              key={index}
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-all ${
                isExemptionCheck
                  ? 'bg-sky-950/20 border-sky-500/30 text-sky-200'
                  : check.passed
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              }`}
            >
              {isExemptionCheck ? (
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              ) : check.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize text-slate-200">
                    {check.check_name.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{check.validator}</span>
                </div>
                {check.error_message && (
                  <p className={`text-[11px] mt-1 ${isExemptionCheck ? 'text-sky-300' : 'text-rose-300'}`}>
                    {check.error_message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {warnings && warnings.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Additional Audit Warnings:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Official Government Establishment Verification Links (Manab Dey SOP Requirement) */}
      <div className="pt-3 border-t border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-sky-400" /> CWR Cell Government Portal Verification Utilities:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a
            href="https://unifiedportal-emp.epfindia.gov.in/publicPortal/no-auth/misReport/home/loadEstSearchHome"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-sky-300 hover:text-white transition-all flex items-center justify-between text-[11px] font-medium"
          >
            <span>EPFO Establishment Search</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          </a>

          <a
            href="https://portal.esic.gov.in/EmployerSearch"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-300 hover:text-white transition-all flex items-center justify-between text-[11px] font-medium"
          >
            <span>ESIC Employer Search</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </a>
        </div>
      </div>

    </div>
  );
};

export default ValidationResultsCard;
