import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  QrCode, 
  Shield, 
  ArrowRight, 
  Scale, 
  FileText, 
  Search, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function WelcomePage() {
  const lifecycleSteps = [
    { title: "REGISTER", desc: "Digital Passport Created", icon: FileText, step: "01" },
    { title: "APPLY", desc: "Request Verification", icon: Search, step: "02" },
    { title: "VERIFY", desc: "LMO Field Inspection", icon: Scale, step: "03" },
    { title: "CERTIFY", desc: "Cryptographic Certificate", icon: Award, step: "04" },
    { title: "SCAN", desc: "Citizen QR Validation", icon: QrCode, step: "05" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-navy-950 via-navy-900 to-primaryNavy text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Shield className="w-4 h-4" />
            <span>GovTech Portal • Problem Statement PS-036</span>
          </div>

          {/* Logo & Platform Name */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-navy-950 shadow-xl">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
              MAAPSETU
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-emerald-400 font-semibold tracking-wide mb-3">
            Digital Instrument Verification & Legal Metrology Platform
          </p>

          {/* Hero Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 mb-6 italic">
            “Every Instrument Has a Story”
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-10 max-w-2xl mx-auto">
            A unified end-to-end Legal Metrology ecosystem connecting instrument owners, 
            field verification officers, department administrators, and 1.4 billion citizens through tamper-evident QR verification.
          </p>

          {/* Two Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-base shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Login to Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/verify/LM-CERT-938274"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <QrCode className="w-5 h-5" />
              <span>Verify an Instrument</span>
            </Link>
          </div>
        </div>

        {/* Three Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full mb-16">
          <div className="bg-navy-800/80 backdrop-blur-sm border border-navy-700 hover:border-emerald-500/40 rounded-2xl p-6 transition-all shadow-gov hover:shadow-emerald-500/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Digital Identity</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every instrument has a unique digital record with verifiable serial numbering, specifications, and complete tamper-evident audit history.
            </p>
          </div>

          <div className="bg-navy-800/80 backdrop-blur-sm border border-navy-700 hover:border-blue-500/40 rounded-2xl p-6 transition-all shadow-gov hover:shadow-blue-500/10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Field Verification</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Officers verify instruments and capture evidence digitally with GPS coordinates, multi-angle photos, and calibrated load tolerance tests.
            </p>
          </div>

          <div className="bg-navy-800/80 backdrop-blur-sm border border-navy-700 hover:border-purple-500/40 rounded-2xl p-6 transition-all shadow-gov hover:shadow-purple-500/10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Public QR Verification</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Anyone can verify certificate authenticity instantly. Consumers scan stamped QR codes directly from any mobile camera without logging in.
            </p>
          </div>
        </div>

        {/* Verification Lifecycle Section: REGISTER → APPLY → VERIFY → CERTIFY → SCAN */}
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
              End-to-End GovTech Journey
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Instrument Verification Lifecycle
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
            {lifecycleSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div 
                  key={step.title}
                  className="bg-navy-800/60 border border-navy-700/80 rounded-xl p-4 flex flex-col items-center text-center relative group hover:border-emerald-500/50 transition-colors"
                >
                  <span className="text-[10px] font-extrabold text-emerald-400 mb-1">{step.step}</span>
                  <div className="w-10 h-10 rounded-lg bg-navy-700/60 flex items-center justify-center text-slate-200 group-hover:text-emerald-300 mb-2 transition-colors">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-wider">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{step.desc}</p>
                  
                  {idx < lifecycleSteps.length - 1 && (
                    <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
