import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import StatusBadge from '../components/StatusBadge';
import { CheckCircle2, FileText, ArrowRight, Home } from 'lucide-react';

export default function LmoSuccess() {
  const { certificates, instrument } = useAppStore();

  const cert = certificates.find(c => c.instrumentId === instrument.id) || certificates[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate flex items-center justify-center p-4 sm:p-6 pb-20">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 text-center animate-in fade-in zoom-in duration-200">
        {/* Large green checkmark icon (CheckCircle2, 64px) */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-600" />
        </div>

        {/* Heading: # VERIFICATION COMPLETED */}
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
          Official Inspection Complete
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 mt-2 mb-2">
          VERIFICATION COMPLETED
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-8 max-w-sm mx-auto">
          The measuring instrument has passed all statutory standards and has been certified in the national registry.
        </p>

        {/* Certificate Details Card */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left text-xs space-y-3 mb-8">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Certificate ID:</span>
            <span className="font-mono font-bold text-navy-900 text-sm">{cert.id}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Instrument ID:</span>
            <span className="font-mono font-bold text-navy-900">{cert.instrumentId}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Status:</span>
            <StatusBadge status="VERIFIED" size="sm" />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Valid Until:</span>
            <span className="font-bold text-emerald-600">{cert.validUntil}</span>
          </div>
        </div>

        {/* Primary Action Button: "View Digital Certificate" (green) */}
        <div className="space-y-3">
          <Link
            to={`/certificate/${cert.id}`}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <FileText className="w-5 h-5" />
            <span>View Digital Certificate</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/owner/dashboard"
            className="w-full py-3 px-6 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
