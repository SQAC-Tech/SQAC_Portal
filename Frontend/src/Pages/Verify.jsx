import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../api/session';

// Public credential verification.
//
// Certificates are records, not files — nothing is stored in a bucket, so this
// page renders the authoritative database entry rather than an image. That is
// the stronger claim anyway: an image proves only that someone made a picture,
// while this page answers "did SQAC actually issue this?" and can say no.

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-xs uppercase tracking-widest text-[#78737f]">
      {label}
    </label>
    {children}
  </div>
);

export default function Verify() {
  const { credentialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/certificate/verify/${encodeURIComponent(credentialId)}`,
        );
        if (!response.ok) {
          throw new Error('No certificate exists with this credential ID.');
        }
        const data = await response.json();
        setCertData(data.certificate);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [credentialId]);

  const revoked = certData?.revoked;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070910] p-6 font-body text-[#f5eefc]">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0c0f1a] p-8 shadow-[0_30px_60px_-15px_rgba(241,131,255,0.06)]">
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-[#f183ff] to-[#ff6c95] bg-clip-text font-headline text-4xl font-bold text-transparent">
            Credential Verification
          </h1>
          <p className="font-label text-sm uppercase tracking-wider text-[#aea9b6]">
            SQAC Authentic Record
          </p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#f183ff]" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <span className="material-symbols-outlined mb-4 block text-5xl text-red-400">
              error
            </span>
            <h2 className="mb-2 text-xl font-bold text-red-400">Verification Failed</h2>
            <p className="text-red-300/80">{error}</p>
            <p className="mt-4 font-mono text-xs text-[#78737f]">{credentialId}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {revoked ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-red-300">
                  <span className="material-symbols-outlined">gpp_bad</span>
                  <span className="font-bold tracking-wide">CERTIFICATE REVOKED</span>
                </div>
                <p className="mt-1 px-4 text-xs text-red-200/70">
                  {certData.revokedReason || 'This certificate is no longer valid.'}
                  {certData.revokedAt && ` · ${fmtDate(certData.revokedAt)}`}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-green-400/20 bg-green-400/10 py-3 text-green-400">
                <span className="material-symbols-outlined">verified</span>
                <span className="font-bold tracking-wide">AUTHENTIC CERTIFICATE</span>
              </div>
            )}

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Field label="Issued To">
                  <p className="font-headline text-2xl font-bold text-white">
                    {certData.issuedToName}
                  </p>
                  {/* Masked by the API — the credential ID travels on a public
                      certificate, so the full address must not be readable by
                      anyone who scans the QR. */}
                  <p className="text-sm text-[#aea9b6]">{certData.issuedToEmail}</p>
                </Field>

                <Field label="Certificate">
                  <p className="text-lg text-white">{certData.title}</p>
                  {certData.description && (
                    <p className="mt-1 text-sm text-[#aea9b6]">{certData.description}</p>
                  )}
                </Field>
              </div>

              <div className="space-y-6">
                <Field label="Record">
                  <div className="mt-2 space-y-2 rounded-xl border border-white/5 bg-[#070910] p-4">
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-[#aea9b6]">Type</span>
                      <span className="text-sm capitalize text-white">{certData.type}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-[#aea9b6]">Team</span>
                      <span className="font-mono text-sm text-white">
                        {certData.teamCode || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-[#aea9b6]">Issued On</span>
                      <span className="text-sm text-white">{fmtDate(certData.issuedAt)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-[#aea9b6]">Issued By</span>
                      <span className="text-sm text-white">{certData.issuedByName}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-white/5 pt-2">
                      <span className="text-sm text-[#aea9b6]">Credential ID</span>
                      <span className="font-mono text-sm text-[#f183ff]">
                        {certData.credentialId}
                      </span>
                    </div>
                  </div>
                </Field>
              </div>
            </div>

            <p className="border-t border-white/5 pt-6 text-center text-xs leading-relaxed text-[#6b6679]">
              This page is generated from SQAC&apos;s certificate register. The
              details above are the issuing record itself, not a copy of the
              printed certificate — if they match the document you were shown, it
              is genuine.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
