import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldCheck,
  UserCheck,
  Check,
  X,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [lmos, setLmos] = useState([]);

  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedLmo, setSelectedLmo] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedSuccessToast, setAssignedSuccessToast] = useState(null);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ---------------------------------------
  // LOAD APPLICATIONS
  // ---------------------------------------
  const loadApplications = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          application_number,
          verification_type,
          preferred_date,
          status,
          remarks,
          created_at,
          owner_id,
          instrument_id,
          instruments (
            instrument_number,
            instrument_type,
            manufacturer,
            model,
            serial_number,
            location,
            owner_id
          ),
          profiles:owner_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setApplications(data || []);
    } catch (error) {
      console.error('Application loading error:', error);
      setErrorMessage(
        error.message || 'Unable to load applications.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // LOAD LMO OFFICERS
  // ---------------------------------------
const loadLmos = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_authorized_lmos');

    if (error) {
      console.error('LMO loading error:', error);

      setErrorMessage(
        `LMO loading failed: ${error.message}`
      );

      setLmos([]);
      return;
    }

    console.log('Authorized LMOs:', data);

    setLmos(data || []);

  } catch (error) {
    console.error('LMO loading error:', error);

    setErrorMessage(
      `LMO loading failed: ${error.message}`
    );

    setLmos([]);
  }
};
  // ---------------------------------------
  // LOAD DATA WHEN DASHBOARD OPENS
  // ---------------------------------------
  useEffect(() => {
    loadApplications();
    loadLmos();
  }, []);
  // ---------------------------------------
  // OPEN ASSIGN MODAL
  // ---------------------------------------
  const handleOpenAssignModal = (application) => {
    setSelectedApp(application);

    if (lmos.length > 0) {
      setSelectedLmo(lmos[0]);
    } else {
      setSelectedLmo(null);
    }

    setShowAssignModal(true);
  };

  // ---------------------------------------
  // ASSIGN LMO
  // ---------------------------------------
  const handleConfirmAssign = async () => {
    if (!selectedApp || !selectedLmo) {
      return;
    }

    try {
      setAssigning(true);
      setErrorMessage('');

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          'Your admin session has expired. Please sign in again.'
        );
      }

      // Create assignment
      const { error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          application_id: selectedApp.id,
          lmo_id: selectedLmo.id,
          assigned_by: user.id,
          status: 'ASSIGNED'
        });

      if (assignmentError) {
        throw assignmentError;
      }

      // Update application status
      const { error: applicationError } = await supabase
        .from('applications')
        .update({
          status: 'ASSIGNED'
        })
        .eq('id', selectedApp.id);

      if (applicationError) {
        throw applicationError;
      }

      setShowAssignModal(false);

      setAssignedSuccessToast(
        `Officer ${selectedLmo.officer_code} assigned successfully to ${selectedApp.application_number}.`
      );

      setTimeout(() => {
        setAssignedSuccessToast(null);
      }, 4000);

      await loadApplications();

    } catch (error) {
      console.error('Assignment error:', error);

      setErrorMessage(
        error.message || 'Unable to assign officer.'
      );
    } finally {
      setAssigning(false);
    }
  };

  // ---------------------------------------
  // GET STATUS LABEL
  // ---------------------------------------
  const getStatus = (status) => {
    if (status === 'SUBMITTED') return 'PENDING';
    return status;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">

      {/* HEADER */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />

              <span>
                Department Administration Console
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Applications Management
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Review applications and assign authorized Legal Metrology Officers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-navy-800 text-slate-300 border border-navy-700 px-3 py-1.5 rounded-lg">
              Live Database
            </span>

            <button
              onClick={() => {
                loadApplications();
                loadLmos();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">

        {/* SUCCESS */}
        {assignedSuccessToast && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />

            <span className="text-sm font-semibold">
              {assignedSuccessToast}
            </span>
          </div>
        )}

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* APPLICATION CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>
              <h2 className="text-lg font-bold text-navy-900">
                Active Verification Requests
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Review incoming verification applications and dispatch qualified officers
              </p>
            </div>

            <div className="flex items-center gap-2">

              <span className="text-xs font-semibold text-slate-500">
                {applications.length} Total Applications
              </span>

            </div>

          </div>

          {/* LOADING */}
          {loading && (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading applications from Supabase...
            </div>
          )}

          {/* EMPTY */}
          {!loading && applications.length === 0 && (
            <div className="p-10 text-center">

              <div className="text-slate-400 text-sm">
                No verification applications found.
              </div>

              <p className="text-xs text-slate-400 mt-1">
                Applications submitted by owners will appear here.
              </p>

            </div>
          )}

          {/* TABLE */}
          {!loading && applications.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">

                  <tr>
                    <th className="px-6 py-4">
                      Application
                    </th>

                    <th className="px-6 py-4">
                      Instrument
                    </th>

                    <th className="px-6 py-4">
                      Owner
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">

                  {applications.map((app) => (

                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >

                      {/* APPLICATION */}
                      <td className="px-6 py-4">

                        <div className="font-mono font-bold text-navy-900 text-xs">
                          {app.application_number}
                        </div>

                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Type: {app.verification_type}
                        </div>

                        {app.preferred_date && (
                          <div className="text-[11px] text-slate-400">
                            Preferred: {app.preferred_date}
                          </div>
                        )}

                      </td>

                      {/* INSTRUMENT */}
                      <td className="px-6 py-4">

                        <div className="font-mono text-xs font-bold text-slate-800">
                          {app.instruments?.instrument_number || '—'}
                        </div>

                        <div className="text-[11px] text-slate-500">
                          {app.instruments?.instrument_type || '—'}
                        </div>

                        <div className="text-[11px] text-slate-400">
                          {app.instruments?.manufacturer || ''}
                        </div>

                      </td>

                      {/* OWNER */}
                      <td className="px-6 py-4 text-xs">

                        <div className="font-semibold text-navy-900">
                          {app.profiles?.full_name || 'Unknown Owner'}
                        </div>

                        <div className="text-slate-400">
                          {app.profiles?.email || ''}
                        </div>

                        <div className="text-slate-400">
                          {app.instruments?.location || ''}
                        </div>

                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">

                        <StatusBadge
                          status={getStatus(app.status)}
                        />

                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 text-right">

                        {app.status === 'SUBMITTED' ? (

                          <button
                            onClick={() =>
                              handleOpenAssignModal(app)
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" />

                            <span>
                              Assign
                            </span>

                          </button>

                        ) : (

                          <button
                            onClick={() =>
                              handleOpenAssignModal(app)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-all"
                          >
                            Re-assign
                          </button>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

      {/* ASSIGN MODAL */}
      {showAssignModal && (

        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">

            {/* HEADER */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">

              <div>

                <h3 className="text-lg font-bold text-navy-900">
                  Assign Legal Metrology Officer
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                  Target Application:
                  {' '}

                  <span className="font-mono font-bold text-navy-900">
                    {selectedApp?.application_number}
                  </span>
                </p>

              </div>

              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* NO LMO */}
            {lmos.length === 0 && (

              <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                No authorized LMO officers are currently available.
                Create an LMO profile before assigning this application.
              </div>

            )}

            {/* LMO SELECTOR */}
            {lmos.length > 0 && (

              <div className="mt-5 space-y-4">

                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>

                  <span>
                    Authorized LMO Officers
                  </span>

                </div>

                {/* OFFICER OPTIONS */}
                <div className="space-y-3">

                  {lmos.map((lmo) => (

                    <button
                      key={lmo.id}
                      onClick={() => setSelectedLmo(lmo)}
                      className={`w-full text-left rounded-2xl p-4 border-2 transition-all ${
                        selectedLmo?.id === lmo.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex items-center gap-3">

                          <div className="w-12 h-12 rounded-xl bg-navy-900 text-emerald-400 flex items-center justify-center font-black text-xs">
                            {lmo.officer_code}
                          </div>

                          <div>

                            <h4 className="font-extrabold text-navy-900 text-base">
                              LMO Officer
                            </h4>

                            <p className="text-xs text-slate-500">
                              Officer Code: {lmo.officer_code}
                            </p>

                          </div>

                        </div>

                        {selectedLmo?.id === lmo.id && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            Selected
                          </span>
                        )}

                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-slate-700">

                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          Authorized
                        </div>

                        <div>
                          Specialization:{' '}
                          {Array.isArray(lmo.specialization)
                            ? lmo.specialization.join(', ')
                            : lmo.specialization || 'Not specified'}
                        </div>

                        <div>
                          Jurisdiction:{' '}
                          {lmo.jurisdiction || 'Not specified'}
                        </div>

                      </div>

                    </button>

                  ))}

                </div>

              </div>

            )}

            {/* ACTIONS */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedLmo || assigning}
                onClick={handleConfirmAssign}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all"
              >
                {assigning ? 'Assigning...' : 'Assign Officer'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}