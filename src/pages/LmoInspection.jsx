import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ClipboardCheck,
  Loader2,
  Save,
  Scale
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function LmoInspection() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [assignment, setAssignment] = useState(null);
  const [inspection, setInspection] = useState(null);

  const [remarks, setRemarks] = useState('');

  const [checks, setChecks] = useState([
    {
      check_type: 'Instrument condition',
      result: 'PENDING',
      remarks: ''
    },
    {
      check_type: 'Display / indication',
      result: 'PENDING',
      remarks: ''
    },
    {
      check_type: 'Zero setting',
      result: 'PENDING',
      remarks: ''
    },
    {
      check_type: 'Sealing / security',
      result: 'PENDING',
      remarks: ''
    }
  ]);

  const [measurements, setMeasurements] = useState([
    {
      load_value: '',
      observed_value: '',
      tolerance: '',
      result: 'PENDING'
    }
  ]);

  useEffect(() => {
    loadInspection();
  }, [assignmentId]);

  const loadInspection = async () => {
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

      // Get the current LMO
      const { data: lmo, error: lmoError } = await supabase
        .from('lmos')
        .select('id, officer_code, authorized')
        .eq('user_id', user.id)
        .single();

      if (lmoError) {
        throw new Error('LMO profile could not be loaded.');
      }

      if (!lmo.authorized) {
        throw new Error('Your LMO account is not authorized.');
      }

      // Get assignment
      const { data: assignmentData, error: assignmentError } =
        await supabase
          .from('assignments')
          .select(`
            id,
            application_id,
            lmo_id,
            status,
            applications (
              id,
              application_number,
              verification_type,
              preferred_date,
              status,
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
                full_name,
                email,
                phone
              )
            )
          `)
          .eq('id', assignmentId)
          .eq('lmo_id', lmo.id)
          .single();

      if (assignmentError) {
        throw new Error(
          'This assignment could not be found or is not assigned to you.'
        );
      }

      setAssignment(assignmentData);

      // Check whether an inspection already exists
      const { data: existingInspection, error: existingError } =
        await supabase
          .from('inspections')
          .select('*')
          .eq('application_id', assignmentData.application_id)
          .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingInspection) {
        setInspection(existingInspection);
        setRemarks(existingInspection.remarks || '');

        // Load existing checks
        const { data: existingChecks, error: checksError } =
          await supabase
            .from('inspection_checks')
            .select('*')
            .eq('inspection_id', existingInspection.id)
            .order('created_at');

        if (checksError) {
          throw checksError;
        }

        if (existingChecks && existingChecks.length > 0) {
          setChecks(
            existingChecks.map((check) => ({
              id: check.id,
              check_type: check.check_type,
              result: check.result,
              remarks: check.remarks || ''
            }))
          );
        }

        // Load existing measurements
        const { data: existingMeasurements, error: measurementsError } =
          await supabase
            .from('measurements')
            .select('*')
            .eq('inspection_id', existingInspection.id)
            .order('created_at');

        if (measurementsError) {
          throw measurementsError;
        }

        if (
          existingMeasurements &&
          existingMeasurements.length > 0
        ) {
          setMeasurements(
            existingMeasurements.map((measurement) => ({
              id: measurement.id,
              load_value: measurement.load_value ?? '',
              observed_value: measurement.observed_value ?? '',
              tolerance: measurement.tolerance ?? '',
              result: measurement.result || 'PENDING'
            }))
          );
        }
      }

    } catch (error) {
      console.error('Inspection loading error:', error);
      setErrorMessage(
        error.message || 'Unable to load inspection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const startInspection = async () => {
    if (!assignment) return;

    setSaving(true);
    setErrorMessage('');

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data: lmo, error: lmoError } = await supabase
        .from('lmos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (lmoError) {
        throw lmoError;
      }

      // Create inspection
      const { data: inspectionData, error: inspectionError } =
        await supabase
          .from('inspections')
          .insert({
            application_id: assignment.application_id,
            lmo_id: lmo.id,
            inspection_date: new Date()
              .toISOString()
              .split('T')[0],
            status: 'IN_PROGRESS',
            overall_result: 'PENDING',
            remarks: ''
          })
          .select()
          .single();

      if (inspectionError) {
        throw inspectionError;
      }

      setInspection(inspectionData);

      // Update assignment
      const { error: assignmentError } = await supabase
        .from('assignments')
        .update({
          status: 'IN_PROGRESS'
        })
        .eq('id', assignment.id);

      if (assignmentError) {
        throw assignmentError;
      }

      // Update application
      const { error: applicationError } = await supabase
        .from('applications')
        .update({
          status: 'UNDER_INSPECTION'
        })
        .eq('id', assignment.application_id);

      if (applicationError) {
        throw applicationError;
      }

      setAssignment((previous) => ({
        ...previous,
        status: 'IN_PROGRESS'
      }));

    } catch (error) {
      console.error('Start inspection error:', error);
      setErrorMessage(
        error.message || 'Unable to start inspection.'
      );
    } finally {
      setSaving(false);
    }
  };

  const updateCheck = (index, field, value) => {
    setChecks((previous) =>
      previous.map((check, checkIndex) =>
        checkIndex === index
          ? { ...check, [field]: value }
          : check
      )
    );
  };

  const addMeasurement = () => {
    setMeasurements((previous) => [
      ...previous,
      {
        load_value: '',
        observed_value: '',
        tolerance: '',
        result: 'PENDING'
      }
    ]);
  };

  const updateMeasurement = (index, field, value) => {
    setMeasurements((previous) =>
      previous.map((measurement, measurementIndex) =>
        measurementIndex === index
          ? { ...measurement, [field]: value }
          : measurement
      )
    );
  };

  const saveInspection = async () => {
    if (!inspection) {
      setErrorMessage('Start the inspection before saving.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      // Save inspection remarks
      const { error: inspectionError } = await supabase
        .from('inspections')
        .update({
          remarks
        })
        .eq('id', inspection.id);

      if (inspectionError) {
        throw inspectionError;
      }

      // Save checks
      for (const check of checks) {
        if (check.id) {
          const { error } = await supabase
            .from('inspection_checks')
            .update({
              result: check.result,
              remarks: check.remarks
            })
            .eq('id', check.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('inspection_checks')
            .insert({
              inspection_id: inspection.id,
              check_type: check.check_type,
              result: check.result,
              remarks: check.remarks
            });

          if (error) throw error;
        }
      }

      // Save measurements
      for (const measurement of measurements) {
        if (
          measurement.load_value === '' &&
          measurement.observed_value === ''
        ) {
          continue;
        }

        if (measurement.id) {
          const { error } = await supabase
            .from('measurements')
            .update({
              load_value:
                measurement.load_value === ''
                  ? null
                  : Number(measurement.load_value),
              observed_value:
                measurement.observed_value === ''
                  ? null
                  : Number(measurement.observed_value),
              tolerance:
                measurement.tolerance === ''
                  ? null
                  : Number(measurement.tolerance),
              result: measurement.result
            })
            .eq('id', measurement.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('measurements')
            .insert({
              inspection_id: inspection.id,
              load_value: Number(measurement.load_value),
              observed_value: Number(measurement.observed_value),
              tolerance:
                measurement.tolerance === ''
                  ? null
                  : Number(measurement.tolerance),
              result: measurement.result
            });

          if (error) throw error;
        }
      }

      alert('Inspection data saved successfully.');

      await loadInspection();

    } catch (error) {
      console.error('Save inspection error:', error);
      setErrorMessage(
        error.message || 'Unable to save inspection.'
      );
    } finally {
      setSaving(false);
    }
  };

  const completeInspection = async () => {
    if (!inspection) {
      setErrorMessage('Start the inspection first.');
      return;
    }

    const hasFailedCheck = checks.some(
      (check) => check.result === 'FAIL'
    );

    const hasPendingCheck = checks.some(
      (check) => check.result === 'PENDING'
    );

    if (hasPendingCheck) {
      setErrorMessage(
        'Please complete all inspection checks before completing the inspection.'
      );
      return;
    }

    const overallResult = hasFailedCheck ? 'FAIL' : 'PASS';

    setSaving(true);
    setErrorMessage('');

    try {
      // Save all inspection data first
      await saveInspection();

      const { error: inspectionError } = await supabase
        .from('inspections')
        .update({
          status: 'COMPLETED',
          overall_result: overallResult,
          remarks
        })
        .eq('id', inspection.id);

      if (inspectionError) {
        throw inspectionError;
      }

      const { error: assignmentError } = await supabase
        .from('assignments')
        .update({
          status: 'COMPLETED'
        })
        .eq('id', assignment.id);

      if (assignmentError) {
        throw assignmentError;
      }

     const { error: applicationError } = await supabase
  .from('applications')
  .update({
    status: 'UNDER_REVIEW'
  })
  .eq('id', assignment.application_id);

      if (applicationError) {
        throw applicationError;
      }

      alert(
        `Inspection completed successfully: ${overallResult}`
      );

      navigate('/lmo/dashboard');

    } catch (error) {
      console.error('Complete inspection error:', error);
      setErrorMessage(
        error.message || 'Unable to complete inspection.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="mt-3 text-slate-600">
            Loading inspection...
          </p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8">
          <p className="text-red-600 font-semibold">
            {errorMessage || 'Assignment not found.'}
          </p>

          <button
            onClick={() => navigate('/lmo/dashboard')}
            className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const application = assignment.applications;
  const instrument = application?.instruments;
  const owner = application?.profiles;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                MAAPSETU
              </h1>
              <p className="text-xs text-slate-300">
                Inspection Module
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/lmo/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {errorMessage}
          </div>
        )}

        {/* Application information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">

          <div className="flex items-center gap-3 mb-6">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Instrument Inspection
              </h2>

              <p className="text-sm text-slate-500">
                Application: {application?.application_number}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <h3 className="font-bold text-slate-800 mb-3">
                Instrument Details
              </h3>

              <div className="space-y-2 text-sm">

                <p>
                  <span className="text-slate-500">
                    Instrument No:
                  </span>{' '}
                  {instrument?.instrument_number || '—'}
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
                    Serial:
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

            <div>
              <h3 className="font-bold text-slate-800 mb-3">
                Owner Details
              </h3>

              <div className="space-y-2 text-sm">

                <p>
                  <span className="text-slate-500">
                    Name:
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
                    Phone:
                  </span>{' '}
                  {owner?.phone || '—'}
                </p>

                <p>
                  <span className="text-slate-500">
                    Location:
                  </span>{' '}
                  {instrument?.location || '—'}
                </p>

                <p>
                  <span className="text-slate-500">
                    Verification:
                  </span>{' '}
                  {application?.verification_type || '—'}
                </p>

              </div>
            </div>

          </div>

          {/* Start */}
          {!inspection && (
            <div className="mt-6 pt-5 border-t border-slate-100">

              <button
                onClick={startInspection}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ClipboardCheck className="w-5 h-5" />
                )}

                Start Inspection
              </button>

            </div>
          )}

        </div>

        {/* Inspection form */}
        {inspection && (
          <>
            {/* Checks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">

              <h3 className="text-xl font-bold text-slate-900 mb-5">
                Inspection Checks
              </h3>

              <div className="space-y-4">

                {checks.map((check, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-4"
                  >

                    <div className="flex flex-col md:flex-row md:items-center gap-4">

                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          {check.check_type}
                        </p>
                      </div>

                      <select
                        value={check.result}
                        onChange={(e) =>
                          updateCheck(
                            index,
                            'result',
                            e.target.value
                          )
                        }
                        className="border border-slate-300 rounded-lg px-3 py-2"
                      >
                        <option value="PENDING">
                          Pending
                        </option>
                        <option value="PASS">
                          Pass
                        </option>
                        <option value="FAIL">
                          Fail
                        </option>
                        <option value="NA">
                          N/A
                        </option>
                      </select>

                    </div>

                    <input
                      type="text"
                      value={check.remarks}
                      onChange={(e) =>
                        updateCheck(
                          index,
                          'remarks',
                          e.target.value
                        )
                      }
                      placeholder="Remarks for this check"
                      className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />

                  </div>
                ))}

              </div>

            </div>

            {/* Measurements */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">

              <div className="flex items-center justify-between mb-5">

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Measurements
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Record the observed values during verification.
                  </p>
                </div>

                <button
                  onClick={addMeasurement}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold"
                >
                  + Add Measurement
                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-slate-200 text-left">

                      <th className="py-3 pr-4">
                        Load Value
                      </th>

                      <th className="py-3 pr-4">
                        Observed Value
                      </th>

                      <th className="py-3 pr-4">
                        Tolerance
                      </th>

                      <th className="py-3">
                        Result
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {measurements.map(
                      (measurement, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100"
                        >

                          <td className="py-3 pr-4">
                            <input
                              type="number"
                              value={measurement.load_value}
                              onChange={(e) =>
                                updateMeasurement(
                                  index,
                                  'load_value',
                                  e.target.value
                                )
                              }
                              className="w-full min-w-32 border border-slate-300 rounded-lg px-3 py-2"
                              placeholder="Load"
                            />
                          </td>

                          <td className="py-3 pr-4">
                            <input
                              type="number"
                              value={measurement.observed_value}
                              onChange={(e) =>
                                updateMeasurement(
                                  index,
                                  'observed_value',
                                  e.target.value
                                )
                              }
                              className="w-full min-w-32 border border-slate-300 rounded-lg px-3 py-2"
                              placeholder="Observed"
                            />
                          </td>

                          <td className="py-3 pr-4">
                            <input
                              type="number"
                              value={measurement.tolerance}
                              onChange={(e) =>
                                updateMeasurement(
                                  index,
                                  'tolerance',
                                  e.target.value
                                )
                              }
                              className="w-full min-w-32 border border-slate-300 rounded-lg px-3 py-2"
                              placeholder="Tolerance"
                            />
                          </td>

                          <td className="py-3">
                            <select
                              value={measurement.result}
                              onChange={(e) =>
                                updateMeasurement(
                                  index,
                                  'result',
                                  e.target.value
                                )
                              }
                              className="border border-slate-300 rounded-lg px-3 py-2"
                            >
                              <option value="PENDING">
                                Pending
                              </option>

                              <option value="PASS">
                                Pass
                              </option>

                              <option value="FAIL">
                                Fail
                              </option>
                            </select>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* Remarks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">

              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Inspection Remarks
              </h3>

              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={5}
                placeholder="Enter overall inspection remarks..."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 resize-none"
              />

            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">

              <button
                onClick={saveInspection}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}

                Save Inspection
              </button>

              <button
                onClick={completeInspection}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}

                Complete Inspection
              </button>

            </div>
          </>
        )}

      </main>

    </div>
  );
}