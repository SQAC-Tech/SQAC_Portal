import React from "react";
import { DEFAULT_AVATAR, roleLabel } from "../../utils/memberHelpers";

const MemberCard = ({ member, index, onView, onDelete, canDelete = true }) => {
  return (
    <article
      className="member-id-card group relative h-full overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.04] p-[1px] shadow-[0_30px_80px_rgba(4,6,20,0.42)] cursor-pointer"
      style={{ animationDelay: `${index * 90}ms` }}
      onClick={() => onView(member)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.28),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,236,255,0.22),transparent_34%)] opacity-80" />
      <div className="member-id-card__inner relative h-full rounded-[calc(2rem-1px)] border border-white/8 bg-[linear-gradient(155deg,rgba(22,20,31,0.98),rgba(12,11,18,0.92))] p-6 flex flex-col items-center text-center">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -left-10 top-8 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-8 bottom-10 h-28 w-28 rounded-full bg-tertiary/15 blur-3xl" />
        </div>

        {/* Avatar */}
        <div className="member-avatar-shell shrink-0 rounded-[1.3rem] p-0.5 mb-4">
          <div className="h-20 w-20 overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/5 shadow-md">
            <img alt={member.name} className="h-full w-full object-cover" src={member.image || DEFAULT_AVATAR} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 w-full space-y-2 mb-5">
          <h3 className="text-lg font-bold text-white font-headline leading-snug">{member.name}</h3>
          <div className="inline-flex rounded-full border border-white/10 bg-white/4 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#81ecff]">
            {member.position || roleLabel(member)}
          </div>
          <div className="text-xs text-white/70 space-y-1">
            <p className="font-semibold text-white/95 truncate max-w-full">
              {member.coreDomain}{member.subDomain ? ` / ${member.subDomain}` : ""}
            </p>
            <p className="text-white/45 truncate max-w-full font-mono text-[10px]">{member.email}</p>
            {member.regNum && (
              <p className="text-white/35 font-mono text-[10px]">{member.regNum}</p>
            )}
          </div>
        </div>

        {/* Delete only */}
        <div
          className="flex w-full gap-2.5 pt-4 border-t border-white/8 justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={() => onDelete(member)}
            disabled={!canDelete}
            title={!canDelete ? "Only Secretary can delete members" : undefined}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

export default MemberCard;
