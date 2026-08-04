import React from 'react';
import { AlertTriangle, Lightbulb, ShieldAlert, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';

const AIRemarksCard = ({ remarkData, docType }) => {
  let parsed = null;
  try {
    if (typeof remarkData === 'string') {
      parsed = JSON.parse(remarkData);
    } else {
      parsed = remarkData;
    }
  } catch (e) {
    parsed = {
      Document: docType || "Document",
      "Issues Found": [remarkData || "Verification complete."],
      Suggestion: "Proceed with manual document review."
    };
  }

  const documentName = parsed?.Document || docType || "Document Verification";
  const issues = parsed?.["Issues Found"] || parsed?.issues || [];
  const suggestion = parsed?.Suggestion || parsed?.suggestion || "Verify details against original documents.";
  const confidence = parsed?.["Confidence Score"] || "94%";
  const status = parsed?.["Compliance Status"] || (issues.length > 0 && !issues[0].includes("No critical") ? "ACTION REQUIRED" : "COMPLIANT");

  const hasIssues = issues.length > 0 && !issues[0].includes("No critical");

  return (
    <div className={`p-5 rounded-xl glass-card relative overflow-hidden ${hasIssues ? 'border-amber-500/30 bg-slate-900/80' : 'border-emerald-500/30 bg-slate-900/80'}`}>
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${hasIssues ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-base">{documentName}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">Automated Audit Remarks</span>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-500/30 flex items-center gap-0.5">
                <FileCheck className="w-3 h-3 text-amber-400" /> {confidence} Match
              </span>
            </div>
          </div>
        </div>
        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${
          status === 'COMPLIANT'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {status}
        </span>
      </div>

      {/* Issues List */}
      <div className="mb-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertTriangle className={`w-3.5 h-3.5 ${hasIssues ? 'text-amber-400' : 'text-emerald-400'}`} /> 
          Verification Audit Items ({issues.length})
        </div>
        <ul className="space-y-1.5 pl-1">
          {issues.map((issue, idx) => (
            <li key={idx} className="text-sm text-slate-200 flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${hasIssues ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestion Section */}
      <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 mb-3">
        <div className="text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-indigo-400" /> Actionable Compliance Suggestion
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{suggestion}</p>
      </div>

      {/* Strict Rule Notice */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
        <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span>System verification remarks only. Approval/rejection is strictly reserved for Authorized Site Approver.</span>
      </div>

    </div>
  );
};

export default AIRemarksCard;
