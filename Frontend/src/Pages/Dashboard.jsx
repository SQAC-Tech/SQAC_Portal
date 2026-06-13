import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/common/layout/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import StatCard from "../components/dashboard/StatCard";
import UpcomingMeetsWidget from "../components/dashboard/UpcomingMeetsWidget";
import RecentNoticesWidget from "../components/dashboard/RecentNoticesWidget";
import QuickActionsWidget from "../components/dashboard/QuickActionsWidget";
import MyProjectsWidget from "../components/dashboard/MyProjectsWidget";
import PendingApprovalsWidget from "../components/dashboard/PendingApprovalsWidget";
import { fetchWithAuth } from "../api/fetchWithAuth";
import { usePermissions } from "../utils/usePermissions";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1680355466468-bd0a68b11fa0?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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

// ── Shared card wrapper ─────────────────────────────────────────────────────
const CARD = "rounded-2xl border border-white/8 bg-[#0c0f1a]/70 backdrop-blur-xl p-5";

// ── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ title, linkTo, linkLabel = "View all" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.18em]">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-0.5 text-[11px] text-white/30 hover:text-[#f183ff] font-semibold transition-colors"
        >
          {linkLabel}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}

// ── Welcome hero ────────────────────────────────────────────────────────────
function WelcomeHero({ profile, role, isMember }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const badge = ROLE_LABELS[role] || "Member";
  const badgeClass = ROLE_COLORS[role] || ROLE_COLORS.member;

  return (
    <div className="relative rounded-2xl border border-white/8 bg-[#0c0f1a]/70 backdrop-blur-xl p-6 md:p-8 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#f183ff] via-[#ff6c95] to-transparent" />
      {/* Glow */}
      <div className="absolute top-4 right-8 h-28 w-28 rounded-full bg-[#f183ff]/8 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-5">
        <div className="shrink-0 h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_0_24px_rgba(241,131,255,0.12)]">
          <img
            src={profile?.image || DEFAULT_AVATAR}
            alt={profile?.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm text-white/40 font-semibold">{greeting},</p>
          <h1 className="text-xl md:text-2xl font-headline font-bold text-white leading-tight">
            {profile?.name || "SQAC Member"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
              {badge}
            </span>
            {profile?.coreDomain && (
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                {profile.coreDomain}
                {profile.subDomain ? ` / ${profile.subDomain}` : ""}
              </span>
            )}
          </div>
          {isMember && profile?.coreDomain && (
            <p className="text-xs text-white/25 mt-1.5">
              Welcome to SQAC · {profile.coreDomain}
              {profile.subDomain ? ` — ${profile.subDomain}` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl bg-white/[0.04] border border-white/5" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/[0.04] border border-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-white/[0.04] border border-white/5" />
        <div className="h-64 rounded-2xl bg-white/[0.04] border border-white/5" />
      </div>
      <div className="h-32 rounded-2xl bg-white/[0.04] border border-white/5" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE LAYOUTS
// ─────────────────────────────────────────────────────────────────────────────

function SecretaryLayout({ data, onApprove, onReject, loadingId, rejectModal }) {
  const { profile, members, pending, meetings, notices, projectStats } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter(
    (m) => new Date(m.date || m.startDate) >= today
  ).length;

  const roleCounts = useMemo(() =>
    members.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {}),
    [members]
  );

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="secretary" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="group"           label="Total Members"     value={members.length}                     accent="magenta" linkTo="/admin/members" />
        <StatCard icon="pending_actions" label="Pending Approvals" value={pending.length}                     accent="amber"   linkTo="/admin/approvals" sub={pending.length > 0 ? "Needs review" : "All clear"} />
        <StatCard icon="rocket_launch"   label="Active Projects"   value={projectStats?.inProgress ?? "—"}   accent="cyan" />
        <StatCard icon="calendar_month"  label="Upcoming Meetings" value={upcomingCount}                      accent="violet"  linkTo="/meet" />
      </div>

      {/* Approvals + Member breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${CARD}`}>
          <SectionHeader title="Pending Approvals" linkTo="/admin/approvals" linkLabel={`View all (${pending.length})`} />
          <PendingApprovalsWidget
            pending={pending}
            limit={3}
            onApprove={onApprove}
            onReject={onReject}
            loadingId={loadingId}
          />
        </div>

        <div className={CARD}>
          <SectionHeader title="Member Breakdown" linkTo="/admin/members" />
          {Object.keys(roleCounts).length === 0 ? (
            <p className="text-white/25 text-xs py-6 text-center">No members yet</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(roleCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([r, count]) => (
                  <div key={r} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${ROLE_COLORS[r] || ROLE_COLORS.member}`}>
                      {ROLE_LABELS[r] || r}
                    </span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Meets + Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Upcoming Meetings" linkTo="/meet" />
          <UpcomingMeetsWidget meetings={meetings} limit={3} />
        </div>
        <div className={CARD}>
          <SectionHeader title="Recent Notices" linkTo="/admin/notice" />
          <RecentNoticesWidget notices={notices} limit={3} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={CARD}>
        <SectionHeader title="Quick Actions" />
        <QuickActionsWidget actions={[
          { label: "Approvals",       icon: "how_to_reg",      to: "/admin/approvals",      gradient: "from-[#f183ff] to-[#ff6c95]" },
          { label: "Create Notice",   icon: "campaign",        to: "/admin/notice",         gradient: "from-[#81ecff] to-[#f183ff]" },
          { label: "Schedule Meet",   icon: "calendar_month",  to: "/meet",                 gradient: "from-[#ff6c95] to-[#f183ff]" },
          { label: "Members",         icon: "group",           to: "/admin/members",        gradient: "from-[#f183ff] to-[#81ecff]" },
        ]} />
      </div>

      {rejectModal}
    </div>
  );
}

function JointSecretaryLayout({ data }) {
  const { profile, members, meetings, notices, projectStats } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const noticesThisMonth = notices.filter((n) => new Date(n.createdAt) >= startOfMonth).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="joint_secretary" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="group"           label="Total Members"       value={members.length}                   accent="magenta" linkTo="/admin/members" />
        <StatCard icon="rocket_launch"   label="Active Projects"     value={projectStats?.inProgress ?? "—"} accent="cyan" />
        <StatCard icon="calendar_month"  label="Upcoming Meetings"   value={upcomingCount}                    accent="violet"  linkTo="/meet" />
        <StatCard icon="campaign"        label="Notices This Month"  value={noticesThisMonth}                 accent="emerald" linkTo="/admin/notice" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${CARD}`}>
          <SectionHeader title="Upcoming Meetings" linkTo="/meet" />
          <UpcomingMeetsWidget meetings={meetings} limit={4} />
        </div>
        <div className={CARD}>
          <SectionHeader title="Recent Notices" linkTo="/admin/notice" />
          <RecentNoticesWidget notices={notices} limit={3} />
        </div>
      </div>

      <div className={CARD}>
        <SectionHeader title="Quick Actions" />
        <QuickActionsWidget actions={[
          { label: "Create Notice",  icon: "campaign",        to: "/admin/notice",      gradient: "from-[#81ecff] to-[#f183ff]" },
          { label: "Schedule Meet",  icon: "calendar_month",  to: "/meet",              gradient: "from-[#f183ff] to-[#ff6c95]" },
          { label: "Members",        icon: "group",           to: "/admin/members",     gradient: "from-[#f183ff] to-[#81ecff]" },
          { label: "Attendance",     icon: "how_to_reg",      to: "/admin/attendance",  gradient: "from-[#ff6c95] to-[#f183ff]" },
        ]} />
      </div>
    </div>
  );
}

function LeadLayout({ data, role }) {
  const { profile, members, meetings, notices, projectStats, myProjects } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role={role} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="rocket_launch"   label="Active Projects"    value={projectStats?.inProgress ?? "—"}  accent="cyan" />
        <StatCard icon="layers"          label="My Projects"        value={myProjects.length}                 accent="magenta" linkTo="/user/projects" />
        <StatCard icon="calendar_month"  label="Upcoming Meetings"  value={upcomingCount}                     accent="violet"  linkTo="/meet" />
        <StatCard icon="group"           label="Total Members"      value={members.length}                    accent="emerald" linkTo="/admin/members" />
      </div>

      <div className={CARD}>
        <SectionHeader title="My Projects" linkTo="/user/projects" />
        <MyProjectsWidget projects={myProjects} limit={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Upcoming Meetings" linkTo="/meet" />
          <UpcomingMeetsWidget meetings={meetings} limit={3} />
        </div>
        <div className={CARD}>
          <SectionHeader title="Quick Actions" />
          <QuickActionsWidget actions={[
            { label: "Create Notice",  icon: "campaign",       to: "/admin/notice",         gradient: "from-[#81ecff] to-[#f183ff]" },
            { label: "Schedule Meet",  icon: "calendar_month", to: "/meet",                 gradient: "from-[#f183ff] to-[#ff6c95]" },
            { label: "Attendance",     icon: "how_to_reg",     to: "/admin/attendance",     gradient: "from-[#ff6c95] to-[#f183ff]" },
            { label: "Create MOM",     icon: "description",    to: "/admin/mom/create",     gradient: "from-[#f183ff] to-[#81ecff]" },
          ]} />
        </div>
      </div>
    </div>
  );
}

function DomainLeadLayout({ data }) {
  const { profile, members, meetings, notices } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;
  const domainMembers = profile?.coreDomain
    ? members.filter((m) => m.coreDomain === profile.coreDomain).length
    : members.length;

  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const noticesThisMonth = notices.filter((n) => new Date(n.createdAt) >= startOfMonth).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="domain_lead" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="group"           label="Domain Members"     value={domainMembers}    accent="emerald" linkTo="/admin/members" />
        <StatCard icon="calendar_month"  label="Upcoming Meetings"  value={upcomingCount}    accent="violet"  linkTo="/meet" />
        <StatCard icon="campaign"        label="Notices This Month" value={noticesThisMonth} accent="cyan"    linkTo="/admin/notice" />
        <StatCard icon="how_to_reg"      label="Attendance"         value="Manage"           accent="amber"   linkTo="/admin/attendance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Upcoming Meetings" linkTo="/meet" />
          <UpcomingMeetsWidget meetings={meetings} limit={4} />
        </div>
        <div className={CARD}>
          <SectionHeader title="Recent Notices" linkTo="/admin/notice" />
          <RecentNoticesWidget notices={notices} limit={4} coreDomain={profile?.coreDomain} />
        </div>
      </div>

      <div className={CARD}>
        <SectionHeader title="Quick Actions" />
        <QuickActionsWidget actions={[
          { label: "Schedule Meet",  icon: "calendar_month",  to: "/meet",              gradient: "from-[#f183ff] to-[#ff6c95]" },
          { label: "Create Notice",  icon: "campaign",        to: "/admin/notice",      gradient: "from-[#81ecff] to-[#f183ff]" },
          { label: "Attendance",     icon: "how_to_reg",      to: "/admin/attendance",  gradient: "from-[#ff6c95] to-[#f183ff]" },
          { label: "Create MOM",     icon: "description",     to: "/admin/mom/create",  gradient: "from-[#f183ff] to-[#81ecff]" },
        ]} />
      </div>
    </div>
  );
}

function AssociateLeadLayout({ data }) {
  const { profile, meetings, notices, myProjects } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const meetsThisMonth = meetings.filter((m) => new Date(m.date || m.startDate) >= startOfMonth).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="associate_lead" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="layers"          label="My Projects"         value={myProjects.length} accent="magenta" linkTo="/user/projects" />
        <StatCard icon="calendar_month"  label="Upcoming Meetings"   value={upcomingCount}     accent="violet"  linkTo="/meet" />
        <StatCard icon="history_edu"     label="MOM History"         value="View"              accent="cyan"    linkTo="/mom/list" />
        <StatCard icon="event"           label="Meetings This Month" value={meetsThisMonth}    accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${CARD}`}>
          <SectionHeader title="My Projects" linkTo="/user/projects" />
          <MyProjectsWidget projects={myProjects} limit={4} />
        </div>
        <div className={CARD}>
          <SectionHeader title="Upcoming Meetings" linkTo="/meet" />
          <UpcomingMeetsWidget meetings={meetings} limit={3} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Recent Notices" linkTo="/admin/notice" />
          <RecentNoticesWidget notices={notices} limit={3} />
        </div>
        <div className={CARD}>
          <SectionHeader title="Quick Actions" />
          <QuickActionsWidget actions={[
            { label: "My Projects",  icon: "rocket_launch",  to: "/user/projects",    gradient: "from-[#f183ff] to-[#ff6c95]" },
            { label: "Create MOM",   icon: "description",    to: "/mom/create",       gradient: "from-[#81ecff] to-[#f183ff]" },
            { label: "MOM History",  icon: "history_edu",    to: "/mom/list",         gradient: "from-[#ff6c95] to-[#f183ff]" },
          ]} />
        </div>
      </div>
    </div>
  );
}

function MemberLayout({ data }) {
  const { profile, meetings, notices, myProjects, myAttendance } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const attendedThisMonth = myAttendance.filter(
    (a) => a.status === "present" && new Date(a.date) >= startOfMonth
  ).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="member" isMember />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="layers"          label="My Projects"        value={myProjects.length}  accent="magenta" linkTo="/user/projects" />
        <StatCard icon="calendar_month"  label="Upcoming Meetings"  value={upcomingCount}      accent="violet"  linkTo="/meet" />
        <StatCard icon="campaign"        label="Recent Notices"     value={notices.length}     accent="cyan"    linkTo="/admin/notice" />
        <StatCard icon="how_to_reg"      label="Attended (Month)"   value={attendedThisMonth}  accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Upcoming Meetings" linkTo="/meet" />
          <UpcomingMeetsWidget meetings={meetings} limit={3} />
        </div>
        <div className={CARD}>
          <SectionHeader title="Recent Notices" linkTo="/admin/notice" />
          <RecentNoticesWidget notices={notices} limit={3} coreDomain={profile?.coreDomain} />
        </div>
      </div>

      <div className={CARD}>
        <SectionHeader title="My Projects" linkTo="/user/projects" />
        <MyProjectsWidget projects={myProjects} limit={3} />
      </div>

      <div className={CARD}>
        <SectionHeader title="Quick Actions" />
        <QuickActionsWidget actions={[
          { label: "My Projects",  icon: "rocket_launch",    to: "/user/projects",  gradient: "from-[#f183ff] to-[#ff6c95]" },
          { label: "Profile",      icon: "manage_accounts",  to: "/user/profile",   gradient: "from-[#81ecff] to-[#f183ff]" },
          { label: "Noticeboard",  icon: "campaign",         to: "/admin/notice",   gradient: "from-[#ff6c95] to-[#f183ff]" },
          { label: "Schedule",     icon: "calendar_month",   to: "/meet",           gradient: "from-[#f183ff] to-[#81ecff]" },
        ]} />
      </div>
    </div>
  );
}

// ── Role router ─────────────────────────────────────────────────────────────
function RoleLayout({ role, data, onApprove, onReject, loadingId, rejectModal }) {
  const props = { data, onApprove, onReject, loadingId, rejectModal };
  switch (role) {
    case "secretary":        return <SecretaryLayout {...props} />;
    case "joint_secretary":  return <JointSecretaryLayout data={data} />;
    case "technical_lead":
    case "project_lead":
    case "corp_lead":        return <LeadLayout data={data} role={role} />;
    case "domain_lead":      return <DomainLeadLayout data={data} />;
    case "associate_lead":   return <AssociateLeadLayout data={data} />;
    default:                 return <MemberLayout data={data} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { role } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    profile:      null,
    meetings:     [],
    notices:      [],
    members:      [],
    pending:      [],
    projectStats: null,
    myProjects:   [],
    myAttendance: [],
  });

  // Approval action state
  const [loadingId, setLoadingId]         = useState(null);
  const [rejectingId, setRejectingId]     = useState(null);
  const [rejectReason, setRejectReason]   = useState("");

  // ── Data fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const r = storedUser.role || "member";

      const calls = {
        profile:  fetchWithAuth(`${API}/user/profile`),
        meetings: fetchWithAuth(`${API}/meet/getmeet`),
        notices:  fetchWithAuth(`${API}/notices`),
      };

      const VIEW_MEMBERS_ROLES = [
        "secretary","joint_secretary","technical_lead","project_lead",
        "corp_lead","domain_lead","associate_lead",
      ];
      if (VIEW_MEMBERS_ROLES.includes(r)) {
        calls.members = fetchWithAuth(`${API}/admin/members`);
      }
      if (r === "secretary") {
        calls.pending = fetchWithAuth(`${API}/admin/pending`);
      }
      if (["secretary","joint_secretary","technical_lead","project_lead","corp_lead"].includes(r)) {
        calls.projectStats = fetchWithAuth(`${API}/api/projects/stats`);
      }
      if (["technical_lead","project_lead","corp_lead","associate_lead","member"].includes(r)) {
        calls.myProjects = fetchWithAuth(`${API}/api/projects/my-projects`);
      }
      if (r === "member") {
        const uid = storedUser._id || storedUser.id;
        if (uid) calls.myAttendance = fetchWithAuth(`${API}/attendance/user/${uid}`);
      }

      const keys = Object.keys(calls);
      const results = await Promise.allSettled(Object.values(calls));

      if (cancelled) return;

      const resolved = {};
      keys.forEach((k, i) => {
        resolved[k] = results[i].status === "fulfilled" ? results[i].value : null;
      });

      setData({
        profile:      resolved.profile?.user || resolved.profile || null,
        meetings:     Array.isArray(resolved.meetings)     ? resolved.meetings     : [],
        notices:      Array.isArray(resolved.notices)      ? resolved.notices      : [],
        members:      Array.isArray(resolved.members)      ? resolved.members      : [],
        pending:      Array.isArray(resolved.pending)      ? resolved.pending      : [],
        projectStats: resolved.projectStats || null,
        myProjects:   Array.isArray(resolved.myProjects)   ? resolved.myProjects   : [],
        myAttendance: Array.isArray(resolved.myAttendance) ? resolved.myAttendance : [],
      });
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Approval handlers ────────────────────────────────────────────────────
  const handleApprove = useCallback(async (id) => {
    setLoadingId(id);
    try {
      await fetchWithAuth(`${API}/admin/approve/${id}`, { method: "POST" });
      toast.success("Member approved");
      setData((prev) => ({ ...prev, pending: prev.pending.filter((m) => m._id !== id) }));
    } catch (e) {
      toast.error(e.message || "Approval failed");
    } finally {
      setLoadingId(null);
    }
  }, []);

  const handleReject = useCallback((id) => {
    setRejectingId(id);
    setRejectReason("");
  }, []);

  const submitReject = useCallback(async () => {
    setLoadingId(rejectingId);
    try {
      await fetchWithAuth(`${API}/admin/reject/${rejectingId}`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason: rejectReason }),
      });
      toast.success("Application rejected");
      setData((prev) => ({ ...prev, pending: prev.pending.filter((m) => m._id !== rejectingId) }));
      setRejectingId(null);
    } catch (e) {
      toast.error(e.message || "Rejection failed");
    } finally {
      setLoadingId(null);
    }
  }, [rejectingId, rejectReason]);

  const handleLogout = useCallback(async () => {
    try { await fetchWithAuth(`${API}/logout`, { method: "POST" }); } catch (_) {}
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  // ── Rejection modal JSX (passed down to Secretary layout) ────────────────
  const rejectModal = rejectingId ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1117]/98 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-400 text-lg">report</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Reject Application</h3>
            <p className="text-white/40 text-[11px]">
              {data.pending.find((m) => m._id === rejectingId)?.name} — reason optional
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
            disabled={!!loadingId}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-red-500/15 border border-red-400/25 text-red-300 hover:bg-red-500/25 disabled:opacity-40 transition-all"
          >
            {loadingId ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] font-body">
      <Navbar />
      <AdminSidebar onLogout={handleLogout} />

      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(129,236,255,0.06),transparent_28%)]" />
      <div className="pointer-events-none fixed -left-16 top-20 -z-20 h-56 w-56 rounded-full bg-[#f183ff]/12 blur-[90px]" />
      <div className="pointer-events-none fixed right-0 bottom-24 -z-20 h-64 w-64 rounded-full bg-[#81ecff]/7 blur-[110px]" />

      <main className="mx-auto max-w-[1400px] px-5 pb-16 pt-24 md:px-8 lg:pl-32">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <RoleLayout
            role={role}
            data={data}
            onApprove={handleApprove}
            onReject={handleReject}
            loadingId={loadingId}
            rejectModal={rejectModal}
          />
        )}
      </main>
    </div>
  );
}
