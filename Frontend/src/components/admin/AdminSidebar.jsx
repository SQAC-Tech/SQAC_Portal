import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "../../utils/memberHelpers";

const AdminSidebar = ({ onLogout }) => {
  const location = useLocation();

  return (
    <aside className="member-sidebar fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 lg:flex">
      <div className="member-sidebar-shell flex flex-col items-center gap-4 rounded-[999px] border border-white/10 bg-[#0d1220]/72 px-3 py-4 backdrop-blur-2xl">
        {navItems.map((item) => {
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
                <span className="material-symbols-outlined">{item.icon}</span>
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
              <span className="material-symbols-outlined">{item.icon}</span>
            </a>
          );
        })}

        <button
          aria-label="Logout"
          className="member-sidebar-link mt-2 text-red-100/80 hover:text-red-100"
          onClick={onLogout}
          title="Logout"
          type="button"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
