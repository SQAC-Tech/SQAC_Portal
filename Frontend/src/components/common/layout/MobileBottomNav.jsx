import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "../../../utils/memberHelpers";

const ROLES_WITH_ADMIN_ACCESS = [
  "secretary", "joint_secretary", "technical_lead", "project_lead",
  "corp_lead", "domain_lead", "associate_lead",
];
const CERT_PERM_ROLES = ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead"];

/** Same role-filter rules as AdminSidebar / MobileNav, kept in sync. */
function filterNav(role) {
  const hasAdminAccess = ROLES_WITH_ADMIN_ACCESS.includes(role);
  return navItems.filter((item) => {
    if (!hasAdminAccess) {
      return ["Dashboard", "Profile", "Schedule", "Noticeboard"].includes(item.label);
    }
    if (item.secretaryOnly && role !== "secretary") return false;
    if (item.cocRecordsOnly && role !== "secretary" && role !== "joint_secretary") return false;
    if (item.label === "Certificate Generator" && !CERT_PERM_ROLES.includes(role)) return false;
    return true;
  });
}

/**
 * Always-visible bottom navigation bar for phones/tablets (< lg). Shows the top
 * destinations as tappable tabs plus a "More" button that opens the full
 * slide-in drawer. Hidden on desktop, where the left sidebar takes over.
 */
export default function MobileBottomNav({ user, onMore }) {
  const location = useLocation();
  const role = user?.role || "member";
  const items = useMemo(() => filterNav(role), [role]);
  // Up to 4 primary tabs; the rest live in the drawer behind "More".
  const primary = items.slice(0, 4);

  const tabClass = (active) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-w-0 transition-colors ${
      active ? "text-[#f183ff]" : "text-white/55 hover:text-white"
    }`;

  // Portaled into <body> so its `position: fixed` is viewport-relative and not
  // captured by the Navbar's backdrop-filter containing block.
  return createPortal(
    <nav
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className="fixed inset-x-0 bottom-0 z-[120] flex border-t border-white/10 bg-[#0c0f1a]/98 backdrop-blur-2xl lg:hidden"
      aria-label="Primary"
    >
      {primary.map((item) => {
        const active = location.pathname === item.href;
        return (
          <Link to={item.href} key={item.label} className={tabClass(active)}>
            <span className="material-symbols-outlined text-[22px]">{item.icon.toLowerCase()}</span>
            <span className="max-w-full truncate px-1 text-[10px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
      <button type="button" onClick={onMore} className={tabClass(false)} aria-label="More navigation">
        <span className="material-symbols-outlined text-[22px]">menu</span>
        <span className="text-[10px] font-semibold">More</span>
      </button>
    </nav>,
    document.body
  );
}
