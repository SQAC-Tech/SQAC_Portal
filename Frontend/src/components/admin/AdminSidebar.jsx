import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "../../utils/memberHelpers";
import SQACLogo from "../ui/SQACLogo";

// Roles that can access admin sections (everyone except member)
const ROLES_WITH_ADMIN_ACCESS = [
  "secretary",
  "joint_secretary",
  "technical_lead",
  "project_lead",
  "corp_lead",
  "domain_lead",
  "associate_lead",
];

const CERT_PERM_ROLES = [
  "secretary",
  "joint_secretary",
  "technical_lead",
  "project_lead",
  "corp_lead",
];

const AdminSidebar = ({ onLogout }) => {
  const location = useLocation();

  const filteredNavItems = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : {};
      const role = user.role || "member";
      const hasAdminAccess = ROLES_WITH_ADMIN_ACCESS.includes(role);

      return navItems.filter((item) => {
        if (!hasAdminAccess) {
          const memberOnlyLabels = ["Dashboard", "Profile", "Schedule", "Noticeboard"];
          return memberOnlyLabels.includes(item.label);
        }
        if (item.secretaryOnly && role !== "secretary") return false;
        if (item.cocRecordsOnly && role !== "secretary" && role !== "joint_secretary") return false;
        if (item.label === "Certificate Generator" && !CERT_PERM_ROLES.includes(role)) {
          return false;
        }
        return true;
      });
    } catch (e) {
      console.error("Sidebar role parse error:", e);
      return navItems;
    }
  }, []);

  return (
    // `group` drives the hover-expand. Collapsed footprint (≈68px) stays inside
    // the lg:pl-28 page gutter, so content never shifts; on hover the panel
    // slides open to reveal labels and reads as a full sidebar.
    <aside className="member-sidebar group fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 lg:flex">
      <div className="member-sidebar-shell flex w-[68px] flex-col gap-1 overflow-x-hidden rounded-[1.75rem] border border-white/10 bg-[#0c0f1a]/95 p-2.5 backdrop-blur-2xl transition-[width] duration-300 ease-out group-hover:w-[236px]">
        {/* Brand */}
        <Link
          to="/dashboard"
          aria-label="SQAC — Dashboard"
          className="flex items-center gap-3 rounded-2xl px-1 py-1.5 transition-colors hover:bg-white/5"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <SQACLogo size={24} />
          </span>
          <span className="hidden whitespace-nowrap font-headline text-base font-bold text-white group-hover:inline">
            SQAC <span className="font-light text-[#ff6c95]">Portal</span>
          </span>
        </Link>

        <div className="my-1 h-px w-full shrink-0 bg-white/10" />

        <nav className="flex flex-col gap-1">
          {filteredNavItems.map((item) => {
            const isRoute = item.href.startsWith("/");
            const isActive = isRoute && location.pathname === item.href;
            const rowClass = `flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${
              isActive
                ? "bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-black shadow-[0_0_18px_rgba(241,131,255,0.28)]"
                : "text-white/70 hover:bg-white/8 hover:text-white"
            }`;
            const inner = (
              <>
                <span className="material-symbols-outlined w-7 shrink-0 text-center text-xl">
                  {item.icon.toLowerCase()}
                </span>
                <span className="hidden whitespace-nowrap text-sm font-semibold group-hover:inline">
                  {item.label}
                </span>
              </>
            );

            return isRoute ? (
              <Link aria-label={item.label} className={rowClass} key={item.label} title={item.label} to={item.href}>
                {inner}
              </Link>
            ) : (
              <a aria-label={item.label} className={rowClass} href={item.href} key={item.label} title={item.label}>
                {inner}
              </a>
            );
          })}
        </nav>

        <div className="my-1 h-px w-full shrink-0 bg-white/10" />

        <button
          aria-label="Logout"
          className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-red-200/80 transition-colors hover:bg-red-500/10 hover:text-red-100"
          onClick={onLogout}
          title="Logout"
          type="button"
        >
          <span className="material-symbols-outlined w-7 shrink-0 text-center text-xl">logout</span>
          <span className="hidden whitespace-nowrap text-sm font-semibold group-hover:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
