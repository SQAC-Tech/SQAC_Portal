import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../components/common/layout/AppShell";
import StatCard from "../components/dashboard/StatCard";
import UpcomingMeetsWidget from "../components/dashboard/UpcomingMeetsWidget";
import RecentNoticesWidget from "../components/dashboard/RecentNoticesWidget";
import QuickActionsWidget from "../components/dashboard/QuickActionsWidget";
import MyProjectsWidget from "../components/dashboard/MyProjectsWidget";
import PendingApprovalsWidget from "../components/dashboard/PendingApprovalsWidget";
import ActivityFeedWidget from "../components/dashboard/ActivityFeedWidget";
import { Avatar, PremiumCard } from "../components/ui";
import { fetchWithAuth } from "../api/fetchWithAuth";
import { usePermissions } from "../utils/usePermissions";
import { ROLE_LABELS, ROLE_COLORS } from "../utils/memberHelpers";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ── Shared card wrapper ─────────────────────────────────────────────────────
// Premium panel — same glass/radius/shadow language as the Profile card.
const CARD =
  "relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)] p-6";

// ── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ title, linkTo, linkLabel = "View all" }) {
  return (
    <div className="flex items-center justify-between mb-3">
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
function WelcomeHero({ profile, role, isMember, meta = [] }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const badge = ROLE_LABELS[role] || "Member";
  const badgeClass = ROLE_COLORS[role] || ROLE_COLORS.member;
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <PremiumCard padding="lg">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#f183ff] via-[#ff6c95] to-transparent" />
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[#f183ff]/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <Avatar
            src={profile?.image}
            alt={profile?.name}
            size={60}
            className="shadow-[0_0_24px_rgba(241,131,255,0.12)]"
          />
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
          </div>
        </div>

        {/* At a glance */}
        <div className="lg:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">{dateLabel}</p>
          {meta.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 lg:justify-end">
              {meta.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2"
                >
                  <span className="material-symbols-outlined text-[#f183ff] text-base">{m.icon}</span>
                  <div className="text-left leading-tight">
                    <p className="text-sm font-bold text-white">{m.value}</p>
                    <p className="text-[9px] uppercase tracking-wider text-white/35">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PremiumCard>
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
  const { profile, members, pending, meetings, notices, projectStats, moms } = data;

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
      <WelcomeHero profile={profile} role="secretary" meta={[
        { icon: "group", value: members.length, label: "Members" },
        { icon: "pending_actions", value: pending.length, label: "Pending" },
        { icon: "calendar_month", value: upcomingCount, label: "Upcoming" },
      ]} />

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

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Recent Activity" linkTo="/mom/list" />
          <ActivityFeedWidget moms={moms} limit={4} />
        </div>
        <div className={CARD}>
          <SectionHeader title="Quick Actions" />
          <QuickActionsWidget actions={[
            { label: "Approvals",       icon: "how_to_reg",      to: "/admin/approvals",      gradient: "from-[#f183ff] to-[#ff6c95]" },
            { label: "Create Notice",   icon: "campaign",        to: "/admin/notice",         gradient: "from-[#81ecff] to-[#f183ff]" },
            { label: "Schedule Meet",   icon: "calendar_month",  to: "/meet",                 gradient: "from-[#ff6c95] to-[#f183ff]" },
            { label: "Members",         icon: "group",           to: "/admin/members",        gradient: "from-[#f183ff] to-[#81ecff]" },
          ]} />
        </div>
      </div>

      {rejectModal}
    </div>
  );
}

function JointSecretaryLayout({ data }) {
  const { profile, members, meetings, notices, projectStats, moms } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const noticesThisMonth = notices.filter((n) => new Date(n.createdAt) >= startOfMonth).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="joint_secretary" meta={[
        { icon: "group", value: members.length, label: "Members" },
        { icon: "calendar_month", value: upcomingCount, label: "Upcoming" },
        { icon: "campaign", value: noticesThisMonth, label: "Notices" },
      ]} />

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Recent Activity" linkTo="/mom/list" />
          <ActivityFeedWidget moms={moms} limit={4} />
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
    </div>
  );
}

function LeadLayout({ data, role }) {
  const { profile, members, meetings, notices, projectStats, myProjects, moms } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role={role} meta={[
        { icon: "rocket_launch", value: projectStats?.inProgress ?? "—", label: "Active" },
        { icon: "layers", value: myProjects.length, label: "Mine" },
        { icon: "calendar_month", value: upcomingCount, label: "Upcoming" },
      ]} />

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

      <div className={CARD}>
        <SectionHeader title="Recent Activity" linkTo="/mom/list" />
        <ActivityFeedWidget moms={moms} limit={4} />
      </div>
    </div>
  );
}

function DomainLeadLayout({ data }) {
  const { profile, members, meetings, notices, moms } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;
  const domainMembers = profile?.coreDomain
    ? members.filter((m) => m.coreDomain === profile.coreDomain).length
    : members.length;

  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const noticesThisMonth = notices.filter((n) => new Date(n.createdAt) >= startOfMonth).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="domain_lead" meta={[
        { icon: "group", value: domainMembers, label: "Domain" },
        { icon: "calendar_month", value: upcomingCount, label: "Upcoming" },
        { icon: "campaign", value: noticesThisMonth, label: "Notices" },
      ]} />

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Recent Activity" linkTo="/mom/list" />
          <ActivityFeedWidget moms={moms} limit={4} />
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
    </div>
  );
}

function AssociateLeadLayout({ data }) {
  const { profile, meetings, notices, myProjects, moms } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const meetsThisMonth = meetings.filter((m) => new Date(m.date || m.startDate) >= startOfMonth).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="associate_lead" meta={[
        { icon: "layers", value: myProjects.length, label: "Projects" },
        { icon: "calendar_month", value: upcomingCount, label: "Upcoming" },
        { icon: "event", value: meetsThisMonth, label: "This Month" },
      ]} />

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

      <div className={CARD}>
        <SectionHeader title="Recent Activity" linkTo="/mom/list" />
        <ActivityFeedWidget moms={moms} limit={5} />
      </div>
    </div>
  );
}

function MemberLayout({ data }) {
  const { profile, meetings, notices, myProjects, myAttendance, moms } = data;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingCount = meetings.filter((m) => new Date(m.date || m.startDate) >= today).length;
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const attendedThisMonth = myAttendance.filter(
    (a) => a.status === "present" && new Date(a.date) >= startOfMonth
  ).length;

  return (
    <div className="space-y-6">
      <WelcomeHero profile={profile} role="member" isMember meta={[
        { icon: "layers", value: myProjects.length, label: "Projects" },
        { icon: "calendar_month", value: upcomingCount, label: "Upcoming" },
        { icon: "how_to_reg", value: attendedThisMonth, label: "Attended" },
      ]} />

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <SectionHeader title="Recent Activity" linkTo="/mom/list" />
          <ActivityFeedWidget moms={moms} limit={4} />
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
    moms:         [],
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
        moms:     fetchWithAuth(`${API}/api/mom/all`),
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

      // Map a single resolved response into the data slice it belongs to.
      const normalize = (key, val) => {
        if (key === "profile") return val?.user || val || null;
        if (key === "projectStats") return val || null;
        return Array.isArray(val) ? val : [];
      };

      // Stream each result into state as it arrives so the dashboard fills in
      // progressively, rather than holding the whole UI in skeleton until the
      // slowest call (usually /api/projects/stats) finishes.
      Object.entries(calls).forEach(([key, promise]) => {
        promise
          .then((val) => {
            if (!cancelled) setData((prev) => ({ ...prev, [key]: normalize(key, val) }));
          })
          .catch(() => { /* keep the default for this slice */ })
          .finally(() => {
            // Reveal the dashboard the moment the profile (hero) is ready;
            // the remaining sections animate in as their data lands.
            if (!cancelled && key === "profile") setLoading(false);
          });
      });

      // Safety net: never stay in skeleton forever if the profile call is slow.
      Promise.allSettled(Object.values(calls)).finally(() => {
        if (!cancelled) setLoading(false);
      });
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

  // ── Rejection modal JSX (passed down to Secretary layout) ────────────────
  const rejectModal = rejectingId ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0f1a]/98 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
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
    <AppShell>
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
    </AppShell>
  );
}
