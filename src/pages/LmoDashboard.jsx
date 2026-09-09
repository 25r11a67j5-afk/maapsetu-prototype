import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  ClipboardCheck,
  MapPin,
  Calendar,
  User,
  LogOut,
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function LmoDashboard() {
  const navigate = useNavigate();

  const [lmo, setLmo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/login');
        return;
      }

      // Load LMO profile
      const { data: lmoData, error: lmoError } = await supabase
        .from('lmos')
        .select(`
          id,
          user_id,
          officer_code,
          specialization,
          jurisdiction,
          authorized
        `)
        .eq('user_id', user.id)
        .single();

      if (lmoError) {
        throw new Error('LMO profile could not be loaded.');
      }

      if (!lmoData.authorized) {
        throw new Error('Your LMO account is not currently authorized.');
      }

      setLmo(lmoData);

      // Load assignments
      const { data: assignmentData, error: assignmentError } =
        await supabase
          .from('assignments')
          .select(`
            id,
            application_id,
            assigned_at,
            status,
            notes,
            applications (
              id,
              application_number,
              verification_type,
              preferred_date,
              status,
              remarks,
              instruments (
                id,
                instrument_number,
                instrument_type,
                manufacturer,
                model,
                serial_number,
                capacity,
                capacity_unit,
                accuracy_class,
                location
              ),
              profiles:owner_id (
                id,
                full_name,
                email,
                phone
              )
            )
          `)
          .eq('lmo_id', lmoData.id)
          .order('assigned_at', { ascending: false });

      if (assignmentError) {
        throw assignmentError;
      }

      setAssignments(assignmentData || []);

    } catch (error) {
      console.error('LMO dashboard error:', error);
      setErrorMessage(
        error.message || 'Unable to load LMO dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAccept = async (assignmentId) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          status: 'ACCEPTED'
        })
        .eq('id', assignmentId);

      if (error) {
        throw error;
      }

      await loadDashboard();

    } catch (error) {
      console.error('Accept assignment error:', error);
      setErrorMessage(
        error.message || 'Unable to accept assignment.'
      );
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ASSIGNED: 'bg-amber-100 text-amber-700',
      ACCEPTED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          styles[status] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {status?.replaceAll('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
          <p className="text-slate-600 font-medium">
            Loading LMO dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                MAAPSETU
              </h1>
              <p className="text-xs text-slate-300">
                Legal Metrology Officer Portal
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* LMO information */}
        {lmo && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-7 h-7 text-emerald-700" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    LMO Officer
                  </h2>

                  <p className="text-sm text-slate-500">
                    Officer Code: {lmo.officer_code}
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap gap-3">

                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
                  Authorized
                </span>

                <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">
                  {lmo.jurisdiction}
                </span>

                <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">
                  {lmo.specialization}
                </span>

              </div>

            </div>

          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {errorMessage}
          </div>
        )}

        {/* Page heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Assigned Applications
            </h2>

            <p className="text-slate-500 mt-1">
              Review and process applications assigned to you.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

        </div>

        {/* Assignments */}
        {assignments.length === 0 ? (

          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

            <ClipboardCheck className="w-12 h-12 mx-auto text-slate-300 mb-4" />

            <h3 className="text-lg font-bold text-slate-800">
              No assignments yet
            </h3>

            <p className="text-slate-500 mt-2">
              Applications assigned by the administrator will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {assignments.map((assignment) => {

              const application = assignment.applications;
              const instrument = application?.instruments;
              const owner = application?.profiles;

              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >

                  {/* Card header */}
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Application
                      </p>

                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {application?.application_number}
                      </h3>
                    </div>

                    <div>
                      {getStatusBadge(assignment.status)}
                    </div>

                  </div>

                  {/* Card body */}
                  <div className="p-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Instrument */}
                      <div>

                        <div className="flex items-center gap-2 mb-3">
                          <Scale className="w-5 h-5 text-emerald-600" />
                          <h4 className="font-bold text-slate-800">
                            Instrument
                          </h4>
                        </div>

                        <div className="space-y-2 text-sm">

                          <p>
                            <span className="text-slate-500">
                              Instrument No:
                            </span>{' '}
                            <strong>
                              {instrument?.instrument_number || '—'}
                            </strong>
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Type:
                            </span>{' '}
                            {instrument?.instrument_type || '—'}
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Manufacturer:
                            </span>{' '}
                            {instrument?.manufacturer || '—'}
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Model:
                            </span>{' '}
                            {instrument?.model || '—'}
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Serial Number:
                            </span>{' '}
                            {instrument?.serial_number || '—'}
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Capacity:
                            </span>{' '}
                            {instrument?.capacity || '—'}{' '}
                            {instrument?.capacity_unit || ''}
                          </p>

                        </div>

                      </div>

                      {/* Owner/application */}
                      <div>

                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-5 h-5 text-emerald-600" />
                          <h4 className="font-bold text-slate-800">
                            Owner & Application
                          </h4>
                        </div>

                        <div className="space-y-2 text-sm">

                          <p>
                            <span className="text-slate-500">
                              Owner:
                            </span>{' '}
                            {owner?.full_name || '—'}
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Email:
                            </span>{' '}
                            {owner?.email || '—'}
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Verification:
                            </span>{' '}
                            {application?.verification_type || '—'}
                          </p>

                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {application?.preferred_date || '—'}
                          </p>

                          <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            {instrument?.location || '—'}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-3">

                      {assignment.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleAccept(assignment.id)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept Assignment
                        </button>
                      )}

                      {assignment.status === 'ACCEPTED' && (
                        <button
                          onClick={() =>
                            navigate(
                              `/lmo/inspection/${assignment.id}`
                            )
                          }
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          Start Inspection
                        </button>
                      )}

                      {assignment.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() =>
                            navigate(
                              `/lmo/inspection/${assignment.id}`
                            )
                          }
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm"
                        >
                          <Clock className="w-4 h-4" />
                          Continue Inspection
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </main>

    </div>
  );
}