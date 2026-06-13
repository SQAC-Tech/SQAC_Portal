import React, { useMemo } from "react";

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const DOMAIN_COLORS = {
  Technical:  { bg: "bg-blue-500/10",   border: "border-blue-400/20",   text: "text-blue-300" },
  Corporate:  { bg: "bg-amber-500/10",  border: "border-amber-400/20",  text: "text-amber-300" },
  Board:      { bg: "bg-[#f183ff]/10",  border: "border-[#f183ff]/20",  text: "text-[#f183ff]" },
  Media:      { bg: "bg-cyan-500/10",   border: "border-cyan-400/20",   text: "text-cyan-300" },
};

export default function RecentNoticesWidget({ notices = [], limit = 3, coreDomain }) {
  const recent = useMemo(() => {
    let list = [...notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (coreDomain && coreDomain !== "All") {
      list = list.filter(
        (n) => !n.domain || n.domain === "Board" || n.domain === coreDomain
      );
    }
    return list.slice(0, limit);
  }, [notices, limit, coreDomain]);

  if (recent.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-white/25">
        <span className="material-symbols-outlined text-3xl">campaign</span>
        <p className="text-xs">No recent notices</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {recent.map((notice) => {
        const dc = DOMAIN_COLORS[notice.domain] || DOMAIN_COLORS.Board;
        return (
          <div
            key={notice._id}
            className="p-3 rounded-xl border border-white/6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className={`shrink-0 h-7 w-7 rounded-lg ${dc.bg} border ${dc.border} flex items-center justify-center mt-0.5`}>
                <span className={`material-symbols-outlined text-[13px] ${dc.text}`}>campaign</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{notice.title}</p>
                <p className="text-[11px] text-white/40 mt-0.5 line-clamp-2 leading-relaxed">
                  {notice.desc}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {notice.domain && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${dc.bg} ${dc.text}`}>
                      {notice.domain}
                    </span>
                  )}
                  <span className="text-[10px] text-white/25">{timeAgo(notice.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
