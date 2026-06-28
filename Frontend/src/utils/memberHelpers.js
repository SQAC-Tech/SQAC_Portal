// Local, square, branded fallback (already cached as the favicon) — replaces the
// old 34KB external Unsplash photo that was seeded as User.image's default.
export const DEFAULT_AVATAR = "/pwa-192x192.png";

// Older accounts were seeded with this Unsplash photo as their image; treat it
// (and empty values) as "no real avatar" so we never fetch the external image.
export const isDefaultAvatar = (url) => !url || url.includes("photo-1680355466468");

export const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "Manage_Accounts", label: "Profile", href: "/user/profile" },
  { icon: "group", label: "Members", href: "/admin/members" },
  { icon: "rocket_launch", label: "Projects", href: "/admin/projects" },
  { icon: "calendar_month", label: "Schedule", href: "/meet" },
  { icon: "how_to_reg", label: "Attendance", href: "/admin/attendance" },
  { icon: "campaign", label: "Noticeboard", href: "/admin/notice" },
  {
    icon: "license",
    label: "Certificate Generator",
    href: "/dashboard/certificates",
  },
  {
    icon: "pending_actions",
    label: "Approvals",
    href: "/admin/approvals",
    secretaryOnly: true,
  },
  {
    icon: "verified_user",
    label: "COC Records",
    href: "/admin/coc",
    cocRecordsOnly: true,
  },
  {
    icon: "description",
    label: "Create MOM",
    href: "/admin/mom/create",
  },
  {
    icon: "history_edu",
    label: "MOM History",
    href: "/admin/mom/list",
  },
];

export const editableRoles = [
  "member",
  "associate_lead",
  "domain_lead",
  "corp_lead",
  "project_lead",
  "technical_lead",
  "joint_secretary",
  "secretary",
];

export const formatDate = (value) => {
  if (!value) return "Recently joined";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently joined";

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const initialsFromName = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SQ";

// Canonical role maps — single source of truth. Import these instead of
// re-declaring per page (previously duplicated in Dashboard/Navbar/Members).
export const ROLE_LABELS = {
  secretary: "Secretary",
  joint_secretary: "Joint Secretary",
  technical_lead: "Technical Lead",
  project_lead: "Project Lead",
  corp_lead: "Corporate Lead",
  domain_lead: "Domain Lead",
  associate_lead: "Associate Lead",
  member: "Member",
};

export const ROLE_COLORS = {
  secretary:       "bg-[#f183ff]/10 border-[#f183ff]/25 text-[#f183ff]",
  joint_secretary: "bg-violet-500/10 border-violet-400/25 text-violet-300",
  technical_lead:  "bg-blue-500/10 border-blue-400/25 text-blue-300",
  project_lead:    "bg-cyan-500/10 border-cyan-400/25 text-cyan-300",
  corp_lead:       "bg-amber-500/10 border-amber-400/25 text-amber-300",
  domain_lead:     "bg-emerald-500/10 border-emerald-400/25 text-emerald-300",
  associate_lead:  "bg-orange-500/10 border-orange-400/25 text-orange-300",
  member:          "bg-white/6 border-white/15 text-white/60",
};

export const roleLabelFor = (role) => ROLE_LABELS[role] || "Member";
export const roleColorFor = (role) => ROLE_COLORS[role] || ROLE_COLORS.member;

export const roleLabel = (member) => ROLE_LABELS[member.role] || "Member";

export const buildMailLink = (email) => (email ? `mailto:${email}` : "#");
