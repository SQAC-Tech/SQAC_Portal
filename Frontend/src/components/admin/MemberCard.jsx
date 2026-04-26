import React from "react";
import {
  buildMailLink,
  DEFAULT_AVATAR,
  formatDate,
  roleLabel,
} from "../../utils/memberHelpers";

const MemberCard = ({
  member,
  index,
  onDelete,
  onEdit,
  onApprove,
  onReject,
  statusUpdating,
}) => {
  const badgeVariant = member.approved
    ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/20"
    : "bg-amber-400/15 text-amber-100 border-amber-300/20";

  return (
    <article
      className="member-id-card group relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.04] p-[1px] shadow-[0_30px_80px_rgba(4,6,20,0.42)]"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.28),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,236,255,0.22),transparent_34%)] opacity-80" />
      <div className="member-id-card__inner relative h-full rounded-[calc(2rem-1px)] border border-white/8 bg-[linear-gradient(155deg,rgba(22,20,31,0.98),rgba(12,11,18,0.92))] p-6">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -left-10 top-8 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-8 bottom-10 h-28 w-28 rounded-full bg-tertiary/15 blur-3xl" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/80">
              SQAC Member ID
            </p>
            <h3 className="mt-3 text-2xl font-bold text-white font-['Space_Grotesk']">
              {member.name}
            </h3>
            <p className="mt-1 text-sm text-white/65">
              {member.position || roleLabel(member)}
            </p>
          </div>

          <div className="member-chip shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
            #{String(index + 1).padStart(2, "0")}
          </div>
        </div>

        <div className="relative mt-6 flex gap-5">
          <div className="member-avatar-shell shrink-0 rounded-[1.6rem] p-1">
            <div className="h-24 w-24 overflow-hidden rounded-[1.3rem] border border-white/10 bg-white/5">
              <img
                alt={member.name}
                className="h-full w-full object-cover"
                src={member.image || DEFAULT_AVATAR}
              />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 text-sm">
            <div className="member-info-block rounded-2xl border border-white/8 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                Reg No
              </p>
              <p className="mt-2 font-semibold text-white/85">
                {member.regNum || "Not set"}
              </p>
            </div>
            <div className="member-info-block rounded-2xl border border-white/8 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                Status
              </p>
              <span
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeVariant}`}
              >
                {member.approved ? "Approved" : "Pending"}
              </span>
            </div>
            <div className="member-info-block col-span-2 rounded-2xl border border-white/8 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                Domain
              </p>
              <p className="mt-2 font-semibold text-white/85">
                {member.coreDomain || "No core domain"}
                {member.subDomain ? ` / ${member.subDomain}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="member-id-bar relative mt-6 rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.03] px-4 py-3">
          <div className="absolute inset-y-0 left-5 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          <div className="flex flex-wrap items-center justify-between gap-3 pl-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                Joined
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                {formatDate(member.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                Contact
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                {member.phoneNumber || member.email || "Unavailable"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/85">
              {member.email || "No email available"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
              {roleLabel(member)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <a
              className="member-action-btn inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/80 transition-all duration-300 hover:-translate-y-1 hover:text-primary"
              href={buildMailLink(member.email)}
              title={`Email ${member.name}`}
            >
              <span className="material-symbols-outlined text-lg">mail</span>
            </a>
            {!member.approved ? (
              <>
                <button
                  className="member-action-btn inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-400/10 px-4 text-sm font-bold text-emerald-100 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400/18 disabled:opacity-60"
                  disabled={statusUpdating}
                  onClick={() => onApprove(member)}
                  type="button"
                >
                  {statusUpdating ? "Updating..." : "Approve"}
                </button>
                <button
                  className="member-action-btn inline-flex h-11 items-center justify-center rounded-2xl border border-red-300/18 bg-red-400/10 px-4 text-sm font-bold text-red-100 transition-all duration-300 hover:-translate-y-1 hover:bg-red-400/18 disabled:opacity-60"
                  disabled={statusUpdating}
                  onClick={() => onReject(member)}
                  type="button"
                >
                  {statusUpdating ? "Updating..." : "Reject"}
                </button>
              </>
            ) : null}
            <button
              className="member-action-btn inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-primary/85 to-secondary/85 px-4 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-1"
              onClick={() => onEdit(member)}
              type="button"
            >
              Edit
            </button>
            <button
              className="member-action-btn inline-flex h-11 items-center justify-center rounded-2xl border border-red-300/18 bg-red-400/10 px-4 text-sm font-bold text-red-100 transition-all duration-300 hover:-translate-y-1 hover:bg-red-400/18"
              onClick={() => onDelete(member)}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MemberCard;
