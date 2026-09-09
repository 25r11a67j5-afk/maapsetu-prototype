import React from 'react';
import { Scale, Shield, Phone, Mail, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-slate-400 text-sm no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-wider">MAAPSETU</span>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              Online Verification System for Weighing and Measuring Instruments.
              Designed for transparency, compliance, and consumer trust across India.
            </p>
            <p className="text-xs text-emerald-400 font-medium italic">
              "Every Instrument Has a Story"
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Hackathon Context</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Smart India Hackathon 2026</span>
              </li>
              <li>Problem Statement: <strong>PS-036</strong></li>
              <li>GovTech Innovation Category</li>
              <li>Department of Consumer Affairs</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Support & Helpline</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>National Consumer Toll-Free: 1915</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support.legalmetrology@gov.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>256-bit Cryptographic QR Verification</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 MAAPSETU • Legal Metrology Department • Government of India. Prototype for demonstration.</p>
          <p className="mt-2 sm:mt-0">Fast • Reliable • Anti-Tampering Standard</p>
        </div>
      </div>
    </footer>
  );
}
