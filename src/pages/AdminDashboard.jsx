import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
const [certificates, setCertificates] = useState([]);
  const [selectedReviewApp, setSelectedReviewApp] = useState(null);
const [reviewInspection, setReviewInspection] = useState(null);
const [reviewChecks, setReviewChecks] = useState([]);
const [reviewMeasurements, setReviewMeasurements] = useState([]);
const [showReviewModal, setShowReviewModal] = useState(false);
const [reviewLoading, setReviewLoading] = useState(false);
const [reviewActionLoading, setReviewActionLoading] = useState(false);
const [certificateValidUntil, setCertificateValidUntil] = useState('');
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
// LOAD CERTIFICATES
// ---------------------------------------
const loadCertificates = async () => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_number,
        instrument_id,
        inspection_id,
        issued_date,
        valid_until,
        status,
        verification_token
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    setCertificates(data || []);

  } catch (error) {
    console.error('Certificate loading error:', error);

    setErrorMessage(
      error.message || 'Unable to load certificates.'
    );
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
// LOAD INSPECTION FOR ADMIN REVIEW
// ---------------------------------------
const handleOpenReview = async (application) => {
  try {
        setCertificateValidUntil('');

    setSelectedReviewApp(application);
    setShowReviewModal(true);
    setReviewLoading(true);

    setReviewInspection(null);
    setReviewChecks([]);
    setReviewMeasurements([]);

    // Load inspection
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        id,
        application_id,
        lmo_id,
        inspection_date,
        status,
        overall_result,
        remarks,
        created_at
      `)
      .eq('application_id', application.id)
      .single();

    if (inspectionError) {
      throw inspectionError;
    }

    setReviewInspection(inspection);

    // Load inspection checks
    const { data: checks, error: checksError } = await supabase
      .from('inspection_checks')
      .select(`
        id,
        check_type,
        result,
        remarks
      `)
      .eq('inspection_id', inspection.id)
      .order('created_at', { ascending: true });

    if (checksError) {
      throw checksError;
    }

    setReviewChecks(checks || []);

    // Load measurements
    const { data: measurements, error: measurementsError } =
      await supabase
        .from('measurements')
        .select(`
          id,
          load_value,
          observed_value,
          tolerance,
          result
        `)
        .eq('inspection_id', inspection.id)
        .order('created_at', { ascending: true });

    if (measurementsError) {
      throw measurementsError;
    }

    setReviewMeasurements(measurements || []);

  } catch (error) {
    console.error('Inspection review loading error:', error);

    setErrorMessage(
      error.message || 'Unable to load inspection details.'
    );

    setShowReviewModal(false);

  } finally {
    setReviewLoading(false);
  }
};
// ---------------------------------------
// ADMIN APPROVE APPLICATION
// ---------------------------------------
const handleApproveApplication = async () => {
  if (!selectedReviewApp || !reviewInspection) {
    return;
  }

  if (reviewInspection.overall_result !== 'PASS') {
    setErrorMessage(
      'Only inspections with a PASS result can be approved.'
    );
    return;
  }

  try {
    setReviewActionLoading(true);
    setErrorMessage('');

    // Approve application
    const { error: applicationError } = await supabase
      .from('applications')
      .update({
        status: 'APPROVED'
      })
      .eq('id', selectedReviewApp.id);

    if (applicationError) {
      throw applicationError;
    }

    // Mark instrument as verified
    const { error: instrumentError } = await supabase
      .from('instruments')
      .update({
        status: 'VERIFIED'
      })
      .eq('id', selectedReviewApp.instrument_id);

    if (instrumentError) {
      throw instrumentError;
    }

    setShowReviewModal(false);

    setAssignedSuccessToast(
      `${selectedReviewApp.application_number} approved successfully.`
    );

    setTimeout(() => {
      setAssignedSuccessToast(null);
    }, 4000);

    await loadApplications();
await loadCertificates();

  } catch (error) {
    console.error('Approval error:', error);

    setErrorMessage(
      error.message || 'Unable to approve application.'
    );

  } finally {
    setReviewActionLoading(false);
  }
};
// ---------------------------------------
// GENERATE CERTIFICATE
// ---------------------------------------
const handleGenerateCertificate = async () => {
  if (!selectedReviewApp || !reviewInspection) {
    return;
  }

  if (selectedReviewApp.status !== 'APPROVED') {
    setErrorMessage(
      'The application must be approved before generating a certificate.'
    );
    return;
  }

  if (!certificateValidUntil) {
    setErrorMessage(
      'Please select the certificate validity date.'
    );
    return;
  }

  try {
    setReviewActionLoading(true);
    setErrorMessage('');

    // Get current admin user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        'Your admin session has expired. Please sign in again.'
      );
    }

    // Check if certificate already exists
    const {
      data: existingCertificate,
      error: existingError
    } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_number,
        issued_date,
        valid_until,
        status,
        verification_token
      `)
      .eq('inspection_id', reviewInspection.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    // If certificate already exists, do not create another one
    if (existingCertificate) {
      setErrorMessage(
        `Certificate ${existingCertificate.certificate_number} already exists.`
      );

      return;
    }

    // Generate certificate number
    const year = new Date().getFullYear();

    const certificateNumber =
      `CERT-${year}-${Date.now().toString().slice(-8)}`;

    // Generate public verification token
    const verificationToken = crypto.randomUUID();

    // Create certificate
    const {
      data: newCertificate,
      error: certificateError
    } = await supabase
      .from('certificates')
      .insert({
        certificate_number: certificateNumber,
        instrument_id: selectedReviewApp.instrument_id,
        inspection_id: reviewInspection.id,
        issued_by: user.id,
        issued_date: new Date().toISOString().split('T')[0],
        valid_until: certificateValidUntil,
        status: 'VALID',
        verification_token: verificationToken
      })
      .select()
      .single();

    if (certificateError) {
      throw certificateError;
    }

    // Update application status
    const {
      error: applicationError
    } = await supabase
      .from('applications')
      .update({
        status: 'CERTIFICATE_ISSUED'
      })
      .eq('id', selectedReviewApp.id);

    if (applicationError) {
      throw applicationError;
    }

    // Close review modal
    setShowReviewModal(false);

    // Success message
    setAssignedSuccessToast(
      `Certificate ${newCertificate.certificate_number} generated successfully.`
    );

    setTimeout(() => {
      setAssignedSuccessToast(null);
    }, 5000);

    // Reload applications
    await loadApplications();

  } catch (error) {
    console.error(
      'Certificate generation error:',
      error
    );

    setErrorMessage(
      error.message ||
      'Unable to generate certificate.'
    );

  } finally {
    setReviewActionLoading(false);
  }
};

// ---------------------------------------
// ADMIN REJECT APPLICATION
// ---------------------------------------
const handleRejectApplication = async () => {
  if (!selectedReviewApp || !reviewInspection) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to reject application ${selectedReviewApp.application_number}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setReviewActionLoading(true);
    setErrorMessage('');

    const { error: applicationError } = await supabase
      .from('applications')
      .update({
        status: 'REJECTED'
      })
      .eq('id', selectedReviewApp.id);

    if (applicationError) {
      throw applicationError;
    }

    setShowReviewModal(false);

    setAssignedSuccessToast(
      `${selectedReviewApp.application_number} rejected.`
    );

    setTimeout(() => {
      setAssignedSuccessToast(null);
    }, 4000);

    await loadApplications();

  } catch (error) {
    console.error('Rejection error:', error);

    setErrorMessage(
      error.message || 'Unable to reject application.'
    );

  } finally {
    setReviewActionLoading(false);
  }
};
  // ---------------------------------------
  // LOAD DATA WHEN DASHBOARD OPENS
  // ---------------------------------------
  useEffect(() => {
  loadApplications();
  loadLmos();
  loadCertificates();
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
    loadCertificates();
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
      onClick={() => handleOpenAssignModal(app)}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-sm"
    >
      <UserCheck className="w-3.5 h-3.5" />
      <span>Assign</span>
    </button>

  ) : app.status === 'UNDER_REVIEW' ? (

    <button
      onClick={() => handleOpenReview(app)}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>Review</span>
    </button>
) : app.status === 'APPROVED' ? (

  (() => {
    const certificate = certificates.find(
      (cert) => cert.instrument_id === app.instrument_id
    );

    return certificate ? (
      <Link
        to={`/certificate/${certificate.id}`}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>View Certificate</span>
      </Link>
    ) : (
      <button
        onClick={() => handleOpenReview(app)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Generate Certificate</span>
      </button>
    );
  })()

 ) : app.status === 'CERTIFICATE_ISSUED' ? (

  (() => {
    const certificate = certificates.find(
      (cert) => cert.instrument_id === app.instrument_id
    );

    return certificate ? (
      <Link
        to={`/certificate/${certificate.id}`}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        View Certificate
      </Link>
    ) : (
      <span className="text-xs text-amber-600 font-semibold">
        Certificate loading...
      </span>
    );
  })()

  ) : (

    <button
      onClick={() => handleOpenAssignModal(app)}
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
      {/* REVIEW MODAL */}
      {showReviewModal && (

        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">

            {/* HEADER */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-slate-100">

              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  Inspection Review
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Application:
                  {' '}

                  <span className="font-mono font-bold text-navy-900">
                    {selectedReviewApp?.application_number}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* CONTENT */}
            {reviewLoading ? (

              <div className="p-10 text-center text-sm text-slate-500">
                Loading inspection report...
              </div>

            ) : (

              <div className="p-6 space-y-6">

                {/* APPLICATION DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] uppercase font-bold text-slate-400">
                      Instrument
                    </div>

                    <div className="mt-1 font-bold text-navy-900">
                      {selectedReviewApp?.instruments?.instrument_number || '—'}
                    </div>

                    <div className="text-xs text-slate-500">
                      {selectedReviewApp?.instruments?.instrument_type || '—'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] uppercase font-bold text-slate-400">
                      Owner
                    </div>

                    <div className="mt-1 font-bold text-navy-900">
                      {selectedReviewApp?.profiles?.full_name || '—'}
                    </div>

                    <div className="text-xs text-slate-500">
                      {selectedReviewApp?.profiles?.email || '—'}
                    </div>
                  </div>

                </div>

                {/* INSPECTION RESULT */}
                <div className="p-5 rounded-2xl border border-slate-200">

                  <div className="flex items-center justify-between mb-4">

                    <h4 className="font-bold text-navy-900">
                      Inspection Result
                    </h4>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        reviewInspection?.overall_result === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reviewInspection?.overall_result === 'FAIL'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {reviewInspection?.overall_result || 'PENDING'}
                    </span>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                    <div>
                      <span className="text-slate-400">
                        Inspection Date:
                      </span>

                      <span className="ml-2 font-semibold text-slate-700">
                        {reviewInspection?.inspection_date || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400">
                        Status:
                      </span>

                      <span className="ml-2 font-semibold text-slate-700">
                        {reviewInspection?.status || '—'}
                      </span>
                    </div>

                  </div>

                  {reviewInspection?.remarks && (
                    <div className="mt-4">

                      <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">
                        LMO Remarks
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-700">
                        {reviewInspection.remarks}
                      </div>

                    </div>
                  )}

                </div>

                {/* INSPECTION CHECKS */}
                <div>

                  <h4 className="font-bold text-navy-900 mb-3">
                    Inspection Checks
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">

                    {reviewChecks.length === 0 ? (

                      <div className="p-4 text-sm text-slate-400">
                        No inspection checks recorded.
                      </div>

                    ) : (

                      <div className="divide-y divide-slate-100">

                        {reviewChecks.map((check) => (

                          <div
                            key={check.id}
                            className="p-4 flex items-center justify-between gap-4"
                          >

                            <div>
                              <div className="font-semibold text-sm text-slate-800">
                                {check.check_type}
                              </div>

                              {check.remarks && (
                                <div className="text-xs text-slate-400 mt-1">
                                  {check.remarks}
                                </div>
                              )}
                            </div>

                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                check.result === 'PASS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : check.result === 'FAIL'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {check.result}
                            </span>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                </div>

                {/* MEASUREMENTS */}
                <div>

                  <h4 className="font-bold text-navy-900 mb-3">
                    Measurements
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">

                    {reviewMeasurements.length === 0 ? (

                      <div className="p-4 text-sm text-slate-400">
                        No measurements recorded.
                      </div>

                    ) : (

                      <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">

                            <tr>
                              <th className="px-4 py-3 text-left">
                                Load
                              </th>

                              <th className="px-4 py-3 text-left">
                                Observed
                              </th>

                              <th className="px-4 py-3 text-left">
                                Tolerance
                              </th>

                              <th className="px-4 py-3 text-left">
                                Result
                              </th>
                            </tr>

                          </thead>

                          <tbody className="divide-y divide-slate-100">

                            {reviewMeasurements.map((measurement) => (

                              <tr key={measurement.id}>

                                <td className="px-4 py-3">
                                  {measurement.load_value}
                                </td>

                                <td className="px-4 py-3">
                                  {measurement.observed_value}
                                </td>

                                <td className="px-4 py-3">
                                  {measurement.tolerance}
                                </td>

                                <td className="px-4 py-3">

                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                      measurement.result === 'PASS'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : measurement.result === 'FAIL'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {measurement.result}
                                  </span>

                                </td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            )}
            {/* CERTIFICATE VALIDITY */}
<div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50">

  <h4 className="font-bold text-navy-900">
    Certificate Validity
  </h4>

  <p className="text-xs text-slate-500 mt-1">
    Select the date until which the certificate should remain valid.
  </p>

  <div className="mt-4 max-w-xs">

    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
      Valid Until
    </label>

    <input
      type="date"
      value={certificateValidUntil}
      min={new Date().toISOString().split('T')[0]}
      onChange={(e) =>
        setCertificateValidUntil(e.target.value)
      }
      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />

  </div>

</div>

            {/* ACTION FOOTER */}
            {!reviewLoading && reviewInspection && (

              <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Close
                </button>

                <button
  type="button"
  disabled={reviewActionLoading}
  onClick={handleRejectApplication}
  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold"
>
  <X className="w-4 h-4" />

  {reviewActionLoading
    ? 'Processing...'
    : 'Reject Application'}
</button>

                <button
                  type="button"
                  disabled={
                    reviewActionLoading ||
                    reviewInspection.overall_result !== 'PASS'
                  }
                  onClick={handleApproveApplication}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold"
                >
                  <Check className="w-4 h-4" />

                  {reviewActionLoading
                    ? 'Processing...'
                    : 'Approve Application'}
                </button>
                {selectedReviewApp?.status === 'APPROVED' && (
  <button
    type="button"
    disabled={reviewActionLoading}
    onClick={handleGenerateCertificate}
    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold"
  >
    <ShieldCheck className="w-4 h-4" />

    {reviewActionLoading
      ? 'Generating...'
      : 'Generate Certificate'}
  </button>
)}

              </div>
            )}

          </div>

        </div>

      )}
    </div>
  );
}