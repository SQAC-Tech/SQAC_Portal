import React, { useMemo } from "react";
import { Link } from "react-router-dom";

// Recent Activity — surfaces the latest Minutes of Meeting (MOM) records.
// Fed by GET /api/mom/all, which every activated member can read.
export default function ActivityFeedWidget({ moms = [], limit = 4 }) {
  const recent = useMemo(
    () =>
      [...moms]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit),
    [moms, limit]
  );

  if (recent.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-white/25">
        <span className="material-symbols-outlined text-3xl">history_edu</span>
        <p className="text-xs">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {recent.map((mom) => {
        const d = new Date(mom.date);
        const when = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const points = mom.discussedPoints?.length || 0;
        const decisions = mom.decisions?.length || 0;
        const actions = mom.actionItems?.length || 0;

        return (
          <Link
            to="/mom/list"
            key={mom._id}
            className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 group"
          >
            <div className="shrink-0 h-10 w-10 rounded-xl bg-[#81ecff]/8 border border-[#81ecff]/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#81ecff] text-lg">description</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-[#81ecff] transition-colors">
                {mom.title}
              </p>
              <p className="text-[11px] text-white/40 mt-0.5 truncate">
                {when}
                {mom.teamScope ? ` · ${mom.teamScope}` : ""}
                {` · ${points} pts · ${decisions} dec · ${actions} act`}
              </p>
            </div>
            <span className="shrink-0 material-symbols-outlined text-sm text-white/20 group-hover:text-[#81ecff]/60 transition-colors">
              arrow_forward
            </span>
          </Link>
        );
      })}
    </div>
  );
}
