import React, { useMemo } from "react";

export default function UpcomingMeetsWidget({ meetings = [], limit = 3 }) {
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meetings
      .filter((m) => new Date(m.date || m.startDate) >= today)
      .sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate))
      .slice(0, limit);
  }, [meetings, limit]);

  if (upcoming.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-white/25">
        <span className="material-symbols-outlined text-3xl">event_available</span>
        <p className="text-xs">No upcoming meetings</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {upcoming.map((meet) => {
        const d = new Date(meet.date || meet.startDate);
        const day = d.getDate();
        const month = d.toLocaleDateString("en-US", { month: "short" });
        const time = meet.time
          ? meet.time
          : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        return (
          <div key={meet._id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
            {/* Date bubble */}
            <div className="shrink-0 w-11 h-11 rounded-xl bg-[#f183ff]/8 border border-[#f183ff]/15 flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-[#f183ff] uppercase leading-none tracking-wider">
                {month}
              </span>
              <span className="text-base font-headline font-bold text-white leading-tight">{day}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{meet.title}</p>
              <p className="text-[11px] text-white/40 mt-0.5 truncate">
                {time}
                {meet.teamScope ? ` · ${meet.teamScope}` : ""}
              </p>
            </div>

            {/* Join link */}
            {(meet.meetlink || meet.link) && (
              <a
                href={meet.meetlink || meet.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#81ecff] hover:border-[#81ecff]/30 transition-all"
                title="Join meeting"
              >
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
