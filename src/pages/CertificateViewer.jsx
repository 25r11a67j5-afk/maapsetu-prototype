import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Printer, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Scale, 
  AlertTriangle, 
  Check
} from 'lucide-react';

export default function CertificateViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCertificateById, instrument } = useAppStore();

  const cert = getCertificateById(id || "LM-CERT-938274");
  const [copied, setCopied] = useState(false);

  const verificationUrl = `${window.location.origin}/verify/${cert.id}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      alert(`Public Verification URL:\n${verificationUrl}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">
      {/* Navy Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8 shadow-sm no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Certificate Viewer
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Disclaimer Box */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">
              DEMO CERTIFICATE — PROTOTYPE (Legal Metrology Act, 2009)
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 hidden sm:inline">
            Smart India Hackathon 2026
          </span>
        </div>

        {/* Action Buttons Toolbar (No-Print) */}
        <div className="flex flex-wrap items-center justify-end gap-3 mb-6 no-print">
          {/* Print Button (Blue) */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          {/* Share Button (Blue) */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Link Copied!" : "Share"}</span>
          </button>

          {/* Verify Certificate Button (Green) */}
          <Link
            to={`/verify/${cert.id}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Certificate</span>
          </Link>
        </div>

        {/* Certificate Card */}
        <div className="certificate-card bg-white rounded-3xl shadow-xl border-4 border-slate-300 p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Scale className="w-96 h-96 text-navy-900" />
          </div>

          {/* Certificate Header */}
          <div className="text-center pb-8 border-b-2 border-slate-200">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-900 text-white mb-3 shadow-md">
              <Scale className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              Government of India • Department of Consumer Affairs
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              Directorate of Legal Metrology
            </p>

            {/* Certificate Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-wide mt-4 uppercase">
              DIGITAL VERIFICATION CERTIFICATE
            </h2>
            <p className="text-xs text-slate-500 mt-1 italic">
              Issued under Rule 11 of Legal Metrology (General) Rules, 2011
            </p>
          </div>

          {/* Main Certificate Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
            {/* Certificate Details: 2 columns on left */}
            <div className="md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
                Instrument & Verification Records
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Certificate ID:</span>
                  <span className="font-mono font-black text-navy-900">{cert.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Instrument ID:</span>
                  <span className="font-mono font-bold text-navy-900">{instrument.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Instrument Type:</span>
                  <span className="font-bold text-navy-900">{instrument.type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Manufacturer:</span>
                  <span className="font-semibold text-navy-900">{instrument.manufacturer}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Model:</span>
                  <span className="font-semibold text-navy-900">{instrument.model}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Serial Number:</span>
                  <span className="font-mono font-bold text-navy-900">{instrument.serial}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Capacity:</span>
                  <span className="font-bold text-navy-900">{instrument.capacity} (Class {instrument.accuracyClass})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Owner:</span>
                  <span className="font-bold text-navy-900">{instrument.owner}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-navy-900">{instrument.location}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Verification Date:</span>
                  <span className="font-bold text-slate-800">{cert.issuedDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-black text-emerald-600">{cert.validUntil}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Verified By:</span>
                  <span className="font-bold text-navy-900">{cert.verifiedBy} (Legal Metrology Officer)</span>
                </div>
              </div>
            </div>

            {/* Right: Large QR Code (200x200px minimum) */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Scan to Verify
              </span>

              <div className="p-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm inline-block">
                <QRCodeSVG
                  value={verificationUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="font-mono text-[10px] text-slate-400 mt-3 break-all max-w-[200px]">
                {verificationUrl}
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-100/70 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cryptographically Signed</span>
              </div>
            </div>
          </div>

          {/* Certificate Footer Signatures */}
          <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Digital Verification Hash:</p>
              <p className="font-mono text-[10px] text-slate-600 break-all">
                SHA256: 8f4b23a9d71e9803bf52c1e89270df8a31e8c97b10294e
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-navy-900">Digitally Certified by Officer LMO-027</p>
              <p className="text-slate-500">Inspector of Legal Metrology • Govt of India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
