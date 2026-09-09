import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '../components/StatusBadge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Award, 
  FileText, 
  Building2, 
  MapPin, 
  Calendar, 
  Layers, 
  Check, 
  ChevronRight,
  ShieldCheck,
  QrCode
} from 'lucide-react';

export default function InstrumentPassport() {
  const navigate = useNavigate();
  const { instrument, certificates } = useAppStore();

  const cert = certificates.find((c) => c.instrumentId === instrument.id) || certificates[0];
  const verificationUrl = `${window.location.origin}/verify/${cert.id}`;

  const timelineSteps = [
    { label: "Instrument Registered", date: instrument.registeredDate, done: true },
    { label: "Verification Requested", date: "08 Sep 2026", done: true },
    { label: "Field Verification Completed", date: "08 Sep 2026", done: true },
    { label: "Certificate Issued", date: cert.issuedDate, done: true },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">
      {/* Navy Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white mb-3 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  Digital Instrument Passport
                </span>
                <span className="font-mono text-xs text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
                  {instrument.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {instrument.type}
              </h1>
            </div>

            {/* Status Section */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 block leading-tight">Verification Status</span>
                <span className="text-sm font-extrabold text-emerald-400 tracking-wider">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Passport Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Specifications Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Technical Specifications & Ownership</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="flex flex-col pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-500">Manufacturer</span>
              <span className="font-bold text-navy-900 text-base">{instrument.manufacturer}</span>
            </div>

            <div className="flex flex-col pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-500">Model Number</span>
              <span className="font-bold text-navy-900 text-base">{instrument.model}</span>
            </div>

            <div className="flex flex-col pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-500">Serial Number</span>
              <span className="font-mono font-bold text-navy-900 text-base">{instrument.serial}</span>
            </div>

            <div className="flex flex-col pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-500">Maximum Capacity</span>
              <span className="font-bold text-navy-900 text-base">{instrument.capacity}</span>
            </div>

            <div className="flex flex-col pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-500">Accuracy Class</span>
              <span className="font-bold text-navy-900 text-base">Class {instrument.accuracyClass}</span>
            </div>

            <div className="flex flex-col pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-500">Registered Owner</span>
              <span className="font-bold text-navy-900 text-base flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {instrument.owner}
              </span>
            </div>

            <div className="flex flex-col pb-2 border-b border-slate-50 sm:col-span-2">
              <span className="text-xs text-slate-500">Inspection Location</span>
              <span className="font-bold text-navy-900 text-base flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {instrument.location}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Section: Certificate Info Card & Large QR Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left: Certificate Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Certificate Details</span>
                </span>
                <StatusBadge status={cert.status} size="sm" />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 text-xs">Certificate ID</span>
                  <span className="font-mono font-bold text-navy-900">{cert.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 text-xs">Verified Date</span>
                  <span className="font-semibold text-slate-800">{cert.issuedDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 text-xs">Valid Until</span>
                  <span className="font-bold text-emerald-600">{cert.validUntil}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 text-xs">Verified By</span>
                  <span className="font-semibold text-navy-900">{cert.verifiedBy} (Legal Metrology Officer)</span>
                </div>
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
              <Link
                to={`/certificate/${cert.id}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accentBlue hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all text-center"
              >
                <FileText className="w-4 h-4" />
                <span>View Certificate</span>
              </Link>
              <Link
                to={`/verify/${cert.id}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all text-center"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Publicly</span>
              </Link>
            </div>
          </div>

          {/* Right: Large QR Code (200x200px) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              <QrCode className="w-4 h-4 text-navy-900" />
              <span>Scan QR Code to Verify</span>
            </div>

            {/* QR Container */}
            <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block">
              <QRCodeSVG
                value={verificationUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="font-mono text-[11px] text-slate-400 mt-3 max-w-xs break-all">
              /verify/{cert.id}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Encodes official tamper-proof verification URL
            </p>
          </div>
        </div>

        {/* Timeline Section at Bottom */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Verification Lifecycle Audit Trail</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {timelineSteps.map((step, idx) => (
              <div 
                key={step.label}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center relative"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mb-2 shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-navy-900">{step.label}</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">{step.date}</p>
                <span className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">
                  ✓ Done
                </span>

                {idx < timelineSteps.length - 1 && (
                  <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
