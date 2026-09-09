import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = "md" }) {
  const normalized = (status || '').toUpperCase();

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs font-semibold px-2.5 py-1",
    lg: "text-sm font-bold px-3 py-1.5"
  }[size] || "text-xs font-semibold px-2.5 py-1";

  if (normalized === 'VERIFIED' || normalized === 'ACTIVE' || normalized === 'PASS' || normalized === 'COMPLETED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 ${sizeClasses}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>✓ {normalized}</span>
      </span>
    );
  }

  if (normalized === 'PENDING_ASSIGNMENT' || normalized === 'PENDING' || normalized === 'SUBMITTED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 ${sizeClasses}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{normalized === 'PENDING_ASSIGNMENT' ? 'PENDING ASSIGNMENT' : normalized}</span>
      </span>
    );
  }

  if (normalized === 'SCHEDULED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-300 ${sizeClasses}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>SCHEDULED</span>
      </span>
    );
  }

  if (normalized === 'FAIL' || normalized === 'EXPIRED' || normalized === 'REJECTED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-300 ${sizeClasses}`}>
        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
        <span>✕ {normalized}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
      <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      <span>{normalized || 'UNKNOWN'}</span>
    </span>
  );
}
