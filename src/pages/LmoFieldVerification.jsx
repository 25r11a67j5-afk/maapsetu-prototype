import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import StatusBadge from '../components/StatusBadge';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  HardHat, 
  UploadCloud, 
  Sparkles
} from 'lucide-react';

export default function LmoFieldVerification() {
  const navigate = useNavigate();
  const { 
    instrument, 
    completeVerification,
    fieldVerification,
    setFieldVerificationScanned,
    capturePhoto,
    toggleInspectionCheck
  } = useAppStore();

  const [step, setStep] = useState(1);
  const [scanningAnimation, setScanningAnimation] = useState(false);
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);

  // Evidence Photos Data Configuration
  const evidenceTypes = [
    { key: 'instrument', title: 'Instrument Photograph', desc: 'Overall perspective view of weighing platform' },
    { key: 'serial', title: 'Serial Number Photograph', desc: 'Legible close-up of manufacturer nameplate' },
    { key: 'display', title: 'Display Photograph', desc: 'Zero reading digital indicator check' },
    { key: 'mark', title: 'Verification Mark', desc: 'Lead / wire physical tamper security seal' }
  ];

  // Step 1: Simulate Scan
  const handleSimulateScan = () => {
    setScanningAnimation(true);
    setTimeout(() => {
      setScanningAnimation(false);
      setFieldVerificationScanned(true);
    }, 900);
  };

  // Step 2: Upload all photos shortcut for quick demo
  const handleUploadAllPhotos = () => {
    evidenceTypes.forEach(e => capturePhoto(e.key));
  };

  const allPhotosCaptured = evidenceTypes.every(e => fieldVerification.photos[e.key]);

  // Step 4: Complete Verification Action
  const handleFinalizeVerification = () => {
    if (!confirmedAccuracy) return;
    completeVerification();
    navigate('/lmo/success');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-20">
      {/* Mobile-Friendly Header with Step Indicator */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-5 px-4 sm:px-6 shadow-sm sticky top-16 z-40">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <HardHat className="w-4 h-4" />
              <span>LMO Officer Portal (LMO-027)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Field Verification
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">
              Step Progress
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {step} / 4
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-xl mx-auto mt-3 h-1.5 bg-navy-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-6">
        {/* ========================================================================= */}
        {/* STEP 1: Scan & Identify */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Step 1 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-0.5">
                Scan Instrument QR
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Scan the physical QR code stamped on the measuring instrument
              </p>
            </div>

            {/* Scan Simulation Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center flex flex-col items-center">
              {!fieldVerification.scanned ? (
                <>
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-slate-900 flex flex-col items-center justify-center p-6 border-4 border-dashed border-emerald-500/60 relative overflow-hidden mb-6 group">
                    <QrCode className="w-20 h-20 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    {scanningAnimation && (
                      <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce top-1/2" />
                    )}
                    <span className="text-[11px] text-slate-400 mt-3 font-mono">
                      {scanningAnimation ? "Reading QR Data..." : "Align with Instrument Tag"}
                    </span>
                  </div>

                  {/* Prominent Scan Button */}
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={scanningAnimation}
                    className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-3 transition-all transform active:scale-98"
                  >
                    <QrCode className="w-6 h-6" />
                    <span>📱 Scan QR Code</span>
                  </button>
                </>
              ) : (
                <div className="w-full space-y-5 animate-in fade-in zoom-in duration-200">
                  {/* Success Message: ✓ INSTRUMENT FOUND (green) */}
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-center gap-2.5 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span className="text-lg font-black tracking-wide">
                      ✓ INSTRUMENT FOUND
                    </span>
                  </div>

                  {/* Instrument Details */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left text-xs space-y-2.5">
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Instrument Name:</span>
                      <span className="font-bold text-navy-900 text-right">{instrument.type}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Instrument ID:</span>
                      <span className="font-mono font-bold text-navy-900">{instrument.id}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Serial Number:</span>
                      <span className="font-mono font-bold text-navy-900">{instrument.serial}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Registered Owner:</span>
                      <span className="font-bold text-navy-900">{instrument.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacity & Class:</span>
                      <span className="font-bold text-navy-900">{instrument.capacity} • Class {instrument.accuracyClass}</span>
                    </div>
                  </div>

                  {/* Confirm Identity Button (Green) */}
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                  >
                    <span>Confirm Identity</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Capture Evidence */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Step 2 of 4
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-0.5">
                  Capture Evidence Photos
                </h2>
                <p className="text-xs text-slate-500">
                  Mandatory photographic evidence with tamper-proof timestamps
                </p>
              </div>

              {/* Quick upload all for demo convenience */}
              {!allPhotosCaptured && (
                <button
                  onClick={handleUploadAllPhotos}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  title="Auto-fill for fast demo"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Auto-Capture All</span>
                </button>
              )}
            </div>

            {/* Four Evidence Cards (Vertical Stack, Mobile-Optimized) */}
            <div className="space-y-3.5">
              {evidenceTypes.map((evidence) => {
                const isCaptured = fieldVerification.photos[evidence.key];
                const timestamp = fieldVerification.timestamps[evidence.key] || "08 Sep 2026, 14:32 IST";

                return (
                  <div
                    key={evidence.key}
                    className={`p-5 rounded-2xl border-2 transition-all ${
                      isCaptured
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isCaptured ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-navy-900">{evidence.title}</h3>
                          <p className="text-[11px] text-slate-500 leading-tight">{evidence.desc}</p>
                        </div>
                      </div>

                      {isCaptured && (
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {isCaptured ? (
                      <div className="bg-emerald-100/70 text-emerald-800 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>✓ Captured on {timestamp}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => capturePhoto(evidence.key)}
                        className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <UploadCloud className="w-4 h-4 text-emerald-400" />
                        <span>Upload Image</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
              >
                Back
              </button>

              {allPhotosCaptured && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 animate-in fade-in"
                >
                  <span>Next: Test Measurements</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Verification Measurements */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Step 3 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-0.5">
                Test Measurements
              </h2>
              <p className="text-xs text-slate-500">
                Calibrated standard weights verification against legal tolerances
              </p>
            </div>

            {/* Mobile Scrollable Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Calibrated Load Tolerance Matrix
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Test Load</th>
                      <th className="px-4 py-3">Observed Value</th>
                      <th className="px-4 py-3">Tolerance</th>
                      <th className="px-4 py-3 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {fieldVerification.measurements.map((row) => (
                      <tr key={row.load} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-bold text-navy-900">{row.load}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{row.observed}</td>
                        <td className="px-4 py-3 text-slate-500">{row.tolerance}</td>
                        <td className="px-4 py-3 text-right font-sans">
                          <StatusBadge status={row.result} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inspection Checks Section Below Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                Inspection Checks
              </h3>

              <div className="space-y-3">
                {[
                  { key: 'condition', label: 'Instrument Condition' },
                  { key: 'display', label: 'Display Function' },
                  { key: 'seal', label: 'Seal Condition' },
                ].map((item) => {
                  const currentVal = fieldVerification.inspectionChecks[item.key];
                  return (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <span className="text-xs font-semibold text-navy-900">{item.label}</span>
                      <div className="flex items-center gap-1.5">
                        {['PASS', 'FAIL', 'N/A'].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleInspectionCheck(item.key, v)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                              currentVal === v
                                ? v === 'PASS'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : v === 'FAIL'
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-slate-700 text-white border-slate-700'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <span>Next: Final Sign-off</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Complete Verification */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Step 4 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-0.5">
                Verification Summary
              </h2>
              <p className="text-xs text-slate-500">
                Final statutory sign-off and digital certificate generation
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Verification Evaluation
                </span>
                <h3 className="text-3xl font-black text-navy-900 mt-2 flex items-center justify-center gap-2 text-emerald-600">
                  ✓ PASS
                </h3>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Instrument:</span>
                  <span className="font-mono font-bold text-navy-900">{instrument.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Officer:</span>
                  <span className="font-bold text-navy-900">LMO-027 (Rajesh Sharma)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspection Standard:</span>
                  <span className="font-medium text-slate-700">Legal Metrology General Rules (2011)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tolerance Deviation:</span>
                  <span className="font-bold text-emerald-600">0.01% (Within Limits)</span>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-3 text-left p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedAccuracy}
                  onChange={(e) => setConfirmedAccuracy(e.target.checked)}
                  className="mt-0.5 w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  I confirm that the recorded information is accurate and the instrument complies with statutory verification rules.
                </span>
              </label>

              {/* COMPLETE VERIFICATION Button (Green, Large, Mobile-Friendly) */}
              <button
                type="button"
                onClick={handleFinalizeVerification}
                disabled={!confirmedAccuracy}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all shadow-lg flex items-center justify-center gap-2 ${
                  confirmedAccuracy
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 transform active:scale-98 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>COMPLETE VERIFICATION</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full py-3 px-5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
            >
              Back to Measurements
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
