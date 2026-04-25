import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Verify() {
  const { credentialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/certificate/verify/${credentialId}`);
        if (!response.ok) {
          throw new Error('Certificate not found or invalid');
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

  return (
    <div className="min-h-screen bg-[#0f0d16] text-slate-200 flex flex-col items-center justify-center p-6 font-body">
      <div className="max-w-3xl w-full bg-[#1a1625] rounded-3xl p-8 border border-white/10 shadow-[0_30px_60px_-15px_rgba(241,131,255,0.06)]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f183ff] to-[#ff6c95] mb-2">
            Credential Verification
          </h1>
          <p className="text-slate-400 font-label tracking-wider uppercase text-sm">
            SQAC Authentic Record
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f183ff]"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-500/10 rounded-xl border border-red-500/20">
            <span className="material-symbols-outlined text-red-400 text-5xl mb-4 block">error</span>
            <h2 className="text-xl font-bold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-red-300/80">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-2 text-green-400 bg-green-400/10 py-3 rounded-xl border border-green-400/20">
              <span className="material-symbols-outlined">verified</span>
              <span className="font-bold tracking-wide">AUTHENTIC CERTIFICATE</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Issued To</label>
                  <p className="text-2xl font-headline font-bold text-white">{certData.issuedToName}</p>
                  <p className="text-sm text-slate-400">{certData.issuedToEmail}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Certificate</label>
                  <p className="text-lg text-white">{certData.title}</p>
                  <p className="text-sm text-slate-400 mt-1">{certData.description}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Details</label>
                  <div className="bg-[#0f0d16] rounded-xl p-4 border border-white/5 space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Type:</span>
                      <span className="text-white text-sm capitalize">{certData.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Issued On:</span>
                      <span className="text-white text-sm">{new Date(certData.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Credential ID:</span>
                      <span className="text-[#f183ff] text-sm font-mono">{certData.credentialId}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center items-center bg-[#0f0d16] rounded-2xl p-4 border border-white/5">
                <img src={certData.imageUrl} alt="Certificate" className="w-full h-auto rounded-lg shadow-lg border border-white/10" />
                <a href={certData.imageUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-sm text-[#f183ff] hover:text-[#ff6c95] transition-colors">
                  <span className="material-symbols-outlined text-sm">download</span>
                  View Full Image
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
