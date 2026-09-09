import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Scale, UserCheck, RefreshCw, QrCode, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, resetDemoData } = useAppStore();

  const handleRoleSwitch = (role, path) => {
    setCurrentUser({
      role,
      name: role === 'OWNER' ? 'Rajesh Kumar' : role === 'ADMIN' ? 'Deepak Verma' : 'Rajesh Sharma (LMO)',
      email: role === 'OWNER' ? 'rajesh@abctraders.com' : role === 'ADMIN' ? 'admin@legalmetrology.gov.in' : 'lmo027@legalmetrology.gov.in'
    });
    navigate(path);
  };

  const isPublicVerify = location.pathname.startsWith('/verify');

  return (
    <header className="sticky top-0 z-50 shadow-md bg-navy-900 border-b border-navy-700 text-white">
      {/* Indian Flag Tricolor Bar */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-navy-900 font-bold shadow-md group-hover:bg-emerald-400 transition-colors">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-white">MAAPSETU</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                Legal Metrology Department • Govt. of India
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                location.pathname === '/' ? 'bg-navy-800 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/verify/LM-CERT-938274"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                isPublicVerify ? 'bg-emerald-600 text-white font-semibold' : 'text-emerald-300 hover:text-white hover:bg-emerald-600/20'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Verify Instrument</span>
            </Link>
            <Link
              to="/certificate/LM-CERT-938274"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                location.pathname.startsWith('/certificate') ? 'bg-navy-800 text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
              }`}
            >
              Certificate Viewer
            </Link>
          </nav>

          {/* Quick Demo Role Switcher & Action */}
          <div className="flex items-center gap-2">
            {/* Quick Demo Switcher Pills */}
            <div className="hidden lg:flex items-center bg-navy-800/90 border border-navy-700 rounded-lg p-1 text-xs">
              <span className="px-2 text-slate-400 font-medium">Demo Switch:</span>
              <button
                onClick={() => handleRoleSwitch('OWNER', '/owner/dashboard')}
                className={`px-2 py-1 rounded transition-colors ${
                  currentUser?.role === 'OWNER' && location.pathname.startsWith('/owner')
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMIN', '/admin/dashboard')}
                className={`px-2 py-1 rounded transition-colors ${
                  currentUser?.role === 'ADMIN' && location.pathname.startsWith('/admin')
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => handleRoleSwitch('LMO', '/lmo/field-verification')}
                className={`px-2 py-1 rounded transition-colors ${
                  currentUser?.role === 'LMO' && location.pathname.startsWith('/lmo')
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                LMO Officer
              </button>
            </div>

            {/* Reset Demo Button */}
            <button
              onClick={() => {
                resetDemoData();
                alert("Demo state reset to initial mock data!");
              }}
              title="Reset Demo Data"
              className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Login / Portal CTA Button */}
            {currentUser?.role ? (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-semibold text-slate-200"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{currentUser.role}</span>
                <span className="sm:hidden">Switch</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                <span>Portal Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
