/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Printer,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Scale,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function CertificateViewer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cert, setCert] = useState(null);
  const [instrument, setInstrument] = useState(null);
  const [owner, setOwner] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCertificate();
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      if (!id) {
        throw new Error('Certificate ID is missing.');
      }

      // Get certificate
      const {
        data: certificateData,
        error: certificateError
      } = await supabase
        .from('certificates')
        .select(`
          id,
          certificate_number,
          instrument_id,
          inspection_id,
          issued_by,
          issued_date,
          valid_until,
          status,
          verification_token
        `)
        .eq('id', id)
        .maybeSingle();

      if (certificateError) {
        throw certificateError;
      }

      if (!certificateData) {
        throw new Error('Certificate not found.');
      }

      setCert(certificateData);

      // Get instrument
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
          owner_id,
          location
        `)
        .eq('id', certificateData.instrument_id)
        .maybeSingle();

      if (instrumentError) {
        throw instrumentError;
      }

      if (instrumentData) {
        setInstrument(instrumentData);

        // Get owner profile
        const {
          data: ownerData,
          error: ownerError
        } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            phone
          `)
          .eq('id', instrumentData.owner_id)
          .maybeSingle();

        if (ownerError) {
          console.error('Owner loading error:', ownerError);
        }

        setOwner(ownerData);
      }

    } catch (error) {
      console.error('Certificate loading error:', error);

      setErrorMessage(
        error.message || 'Unable to load certificate.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutralSlate gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-accentBlue" />
        <p className="text-sm font-semibold text-slate-600">
          Loading certificate...
        </p>
      </div>
    );
  }

  if (errorMessage || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutralSlate px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />

          <h1 className="text-xl font-black text-navy-900">
            Certificate Not Found
          </h1>

          <p className="text-sm text-slate-600 mt-2">
            {errorMessage || 'The requested certificate could not be found.'}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-2.5 rounded-xl bg-navy-900 text-white font-bold text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // IMPORTANT:
  // QR code uses the verification token, not certificate UUID.
  const verificationUrl =
    `${window.location.origin}/verify/${cert.verification_token}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `MAAPSETU Certificate ${cert.certificate_number}`,
          text: 'Verify this MAAPSETU digital certificate',
          url: verificationUrl
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(verificationUrl);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 3000);
      }
    } catch (error) {
      console.log('Share cancelled or unavailable.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">

      {/* Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8 shadow-sm no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h1 className="text-xl sm:text-2xl font-black text-white">
            Certificate Viewer
          </h1>

          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Prototype notice */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 no-print">

          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />

            <span className="text-xs font-bold uppercase tracking-wider">
              DIGITAL CERTIFICATE — SIH 2026 PROTOTYPE
            </span>
          </div>

          <span className="text-[11px] font-semibold text-amber-800 hidden sm:inline">
            MAAPSETU
          </span>

        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 mb-6 no-print">

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}

            <span>
              {copied ? 'Link Copied!' : 'Share'}
            </span>
          </button>

          <Link
            to={`/verify/${cert.verification_token}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Certificate</span>
          </Link>

        </div>

        {/* Certificate */}
        <div className="certificate-card bg-white rounded-3xl shadow-xl border-4 border-slate-300 p-8 sm:p-12 relative overflow-hidden">

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Scale className="w-96 h-96 text-navy-900" />
          </div>

          {/* Header */}
          <div className="text-center pb-8 border-b-2 border-slate-200">

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-900 text-white mb-3 shadow-md">
              <Scale className="w-7 h-7 text-emerald-400" />
            </div>

            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              Government of India • Department of Consumer Affairs
            </p>

            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              Directorate of Legal Metrology
            </p>

            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-wide mt-4 uppercase">
              Digital Verification Certificate
            </h2>

            <p className="text-xs text-slate-500 mt-1 italic">
              MAAPSETU Digital Verification System
            </p>

          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">

            {/* Details */}
            <div className="md:col-span-2">

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
                Instrument & Verification Records
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">

                <Detail
                  label="Certificate Number"
                  value={cert.certificate_number}
                  mono
                />

                <Detail
                  label="Instrument Number"
                  value={instrument?.instrument_number}
                  mono
                />

                <Detail
                  label="Instrument Type"
                  value={instrument?.instrument_type}
                />

                <Detail
                  label="Manufacturer"
                  value={instrument?.manufacturer}
                />

                <Detail
                  label="Model"
                  value={instrument?.model}
                />

                <Detail
                  label="Serial Number"
                  value={instrument?.serial_number}
                  mono
                />

                <Detail
                  label="Capacity"
                  value={
                    instrument?.capacity
                      ? `${instrument.capacity} ${instrument.capacity_unit || ''}`
                      : '—'
                  }
                />

                <Detail
                  label="Accuracy Class"
                  value={instrument?.accuracy_class || '—'}
                />

                <Detail
                  label="Owner"
                  value={owner?.full_name || '—'}
                />

                <Detail
                  label="Location"
                  value={instrument?.location || '—'}
                />

                <Detail
                  label="Issue Date"
                  value={cert.issued_date}
                />

                <Detail
                  label="Valid Until"
                  value={cert.valid_until}
                  green
                />

                <Detail
                  label="Certificate Status"
                  value={cert.status}
                  green={cert.status === 'VALID'}
                />

              </div>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">

              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Scan to Verify
              </span>

              <div className="p-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm inline-block">

                <QRCodeSVG
                  value={verificationUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />

              </div>

              <p className="font-mono text-[10px] text-slate-400 mt-3 break-all max-w-[200px]">
                {verificationUrl}
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-100/70 px-3 py-1 rounded-full">

                <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                <span>
                  Public Verification Enabled
                </span>

              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

            <div>
              <p className="text-slate-400 font-medium">
                Verification Token:
              </p>

              <p className="font-mono text-[10px] text-slate-600 break-all">
                {cert.verification_token}
              </p>
            </div>

            <div className="sm:text-right">

              <p className="font-bold text-navy-900">
                Digitally Certified
              </p>

              <p className="text-slate-500">
                MAAPSETU • Digital Legal Metrology Platform
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
  green = false
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-100">

      <span className="text-slate-500">
        {label}:
      </span>

      <span
        className={`
          text-right
          ${mono ? 'font-mono' : ''}
          ${green ? 'font-black text-emerald-600' : 'font-bold text-navy-900'}
        `}
      >
        {value || '—'}
      </span>

    </div>
  );
}