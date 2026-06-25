export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1680355466468-bd0a68b11fa0?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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

const ROLE_LABELS = {
  secretary: "Secretary",
  joint_secretary: "Joint Secretary",
  technical_lead: "Technical Lead",
  project_lead: "Project Lead",
  corp_lead: "Corporate Lead",
  domain_lead: "Domain Lead",
  associate_lead: "Associate Lead",
  member: "Member",
};

export const roleLabel = (member) => ROLE_LABELS[member.role] || "Member";

export const buildMailLink = (email) => (email ? `mailto:${email}` : "#");
