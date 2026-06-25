import React from "react";
import { Link } from "react-router-dom";
import { ROLE_LABELS, ROLE_COLORS } from "../../utils/memberHelpers";
import { Avatar } from "../ui";

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
            <Avatar src={member.image} alt={member.name} size={36} />

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
