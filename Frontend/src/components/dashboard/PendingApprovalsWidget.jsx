import React from "react";
import { Link } from "react-router-dom";

const ROLE_LABELS = {
  secretary:       "Secretary",
  joint_secretary: "Joint Secretary",
  technical_lead:  "Technical Lead",
  project_lead:    "Project Lead",
  corp_lead:       "Corporate Lead",
  domain_lead:     "Domain Lead",
  associate_lead:  "Associate Lead",
  member:          "Member",
};

const ROLE_COLORS = {
  secretary:       "bg-[#f183ff]/10 border-[#f183ff]/25 text-[#f183ff]",
  joint_secretary: "bg-violet-500/10 border-violet-400/25 text-violet-300",
  technical_lead:  "bg-blue-500/10 border-blue-400/25 text-blue-300",
  project_lead:    "bg-cyan-500/10 border-cyan-400/25 text-cyan-300",
  corp_lead:       "bg-amber-500/10 border-amber-400/25 text-amber-300",
  domain_lead:     "bg-emerald-500/10 border-emerald-400/25 text-emerald-300",
  associate_lead:  "bg-orange-500/10 border-orange-400/25 text-orange-300",
  member:          "bg-white/6 border-white/15 text-white/60",
};

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1680355466468-bd0a68b11fa0?q=80&w=100";

export default function PendingApprovalsWidget({
  pending = [],
  limit = 3,
  onApprove,
  onReject,
  loadingId,
}) {
  const list = pending.slice(0, limit);

  if (list.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-white/25">
        <span className="material-symbols-outlined text-3xl">how_to_reg</span>
        <p className="text-xs">No pending approvals</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {list.map((member) => (
        <div
          key={member._id}
          className="p-3.5 rounded-xl border border-white/6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="shrink-0 h-9 w-9 rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <img
                src={member.image || DEFAULT_AVATAR}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{member.name}</p>
              <p className="text-[10px] text-white/40 truncate">{member.email}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${ROLE_COLORS[member.role] || ROLE_COLORS.member}`}>
                  {ROLE_LABELS[member.role] || member.role}
                </span>
                {(member.subDomain || member.coreDomain) && (
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 uppercase tracking-wider">
                    {member.subDomain || member.coreDomain}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex flex-col gap-1.5">
              <button
                onClick={() => onApprove(member._id)}
                disabled={loadingId === member._id}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-400/20 bg-emerald-500/8 text-emerald-300 hover:bg-emerald-500/18 disabled:opacity-40 transition-all"
              >
                <span className="material-symbols-outlined text-[12px]">check</span>
                {loadingId === member._id ? "…" : "Approve"}
              </button>
              <button
                onClick={() => onReject(member._id)}
                disabled={loadingId === member._id}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-red-400/20 bg-red-500/8 text-red-300 hover:bg-red-500/18 disabled:opacity-40 transition-all"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}

      {pending.length > limit && (
        <Link
          to="/admin/approvals"
          className="flex items-center justify-center gap-1 pt-2 text-[11px] text-white/35 hover:text-[#f183ff] font-semibold transition-colors"
        >
          View all {pending.length} applications
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}
