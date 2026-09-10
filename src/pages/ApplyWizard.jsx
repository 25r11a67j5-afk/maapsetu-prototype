import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Check,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ApplyWizard() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('');

  const [verifyType, setVerifyType] = useState('Re-verification');
  const [preferredDate, setPreferredDate] = useState('');

  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState('');

  useEffect(() => {
    loadInstruments();
  }, []);

const loadInstruments = async () => {
  setLoadingInstruments(true);
  setErrorMessage('');

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      setErrorMessage('Please log in again.');
      return;
    }

    console.log('Application form user:', user.id);

    const { data, error } = await supabase
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
        status,
        created_at
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Instrument loading error:', error);
      throw error;
    }

    console.log('Application form instruments:', data);

    setInstruments(data || []);

    if (data && data.length > 0) {
      setSelectedInstrument(data[0].id);
    } else {
      setSelectedInstrument('');
    }
  } catch (err) {
    console.error('Failed to load instruments:', err);
    setErrorMessage(err.message || 'Unable to load instruments.');
  } finally {
    setLoadingInstruments(false);
  }
};

  const selectedInstrumentData = instruments.find(
    (instrument) => instrument.id === selectedInstrument
  );

  const handleSubmit = async () => {
    if (!selectedInstrument) {
      setErrorMessage('Please select an instrument.');
      return;
    }

    if (!preferredDate) {
      setErrorMessage('Please select a preferred inspection date.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Please sign in again.');
      }

      // Generate a unique application number.
      const applicationNumber =
        `APP-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;

      const { data, error } = await supabase
        .from('applications')
        .insert({
          application_number: applicationNumber,
          instrument_id: selectedInstrument,
          owner_id: user.id,
          verification_type: verifyType,
          preferred_date: preferredDate,
          status: 'SUBMITTED'
        })
        .select('id, application_number')
        .single();

      if (error) {
        throw error;
      }

      setSubmittedAppId(data.application_number);
      setIsSubmitted(true);

    } catch (error) {
      console.error('Application submission error:', error);
      setErrorMessage(
        error.message || 'Unable to submit application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: 'Select Instrument' },
    { number: 2, label: 'Verification Type' },
    { number: 3, label: 'Preferred Date' },
    { number: 4, label: 'Review & Submit' }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">

      {/* Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-3xl mx-auto">

          <button
            onClick={() => navigate('/owner/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Application for Instrument Verification
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Section 24 of Legal Metrology Act, 2009 — Mandatory periodic stamping and verification
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Error */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">

            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />

            <div
              className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
              }}
            />

            {steps.map((s) => {
              const isCompleted = currentStep > s.number;
              const isCurrent = currentStep === s.number;

              return (
                <div
                  key={s.number}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md'
                        : isCurrent
                        ? 'bg-navy-900 text-white ring-4 ring-emerald-500/20 shadow-md'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      s.number
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent
                        ? 'text-navy-900 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">

          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">

              <div>
                <h2 className="text-xl font-bold text-navy-900">
                  Select Instrument
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Choose an instrument from your registered instruments.
                </p>
              </div>

              {loadingInstruments ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Loading your instruments...
                </div>
              ) : instruments.length === 0 ? (
                <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <p className="text-sm font-semibold text-amber-800">
                    No registered instruments found.
                  </p>

                  <p className="text-xs text-amber-700 mt-1">
                    Please register an instrument before applying for verification.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/owner/dashboard')}
                    className="mt-4 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-bold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">

                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select Registered Instrument
                    </label>

                    <select
                      value={selectedInstrument}
                      onChange={(e) => setSelectedInstrument(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {instruments.map((instrument) => (
                        <option
                          key={instrument.id}
                          value={instrument.id}
                        >
                          {instrument.instrument_type} — {instrument.instrument_number}
                        </option>
                      ))}
                    </select>

                  </div>

                  {selectedInstrumentData && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 text-slate-600">

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">
                          Instrument Number:
                        </span>

                        <span className="font-bold text-navy-900">
                          {selectedInstrumentData.instrument_number}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">
                          Type:
                        </span>

                        <span className="font-bold text-navy-900">
                          {selectedInstrumentData.instrument_type}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">
                          Manufacturer & Model:
                        </span>

                        <span className="font-bold text-navy-900 text-right">
                          {selectedInstrumentData.manufacturer}
                          {' '}
                          ({selectedInstrumentData.model})
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">
                          Serial Number:
                        </span>

                        <span className="font-mono font-bold text-navy-900">
                          {selectedInstrumentData.serial_number}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">
                          Capacity:
                        </span>

                        <span className="font-bold text-navy-900">
                          {selectedInstrumentData.capacity}
                          {' '}
                          {selectedInstrumentData.capacity_unit}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 font-medium">
                          Inspection Site:
                        </span>

                        <span className="font-bold text-navy-900 text-right">
                          {selectedInstrumentData.location}
                        </span>
                      </div>

                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-slate-100">

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm rounded-xl transition-all"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">

              <div>
                <h2 className="text-xl font-bold text-navy-900">
                  Verification Type
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Select verification type under statutory rules.
                </p>
              </div>

              <div className="space-y-3">

                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    verifyType === 'Initial Verification'
                      ? 'border-emerald-500 bg-emerald-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >

                  <input
                    type="radio"
                    name="verifyType"
                    value="Initial Verification"
                    checked={verifyType === 'Initial Verification'}
                    onChange={(e) => setVerifyType(e.target.value)}
                    className="mt-1 w-4 h-4 text-emerald-600"
                  />

                  <div>
                    <span className="block font-bold text-navy-900 text-sm">
                      Initial Verification
                    </span>

                    <span className="text-xs text-slate-500">
                      For newly installed, imported, or heavily repaired measuring instruments prior to commercial usage.
                    </span>
                  </div>

                </label>

                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    verifyType === 'Re-verification'
                      ? 'border-emerald-500 bg-emerald-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >

                  <input
                    type="radio"
                    name="verifyType"
                    value="Re-verification"
                    checked={verifyType === 'Re-verification'}
                    onChange={(e) => setVerifyType(e.target.value)}
                    className="mt-1 w-4 h-4 text-emerald-600"
                  />

                  <div>
                    <span className="block font-bold text-navy-900 text-sm">
                      Re-verification (Annual Stamping)
                    </span>

                    <span className="text-xs text-slate-500">
                      Periodic statutory re-verification and seal inspection.
                    </span>
                  </div>

                </label>

              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white font-bold text-sm rounded-xl"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">

              <div>
                <h2 className="text-xl font-bold text-navy-900">
                  Preferred Date
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Choose your preferred verification date.
                </p>
              </div>

              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Verification Date
                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>

                  <input
                    type="date"
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-navy-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />

                </div>

                <p className="text-xs text-slate-400 mt-2">
                  Select a suitable working day for the inspection.
                </p>

              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!preferredDate) {
                      setErrorMessage('Please select a preferred date.');
                      return;
                    }

                    setErrorMessage('');
                    setCurrentStep(4);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white font-bold text-sm rounded-xl"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-6">

              <div>
                <h2 className="text-xl font-bold text-navy-900">
                  Review & Submit
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Review your application before submission.
                </p>
              </div>

              {selectedInstrumentData && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-sm">

                  <div className="flex justify-between pb-3 border-b border-slate-200 gap-4">
                    <span className="text-slate-500 text-xs">
                      Instrument:
                    </span>

                    <span className="font-bold text-navy-900 text-right">
                      {selectedInstrumentData.instrument_number}
                    </span>
                  </div>

                  <div className="flex justify-between pb-3 border-b border-slate-200 gap-4">
                    <span className="text-slate-500 text-xs">
                      Instrument Type:
                    </span>

                    <span className="font-bold text-navy-900">
                      {selectedInstrumentData.instrument_type}
                    </span>
                  </div>

                  <div className="flex justify-between pb-3 border-b border-slate-200 gap-4">
                    <span className="text-slate-500 text-xs">
                      Verification Type:
                    </span>

                    <span className="font-bold text-navy-900">
                      {verifyType}
                    </span>
                  </div>

                  <div className="flex justify-between pb-3 border-b border-slate-200 gap-4">
                    <span className="text-slate-500 text-xs">
                      Preferred Inspection Date:
                    </span>

                    <span className="font-bold text-emerald-600">
                      {preferredDate}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500 text-xs">
                      Premises Location:
                    </span>

                    <span className="font-semibold text-navy-900 text-right">
                      {selectedInstrumentData.location}
                    </span>
                  </div>

                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl"
                  disabled={submitting}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold text-base rounded-xl shadow-lg transition-all"
                >
                  <CheckCircle className="w-5 h-5" />

                  <span>
                    {submitting
                      ? 'Submitting...'
                      : 'Submit Application'}
                  </span>
                </button>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* SUCCESS MODAL */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">

            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <h3 className="text-2xl font-black text-navy-900 mb-1">
              ✓ APPLICATION SUBMITTED
            </h3>

            <p className="text-xs text-slate-500 mb-6">
              Your application has been successfully submitted to the Legal Metrology system.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-3 mb-6">

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Application ID:
                </span>

                <span className="font-mono font-bold text-navy-900">
                  {submittedAppId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">
                  Status:
                </span>

                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  SUBMITTED
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Next Action:
                </span>

                <span className="font-medium text-slate-700">
                  Department Officer Review
                </span>
              </div>

            </div>

            <button
              onClick={() => navigate('/owner/dashboard')}
              className="w-full py-3.5 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm"
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      )}

    </div>
  );
}