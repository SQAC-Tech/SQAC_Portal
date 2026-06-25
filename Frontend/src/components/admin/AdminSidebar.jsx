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
    <aside className="member-sidebar fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 lg:flex">
      <div className="member-sidebar-shell flex flex-col items-center gap-2 rounded-[2rem] border border-white/10 bg-[#0c0f1a]/72 px-2.5 py-4 backdrop-blur-2xl">
        {/* Brand */}
        <Link
          to="/dashboard"
          aria-label="SQAC — Dashboard"
          title="SQAC"
          className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition-transform duration-200 hover:scale-105"
        >
          <SQACLogo size={24} />
        </Link>
        <div className="mb-1 h-px w-7 shrink-0 bg-white/10" />

        {filteredNavItems.map((item) => {
          const isRoute = item.href.startsWith("/");
          const isActive = isRoute && location.pathname === item.href;
          const commonClassName = isActive
            ? "member-sidebar-link is-active"
            : "member-sidebar-link";

          if (isRoute) {
            return (
              <Link
                aria-label={item.label}
                className={commonClassName}
                key={item.label}
                title={item.label}
                to={item.href}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </Link>
            );
          }

          return (
            <a
              aria-label={item.label}
              className={commonClassName}
              href={item.href}
              key={item.label}
              title={item.label}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
            </a>
          );
        })}

        <div className="mt-1 h-px w-7 shrink-0 bg-white/10" />
        <button
          aria-label="Logout"
          className="member-sidebar-link shrink-0 text-red-100/80 hover:text-red-100"
          onClick={onLogout}
          title="Logout"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
