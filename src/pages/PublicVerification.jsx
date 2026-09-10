import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const PublicVerification = () => {
  const { certId } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadCertificate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certId]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      if (!certId) {
        throw new Error('Certificate verification token is missing.');
      }

      // Find certificate using the public verification token
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
          issued_date,
          valid_until,
          status,
          verification_token
        `)
        .eq('verification_token', certId)
        .maybeSingle();

      if (certificateError) {
        throw certificateError;
      }

      if (!certificateData) {
        setErrorMessage(
          'Certificate not found or the verification link is invalid.'
        );
        return;
      }

      setCertificate(certificateData);

      // Get instrument details
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
          status
        `)
        .eq('id', certificateData.instrument_id)
        .maybeSingle();

      if (instrumentError) {
        throw instrumentError;
      }

      setInstrument(instrumentData);

    } catch (error) {
      console.error('Certificate verification error:', error);

      setErrorMessage(
        error.message ||
        'Unable to verify the certificate.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    certificate?.status === 'VALID' &&
    certificate?.valid_until &&
    new Date(certificate.valid_until) >= new Date();

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <Loader2 size={40} className="spin" />
        <p>Verifying certificate...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.errorCard}>
          <XCircle size={60} />
          <h1>Certificate Verification Failed</h1>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <ShieldCheck size={48} />
          <h1>MAAPSETU</h1>
          <p>Digital Instrument Verification</p>
        </div>

        <div
          style={{
            ...styles.statusBox,
            ...(isValid
              ? styles.validStatus
              : styles.invalidStatus)
          }}
        >
          {isValid ? (
            <>
              <CheckCircle size={36} />
              <div>
                <strong>CERTIFICATE VALID</strong>
                <span>
                  This certificate is currently valid.
                </span>
              </div>
            </>
          ) : (
            <>
              <XCircle size={36} />
              <div>
                <strong>CERTIFICATE INVALID / EXPIRED</strong>
                <span>
                  This certificate is no longer valid.
                </span>
              </div>
            </>
          )}
        </div>

        <div style={styles.section}>
          <h2>Certificate Details</h2>

          <Detail
            label="Certificate Number"
            value={certificate.certificate_number}
          />

          <Detail
            label="Issue Date"
            value={certificate.issued_date}
          />

          <Detail
            label="Valid Until"
            value={certificate.valid_until}
          />

          <Detail
            label="Certificate Status"
            value={certificate.status}
          />
        </div>

        {instrument && (
          <div style={styles.section}>
            <h2>Instrument Details</h2>

            <Detail
              label="Instrument Number"
              value={instrument.instrument_number}
            />

            <Detail
              label="Instrument Type"
              value={instrument.instrument_type}
            />

            <Detail
              label="Manufacturer"
              value={instrument.manufacturer}
            />

            <Detail
              label="Model"
              value={instrument.model}
            />

            <Detail
              label="Serial Number"
              value={instrument.serial_number}
            />

            <Detail
              label="Capacity"
              value={
                instrument.capacity
                  ? `${instrument.capacity} ${instrument.capacity_unit || ''}`
                  : '—'
              }
            />

            <Detail
              label="Accuracy Class"
              value={instrument.accuracy_class || '—'}
            />

            <Detail
              label="Location"
              value={instrument.location || '—'}
            />
          </div>
        )}

        <div style={styles.footer}>
          <p>
            This certificate was issued through the
            MAAPSETU digital verification system.
          </p>

          <p>
            Verification Token:
            <br />
            <code>{certificate.verification_token}</code>
          </p>
        </div>

      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div style={styles.detailRow}>
    <span>{label}</span>
    <strong>{value || '—'}</strong>
  </div>
);

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f7fb',
    padding: '40px 20px',
    boxSizing: 'border-box'
  },

  centerPage: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f7fb',
    gap: '12px'
  },

  card: {
    maxWidth: '800px',
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
  },

  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },

  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '28px'
  },

  validStatus: {
    background: '#ecfdf5',
    color: '#047857'
  },

  invalidStatus: {
    background: '#fef2f2',
    color: '#b91c1c'
  },

  section: {
    marginBottom: '28px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px'
  },

  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },

  footer: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px'
  },

  errorCard: {
    background: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    textAlign: 'center',
    maxWidth: '500px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
  }
};

export default PublicVerification;