import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';

import {
  Plus,
  Scale,
  Eye,
  FileCheck2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  Building2
} from 'lucide-react';

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Get currently logged-in user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/login');
        return;
      }

      // Get owner profile
      const {
        data: profileData,
        error: profileError
      } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      // Get owner's instruments
      const {
        data: instrumentData,
        error: instrumentError
      } = await supabase
        .from('instruments')
        .select(`
          id,
          instrument_number,
          instrument_type,
          manufacturer,
          model,
          serial_number,
          capacity,
          capacity_unit,
          accuracy_class,
          location,
          registered_date,
          status
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (instrumentError) {
        throw instrumentError;
      }

      setInstruments(instrumentData || []);

      // Get owner's applications
      const {
        data: applicationData,
        error: applicationError
      } = await supabase
        .from('applications')
        .select(`
          id,
          application_number,
          instrument_id,
          verification_type,
          preferred_date,
          status,
          remarks,
          created_at,
          instruments (
            instrument_number
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (applicationError) {
        throw applicationError;
      }

      setApplications(applicationData || []);

    } catch (error) {
      console.error('Dashboard error:', error);

      setErrorMessage(
        error.message || 'Unable to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Dashboard calculations
  // -----------------------------

  const totalInstruments = instruments.length;

  const verifiedInstruments = instruments.filter(
    (instrument) => instrument.status === 'VERIFIED'
  ).length;

  const pendingApplications = applications.filter(
    (application) =>
      !['APPROVED', 'REJECTED', 'CERTIFICATE_ISSUED'].includes(
        application.status
      )
  ).length;

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutralSlate">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-sm font-semibold text-slate-600">
            Loading your MAAPSETU dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutralSlate p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 max-w-md text-center">

          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />

          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Unable to load dashboard
          </h2>

          <p className="text-sm text-slate-500 mb-5">
            {errorMessage}
          </p>

          <button
            onClick={loadDashboard}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">

      {/* Navy Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-8 px-4 sm:px-6 lg:px-8 shadow-sm">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">

              <Building2 className="w-3.5 h-3.5" />

              <span>
                Owner Portal • ID: {profile?.id}
              </span>

            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Good morning, {profile?.full_name || 'Owner'}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Registered instruments and verification applications
            </p>

          </div>

          <Link
            to="/owner/apply"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all transform active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>+ Apply for Verification</span>
          </Link>
          <Link
  to="/owner/register-instrument"
  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all"
>
  <span>Register Instrument</span>
</Link>


        </div>

      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <MetricCard
            title="Total Instruments"
            value={totalInstruments}
            subtitle="Registered"
            borderColor="blue"
            icon={Layers}
          />

          <MetricCard
            title="Verified"
            value={verifiedInstruments}
            subtitle="Compliant"
            borderColor="green"
            icon={FileCheck2}
          />

          <MetricCard
            title="Expiring Soon"
            value="—"
            subtitle="Certificate data"
            borderColor="amber"
            icon={AlertCircle}
          />

          <MetricCard
            title="Pending Applications"
            value={pendingApplications}
            subtitle="In Review"
            borderColor="purple"
            icon={Clock}
          />

        </div>

        {/* Instruments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">

          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>

              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">

                <Scale className="w-5 h-5 text-emerald-600" />

                <span>Registered Instruments</span>

              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Official weighing and measuring devices under Legal Metrology Act, 2009
              </p>

            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full w-fit">
              Showing {instruments.length} instrument{instruments.length !== 1 ? 's' : ''}
            </span>

          </div>

          <div className="overflow-x-auto">

            {instruments.length === 0 ? (

              <div className="p-10 text-center">

                <Scale className="w-10 h-10 text-slate-300 mx-auto mb-3" />

                <p className="text-sm font-semibold text-slate-600">
                  No instruments registered yet
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Your registered instruments will appear here.
                </p>

              </div>

            ) : (

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">

                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Model & Capacity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">

                  {instruments.map((instrument) => (

                    <tr
                      key={instrument.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >

                      <td className="px-6 py-4 font-mono font-bold text-navy-900 text-xs">
                        {instrument.instrument_number}
                      </td>

                      <td className="px-6 py-4 font-medium">

                        <div>
                          {instrument.instrument_type || '—'}
                        </div>

                        <div className="text-xs text-slate-400">
                          Mfg: {instrument.manufacturer || '—'}
                        </div>

                      </td>

                      <td className="px-6 py-4 text-xs">

                        <span className="font-semibold text-slate-800">
                          {instrument.model || '—'}
                        </span>

                        <span className="text-slate-400">
                          {' • '}
                          {instrument.capacity ?? '—'} {instrument.capacity_unit || ''}
                          {' (Class '}
                          {instrument.accuracy_class || '—'}
                          {')'}
                        </span>

                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={instrument.status} />
                      </td>

                      <td className="px-6 py-4 text-right">

                        <button
                          onClick={() =>
                            navigate(`/owner/instrument/${instrument.id}`)
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold transition-all shadow-sm"
                        >

                          <Eye className="w-3.5 h-3.5" />

                          <span>View Details</span>

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

        {/* Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">

                <Clock className="w-5 h-5 text-purple-600" />

                <span>Verification Applications</span>

              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Track the status of verification applications filed with the department
              </p>

            </div>

            <Link
              to="/owner/apply"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>+ New Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

          </div>

          <div className="overflow-x-auto">

            {applications.length === 0 ? (

              <div className="p-10 text-center">

                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />

                <p className="text-sm font-semibold text-slate-600">
                  No applications yet
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Your verification applications will appear here.
                </p>

              </div>

            ) : (

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">

                  <tr>
                    <th className="px-6 py-4">Application ID</th>
                    <th className="px-6 py-4">Instrument ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Preferred Date</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">

                  {applications.map((application) => (

                    <tr
                      key={application.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >

                      <td className="px-6 py-4 font-mono font-bold text-navy-900 text-xs">
                        {application.application_number}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {application.instruments?.instrument_number || '—'}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium">
                        {application.verification_type || '—'}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        {formatDate(application.preferred_date)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={application.status} />
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}