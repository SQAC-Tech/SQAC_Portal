import React, { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems, ROLE_LABELS } from "../../../utils/memberHelpers";
import SQACLogo from "../../ui/SQACLogo";

const ROLES_WITH_ADMIN_ACCESS = [
  "secretary", "joint_secretary", "technical_lead", "project_lead",
  "corp_lead", "domain_lead", "associate_lead",
];
const CERT_PERM_ROLES = ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead"];

/** Same role-filter rules as AdminSidebar, kept in sync. */
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
 * Mobile slide-in navigation drawer (shown < lg). Mirrors the desktop sidebar.
 * Closes on route change, Esc, or backdrop click.
 */
export default function MobileNav({ open, onClose, onLogout, user }) {
  const location = useLocation();
  const role = user?.role || "member";
  const items = useMemo(() => filterNav(role), [role]);

  // Close on route change
  useEffect(() => {
    if (open) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Esc to close + scroll lock while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 z-[160] flex h-full w-[82%] max-w-[320px] flex-col border-r border-white/10 bg-[#0c0f1a]/98 backdrop-blur-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
            <SQACLogo size={32} glow />
            <div className="leading-tight">
              <p className="font-headline text-base font-bold text-white">
                SQAC <span className="font-light text-[#ff6c95]">Portal</span>
              </p>
              {user?.name && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#f183ff]/70">
                  {ROLE_LABELS[role] || role}
                </p>
              )}
            </div>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = location.pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "border border-[#f183ff]/25 bg-[#f183ff]/10 text-white"
                        : "border border-transparent text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        active ? "text-[#f183ff]" : "text-white/45"
                      }`}
                    >
                      {item.icon.toLowerCase()}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/8 p-3">
          <button
            onClick={() => {
              onClose?.();
              onLogout?.();
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-red-500/15 bg-red-500/8 px-3.5 py-3 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
