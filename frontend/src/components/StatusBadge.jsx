import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const s = status ? status.toLowerCase() : 'pending';

  if (s === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </span>
    );
  }

  if (s === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/10">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-500/10">
      <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Review
    </span>
  );
};

export default StatusBadge;
