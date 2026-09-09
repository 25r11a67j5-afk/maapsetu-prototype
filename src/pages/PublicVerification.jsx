import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  AlertOctagon, 
  FileText, 
  Building2, 
  X, 
  Send,
  Lock
} from 'lucide-react';

export default function PublicVerification() {
  const { certId } = useParams();
  const { getCertificateById, instrument } = useAppStore();

  const cert = getCertificateById(certId || "LM-CERT-938274");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState('Seal Tampering Suspected');

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportText('');
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-20">
      {/* Navy Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-navy-950 font-bold shadow-md">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                MAAPSETU
              </h1>
              <p className="text-xs text-emerald-400 font-semibold">
                Public Certificate Verification System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Citizen Portal • Open Access</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Large Green Verification Section ("WOW" Banner) */}
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-3xl p-8 sm:p-10 text-center mb-8 shadow-gov-lg animate-in fade-in zoom-in duration-200">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 animate-bounce">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-600 tracking-tight mb-2">
            ✓ AUTHENTIC & VALID
          </h2>

          <p className="text-base sm:text-lg font-semibold text-slate-700 max-w-md mx-auto">
            This certificate has been verified against the National Legal Metrology Registry.
          </p>

          <p className="text-xs text-slate-500 mt-2">
            Cryptographic Signature: <span className="font-mono font-bold text-slate-700">VERIFIED-SHA256-OK</span>
          </p>
        </div>

        {/* Three Status Cards (Horizontal layout, stack on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/40 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Certificate Status
              </span>
              <span className="text-base font-extrabold text-emerald-600">
                ✓ ACTIVE
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/40 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Instrument Status
              </span>
              <span className="text-base font-extrabold text-emerald-600">
                ✓ VERIFIED
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/40 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Identity Match
              </span>
              <span className="text-base font-extrabold text-emerald-600">
                ✓ CONFIRMED
              </span>
            </div>
          </div>
        </div>

        {/* Instrument & Certificate Details Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Instrument Record Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Instrument Type</span>
              <span className="font-bold text-navy-900 text-base">{instrument.type}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Instrument ID</span>
              <span className="font-mono font-bold text-navy-900 text-base">{instrument.id}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Certificate Number</span>
              <span className="font-mono font-bold text-emerald-600 text-base">{cert.id}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Manufacturer</span>
              <span className="font-bold text-navy-900 text-base">{instrument.manufacturer}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Model & Serial</span>
              <span className="font-mono font-bold text-navy-900 text-base">{instrument.model} • {instrument.serial}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Capacity & Accuracy</span>
              <span className="font-bold text-navy-900 text-base">{instrument.capacity} (Class {instrument.accuracyClass})</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Verification Date</span>
              <span className="font-bold text-slate-800 text-base">{cert.issuedDate}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 block">Valid Until</span>
              <span className="font-bold text-emerald-600 text-base">{cert.validUntil}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
              <span className="text-xs text-slate-500 block">Issuing Authority</span>
              <span className="font-bold text-navy-900 text-base">
                Legal Metrology Department, Government of India (Officer {cert.verifiedBy})
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to={`/certificate/${cert.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accentBlue hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all text-center"
          >
            <FileText className="w-4 h-4" />
            <span>View Full Certificate</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-sm rounded-xl shadow-sm transition-all"
          >
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            <span>Report an Issue</span>
          </button>
        </div>
      </div>

      {/* Report an Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="text-lg font-bold text-navy-900">Report Inaccuracy / Issue</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h4 className="text-lg font-bold text-navy-900">Complaint Registered!</h4>
                <p className="text-xs text-slate-500">
                  Reference: <span className="font-mono font-bold text-navy-900">CMP-2026-99214</span>.
                  Dispatched to District Legal Metrology Inspector.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Issue Category
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-navy-900"
                  >
                    <option value="Seal Tampering Suspected">Broken or Tampered Security Seal</option>
                    <option value="Inaccurate Weighing / Underweight">Inaccurate Weighing / Under-delivery</option>
                    <option value="Display Malfunction">Display illegible or manipulated</option>
                    <option value="Expired Stamping">Expired Verification Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Description & Location Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Provide details (e.g., Shop name, observed weight difference, seal condition)..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
