export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1680355466468-bd0a68b11fa0?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "#" },
  { icon: "group", label: "Members", href: "/admin/members" },
  { icon: "calendar_month", label: "Schedule", href: "#" },
  { icon: "campaign", label: "Noticeboard", href: "#" },
  { icon: "forum", label: "Chats", href: "#" },
];

export const editableRoles = ["user", "lead", "subadmin", "admin"];

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

export const roleLabel = (member) => {
  if (member.role === "admin") return "Administrator";
  if (member.role === "subadmin") return "Sub Admin";
  if (member.role === "lead") return "Domain Lead";
  return "Member";
};

export const buildMailLink = (email) => (email ? `mailto:${email}` : "#");
