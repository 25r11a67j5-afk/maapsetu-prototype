import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Scale, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, HardHat } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppStore();

  const [email, setEmail] = useState('rajesh@abctraders.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSignIn = (e) => {
    e.preventDefault();
    setCurrentUser({
      role: 'OWNER',
      name: 'Rajesh Kumar',
      email: email || 'rajesh@abctraders.com'
    });
    navigate('/owner/dashboard');
  };

  const handleQuickAccess = (role, path, name, userEmail) => {
    setCurrentUser({
      role,
      name,
      email: userEmail
    });
    navigate(path);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-navy-950 via-navy-900 to-primaryNavy">
      <div className="w-full max-w-md">
        {/* Centered White Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header & Branding */}
          <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-900 text-white shadow-md mb-3">
              <Scale className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-navy-900 tracking-wide">MAAPSETU</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              National Legal Metrology Verification Portal
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email / User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => alert("For prototype demonstration, use the Quick Demo Access buttons below.")}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Section */}
          <div className="p-8 pt-4 bg-slate-50 border-t border-slate-200">
            <div className="text-center mb-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                ⚡ Quick Demo Access
              </span>
              <p className="text-xs text-slate-500 mt-1">
                One-click instant login into specific stakeholder roles
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleQuickAccess('OWNER', '/owner/dashboard', 'Rajesh Kumar', 'rajesh@abctraders.com')}
                className="w-full py-3 px-4 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-sm shadow-sm flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">→ Instrument Owner</span>
                </div>
                <span className="text-[11px] bg-blue-700/60 px-2 py-0.5 rounded font-normal">
                  Rajesh Kumar (ABC Traders)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAccess('ADMIN', '/admin/dashboard', 'Deepak Verma', 'admin@legalmetrology.gov.in')}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">→ Department Admin</span>
                </div>
                <span className="text-[11px] bg-purple-800/60 px-2 py-0.5 rounded font-normal">
                  Legal Metrology Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAccess('LMO', '/lmo/field-verification', 'Rajesh Sharma', 'lmo027@legalmetrology.gov.in')}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <HardHat className="w-4 h-4 text-slate-900 group-hover:scale-110 transition-transform" />
                  <span className="font-bold">→ LMO Field Officer</span>
                </div>
                <span className="text-[11px] bg-amber-600/60 text-white px-2 py-0.5 rounded font-medium">
                  Officer LMO-027
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Official Prototype for SIH 2026 • Department of Consumer Affairs
        </p>
      </div>
    </div>
  );
}
