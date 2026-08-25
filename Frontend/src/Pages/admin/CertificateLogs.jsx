import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Navbar from "../../components/common/layout/Navbar";
import { API_BASE_URL, clearSession } from "../../api/session";

// Delivery log for certificate batches.
//
// Mail is sent over SMTP in bulk, which fails in ways nobody notices until a
// recipient complains weeks later. This page is the answer to "did it actually
// go out?" — per batch and per recipient, with the raw SMTP error and a way to
// put the failures back in the queue.

const STATUS_STYLES = {
  sent: "bg-emerald-500/10 border-emerald-400/25 text-emerald-300",
  queued: "bg-sky-500/10 border-sky-400/25 text-sky-300",
  sending: "bg-sky-500/10 border-sky-400/25 text-sky-300",
  failed: "bg-amber-500/10 border-amber-400/25 text-amber-300",
  dead: "bg-red-500/10 border-red-400/25 text-red-300",
  not_queued: "bg-white/5 border-white/15 text-white/50",
};

const STATUS_LABELS = {
  sent: "Accepted",
  queued: "Queued",
  sending: "Sending",
  failed: "Retrying",
  dead: "Failed",
  not_queued: "Not emailed",
};

const StatusChip = ({ status }) => (
  <span
    className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
      STATUS_STYLES[status] || STATUS_STYLES.not_queued
    }`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// How long the admin still has before the spooled attachment is deleted and
// resend stops being possible. Worth showing prominently — it's a deadline.
const retryWindowLeft = (until) => {
  if (!until) return null;
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / 3600000);
  if (hours >= 1) return `${hours}h left`;
  return `${Math.max(Math.floor(ms / 60000), 1)}m left`;
};

export default function CertificateLogs() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openBatch, setOpenBatch] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState(null);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    } finally {
      clearSession();
      window.location.href = "/login";
    }
  };

  const loadBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/certificate/batches`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load certificate log");
      setBatches(data.batches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (batchId) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/certificate/batch/${batchId}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load batch");
      setDetail(data);
    } catch (err) {
      setToast({ type: "error", message: err.message });
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const toggleBatch = (batchId) => {
    if (openBatch === batchId) {
      setOpenBatch(null);
      setDetail(null);
      return;
    }
    setOpenBatch(batchId);
    setDetail(null);
    loadDetail(batchId);
  };

  const handleResend = async (batchId, credentialIds = null) => {
    setResending(true);
    setToast(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/certificate/batch/${batchId}/resend`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentialIds ? { credentialIds } : {}),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Resend failed");

      if (data.requeued === 0) {
        setToast({ type: "info", message: data.message || "Nothing to resend." });
      } else {
        const parts = [`${data.sent} accepted`];
        if (data.stillPending) parts.push(`${data.stillPending} still queued`);
        if (data.dead?.length) parts.push(`${data.dead.length} permanently failed`);
        if (data.missingAttachment?.length) {
          parts.push(
            `${data.missingAttachment.length} past the retry window — regenerate those`,
          );
        }
        setToast({ type: "success", message: parts.join(" · ") });
      }

      await loadDetail(batchId);
      await loadBatches();
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setResending(false);
    }
  };

  const downloadFailedCsv = () => {
    if (!detail) return;
    const failed = detail.rows.filter((r) =>
      ["failed", "dead", "not_queued"].includes(r.mail.status),
    );
    const csv = [
      "name,email,teamCode,credentialId,status,error",
      ...failed.map((r) =>
        [
          r.name,
          r.email,
          r.teamCode,
          r.credentialId,
          r.mail.status,
          `"${(r.mail.lastError || "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `failed_${detail.batchId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unresolvedCount = (mail) => (mail?.failed || 0) + (mail?.dead || 0);

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] font-body flex flex-col">
      <Navbar />
      <AdminSidebar onLogout={handleLogout} />
      <div className="max-w-7xl w-full mx-auto px-5 pb-16 pt-8 md:px-8 lg:pl-28">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f183ff] to-[#ff6c95]">
              Certificate Log
            </h1>
            <p className="mt-1 text-sm text-[#aea9b6]">
              Every batch issued, and whether the mail actually went out.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadBatches}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Refresh
            </button>
            <Link
              to="/dashboard/certificates"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] px-4 py-2.5 text-sm font-bold text-white"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New Batch
            </Link>
          </div>
        </div>

        {toast && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              toast.type === "error"
                ? "border-red-400/25 bg-red-500/10 text-red-200"
                : toast.type === "success"
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                  : "border-sky-400/25 bg-sky-500/10 text-sky-200"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toast.type === "error" ? "error" : toast.type === "success" ? "check_circle" : "info"}
            </span>
            <p className="flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="text-white/40 hover:text-white">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#f183ff]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <span className="material-symbols-outlined mb-3 block text-4xl text-[#78737f]">
              license
            </span>
            <p className="text-[#aea9b6]">No certificates have been issued yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((b) => {
              const unresolved = unresolvedCount(b.mail);
              const isOpen = openBatch === b.batchId;

              return (
                <div
                  key={b.batchId}
                  className="overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))]"
                >
                  <button
                    onClick={() => toggleBatch(b.batchId)}
                    className="flex w-full flex-wrap items-center gap-4 p-5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="min-w-[200px] flex-1">
                      <h3 className="font-headline text-lg font-bold text-white">
                        {b.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#78737f]">
                        {fmtDate(b.issuedAt)} · {b.total} certificate
                        {b.total === 1 ? "" : "s"} ·{" "}
                        <span className="uppercase tracking-wide">{b.type}</span>
                      </p>
                      {b.teamCodes?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {b.teamCodes.slice(0, 6).map((tc) => (
                            <span
                              key={tc}
                              className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/60"
                            >
                              {tc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold text-emerald-300">{b.mail.sent}</p>
                        <p className="text-[10px] uppercase tracking-wider text-[#78737f]">
                          Accepted
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-xl font-bold ${
                            unresolved > 0 ? "text-red-300" : "text-white/30"
                          }`}
                        >
                          {unresolved}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-[#78737f]">
                          Failed
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-xl font-bold ${
                            b.mail.queued + b.mail.sending > 0
                              ? "text-sky-300"
                              : "text-white/30"
                          }`}
                        >
                          {b.mail.queued + b.mail.sending}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-[#78737f]">
                          Queued
                        </p>
                      </div>
                    </div>

                    <span
                      className={`material-symbols-outlined text-white/40 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/10 bg-[#070910]/60 p-5">
                      {detailLoading ? (
                        <div className="flex h-24 items-center justify-center">
                          <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-t-2 border-[#f183ff]" />
                        </div>
                      ) : !detail ? (
                        <p className="text-center text-sm text-[#78737f]">
                          Could not load this batch.
                        </p>
                      ) : (
                        <>
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-[#78737f]">
                              Issued by {detail.issuedByName} · Failed mail can be
                              resent for {detail.retryWindowHours}h after sending;
                              after that the certificate must be regenerated.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={downloadFailedCsv}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10"
                              >
                                Export failures (CSV)
                              </button>
                              <button
                                onClick={() => handleResend(detail.batchId)}
                                disabled={resending || unresolvedCount(detail.summary) === 0}
                                className="rounded-lg bg-gradient-to-r from-[#f183ff] to-[#ff6c95] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                              >
                                {resending ? "Resending…" : "Resend all failed"}
                              </button>
                            </div>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full min-w-[720px] text-left text-sm">
                              <thead>
                                <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-wider text-[#78737f]">
                                  <th className="px-3 py-2.5 font-semibold">Recipient</th>
                                  <th className="px-3 py-2.5 font-semibold">Team</th>
                                  <th className="px-3 py-2.5 font-semibold">Credential ID</th>
                                  <th className="px-3 py-2.5 font-semibold">Mail</th>
                                  <th className="px-3 py-2.5 font-semibold">Detail</th>
                                  <th className="px-3 py-2.5" />
                                </tr>
                              </thead>
                              <tbody>
                                {detail.rows.map((r) => {
                                  const canResend = ["failed", "dead"].includes(
                                    r.mail.status,
                                  );
                                  const left = retryWindowLeft(r.mail.retryableUntil);

                                  return (
                                    <tr
                                      key={r.credentialId}
                                      className="border-b border-white/5 last:border-b-0"
                                    >
                                      <td className="px-3 py-2.5">
                                        <p className="font-semibold text-white/90">
                                          {r.name}
                                        </p>
                                        <p className="text-[11px] text-[#78737f]">
                                          {r.email}
                                        </p>
                                      </td>
                                      <td className="px-3 py-2.5">
                                        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/60">
                                          {r.teamCode}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2.5">
                                        <span className="font-mono text-[11px] text-[#f183ff]">
                                          {r.credentialId}
                                        </span>
                                        {r.revoked && (
                                          <span className="ml-2 text-[10px] font-bold uppercase text-red-400">
                                            revoked
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2.5">
                                        <StatusChip status={r.mail.status} />
                                        {r.mail.attempts > 1 && (
                                          <span className="ml-2 text-[10px] text-[#78737f]">
                                            {r.mail.attempts} tries
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2.5">
                                        {r.mail.status === "sent" ? (
                                          <span className="text-[11px] text-[#78737f]">
                                            {fmtDate(r.mail.sentAt)}
                                          </span>
                                        ) : r.mail.lastError ? (
                                          <span
                                            className="block max-w-[260px] truncate text-[11px] text-red-300/80"
                                            title={r.mail.lastError}
                                          >
                                            {r.mail.lastError}
                                          </span>
                                        ) : (
                                          <span className="text-[11px] text-[#78737f]">—</span>
                                        )}
                                        {canResend && left && (
                                          <span
                                            className={`mt-0.5 block text-[10px] ${
                                              left === "expired"
                                                ? "text-red-400"
                                                : "text-amber-300/70"
                                            }`}
                                          >
                                            {left === "expired"
                                              ? "retry window expired — regenerate"
                                              : `retryable · ${left}`}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2.5 text-right">
                                        {canResend && left !== "expired" && (
                                          <button
                                            onClick={() =>
                                              handleResend(detail.batchId, [r.credentialId])
                                            }
                                            disabled={resending}
                                            className="rounded-lg border border-[#f183ff]/30 bg-[#f183ff]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#f183ff] transition-colors hover:bg-[#f183ff]/20 disabled:opacity-40"
                                          >
                                            Resend
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <p className="mt-3 text-[11px] text-[#78737f]">
                            &ldquo;Accepted&rdquo; means the mail server took the
                            message — it is not proof it reached the inbox. SMTP
                            gives us no delivery receipt.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
