import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../components/common/layout/AppShell";
import { ROLE_LABELS, ROLE_COLORS, isDefaultAvatar } from "../../utils/memberHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Approvals() {
  const navigate = useNavigate();
  const [pending, setPending]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionId, setActionId]         = useState(null);
  const [rejectingId, setRejectingId]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [search, setSearch]             = useState("");
  const [filterRole, setFilterRole]     = useState("all");

  const fetchPending = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pending`, {
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) {
        navigate("/dashboard");
        return;
      }
      const data = await res.json();
      setPending(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/approve/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Member approved");
      setPending((p) => p.filter((m) => m._id !== id));
    } catch {
      toast.error("Failed to approve member");
    } finally {
      setActionId(null);
    }
  };

  const openReject = (id) => { setRejectingId(id); setRejectReason(""); };

  const submitReject = async () => {
    setActionId(rejectingId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reject/${rejectingId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectReason }),
      });
      if (!res.ok) throw new Error();
      toast.success("Application rejected");
      setPending((p) => p.filter((m) => m._id !== rejectingId));
      setRejectingId(null);
    } catch {
      toast.error("Failed to reject member");
    } finally {
      setActionId(null);
    }
  };

  const roleOptions = ["all", ...Object.keys(ROLE_LABELS)];

  const filtered = pending.filter((m) => {
    const matchSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.regNum?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || m.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <AppShell>
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Pending Approvals
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {loading ? "Loading…" : `${pending.length} application${pending.length !== 1 ? "s" : ""} awaiting review`}
            </p>
          </div>
          <button
            onClick={() => fetchPending(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/4 text-white/60 hover:text-white hover:bg-white/8 text-xs font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by name, email, reg no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/4 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/4 text-sm text-white/70 outline-none focus:border-primary/50 transition-colors"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r} className="bg-[#0c0f1a]">
                {r === "all" ? "All Roles" : ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)]">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-3 text-white/25">
              <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
              <p className="text-sm">Loading applications…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-3 text-white/25">
              <span className="material-symbols-outlined text-4xl">how_to_reg</span>
              <p className="text-sm font-semibold">
                {pending.length === 0 ? "No pending applications" : "No results match your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/6 text-[11px] font-bold uppercase tracking-widest text-white/30">
                    <th className="text-left px-5 py-3.5">#</th>
                    <th className="text-left px-5 py-3.5">Applicant</th>
                    <th className="text-left px-5 py-3.5">Reg No.</th>
                    <th className="text-left px-5 py-3.5">Applied Role</th>
                    <th className="text-left px-5 py-3.5">Domain</th>
                    <th className="text-left px-5 py-3.5">Applied On</th>
                    <th className="text-right px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {filtered.map((member, idx) => (
                    <tr
                      key={member._id}
                      className="hover:bg-white/[0.025] transition-colors group"
                    >
                      {/* Index */}
                      <td className="px-5 py-4 text-white/25 text-xs font-mono">
                        {idx + 1}
                      </td>

                      {/* Applicant */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 h-9 w-9 rounded-xl overflow-hidden border border-white/8 bg-white/5">
                            <img
                              src={isDefaultAvatar(member.image) ? "/pwa-192x192.png" : member.image}
                              alt={member.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold truncate">{member.name}</p>
                            <p className="text-white/40 text-[11px] truncate">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Reg No */}
                      <td className="px-5 py-4 text-white/50 text-xs font-mono">
                        {member.regNum || "—"}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${ROLE_COLORS[member.role] || ROLE_COLORS.member}`}>
                          {ROLE_LABELS[member.role] || member.role}
                        </span>
                      </td>

                      {/* Domain */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          {member.coreDomain && (
                            <span className="text-white/60 text-[11px]">{member.coreDomain}</span>
                          )}
                          {member.subDomain && (
                            <span className="text-white/35 text-[10px]">{member.subDomain}</span>
                          )}
                          {!member.coreDomain && !member.subDomain && (
                            <span className="text-white/20 text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-white/35 text-[11px]">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(member._id)}
                            disabled={actionId === member._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-emerald-400/20 bg-emerald-500/8 text-emerald-300 hover:bg-emerald-500/18 disabled:opacity-40 transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            {actionId === member._id ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => openReject(member._id)}
                            disabled={actionId === member._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-red-400/20 bg-red-500/8 text-red-300 hover:bg-red-500/18 disabled:opacity-40 transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-white/20 text-[11px] mt-4">
            Showing {filtered.length} of {pending.length} applications
          </p>
        )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0f1a]/98 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-400 text-lg">report</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Reject Application</h3>
                <p className="text-white/40 text-[11px]">
                  {pending.find((m) => m._id === rejectingId)?.name} — reason is optional
                </p>
              </div>
            </div>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-red-400/40 resize-none transition-colors"
              rows={3}
              placeholder="e.g. Incomplete profile, domain mismatch…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setRejectingId(null)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={!!actionId}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-red-500/15 border border-red-400/25 text-red-300 hover:bg-red-500/25 disabled:opacity-40 transition-all"
              >
                {actionId ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
