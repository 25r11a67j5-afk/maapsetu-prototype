import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store/appStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');

    try {
      // Sign in using Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Unable to sign in. Please try again.');
      }

      // Get the user's profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error(
          'Login successful, but your MAAPSETU profile could not be loaded.'
        );
      }

      // Store the logged-in user
      setCurrentUser({
        id: profile.id,
        role: profile.role,
        name: profile.full_name,
        email: profile.email
      });

      // Redirect according to role
      if (profile.role === 'OWNER') {
        navigate('/owner/dashboard');
      } else if (profile.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (profile.role === 'LMO') {
        navigate('/lmo/field-verification');
      } else {
        throw new Error('Your account has an invalid role.');
      }

    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-navy-950 via-navy-900 to-primaryNavy">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

          {/* Header */}
          <div className="p-8 text-center bg-slate-50 border-b border-slate-100">

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-900 text-white shadow-md mb-3">
              <Scale className="w-7 h-7 text-emerald-400" />
            </div>

            <h1 className="text-2xl font-black text-navy-900 tracking-wide">
              MAAPSETU
            </h1>

            <p className="text-xs text-slate-500 font-medium mt-1">
              National Legal Metrology Verification Portal
            </p>

          </div>

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="p-8 space-y-5">

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

            {/* Email */}
            <div>

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email / User ID
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />

              </div>

            </div>

            {/* Password */}
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
                onClick={() => setErrorMessage('Password reset will be added next.')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Forgot Password?
              </button>

            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >

              <span>
                {loading ? 'Signing In...' : 'Sign In'}
              </span>

              {!loading && (
                <ArrowRight className="w-4 h-4" />
              )}

            </button>

          </form>

          {/* Registration Information */}
          <div className="p-6 pt-4 bg-slate-50 border-t border-slate-200">

            <div className="text-center">

              <p className="text-xs text-slate-500">
                New instrument owners can register through the
                MAAPSETU registration process.
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Admin and LMO accounts are created by authorized department personnel.
              </p>

            </div>

          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Official Prototype for SIH 2026 • Department of Consumer Affairs
        </p>

      </div>
    </div>
  );
}