import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Members", icon: "group", href: "/admin/members" },
  { label: "Schedule", icon: "calendar_month", href: "/admin/schedule" },
  { label: "Noticeboard", icon: "campaign", href: "/admin/noticeboard" },
  { label: "Chat", icon: "chat_bubble", href: "/admin/chat" },
];

const ScheduleSidebar = () => {
  const location = useLocation();

  return (
    <aside className="sched-sidebar">
      {/* Logo Block */}
      <div className="sched-sidebar__logo">
        <div className="sched-sidebar__logo-glyph">
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#fff" }}>
            grid_view
          </span>
        </div>
        <div>
          <span className="sched-sidebar__logo-title">SQAC</span>
          <span className="sched-sidebar__logo-sub">ADMIN SUITE</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="sched-sidebar__nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`sched-sidebar__nav-item ${isActive ? "is-active" : ""}`}
            >
              <span className="material-symbols-outlined sched-sidebar__nav-icon">
                {item.icon}
              </span>
              <span className="sched-sidebar__nav-label">{item.label}</span>
              {isActive && <span className="sched-sidebar__nav-indicator" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      <div className="sched-sidebar__footer">
        <button type="button" className="sched-sidebar__cta">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Create Event
        </button>
      </div>
    </aside>
  );
};

export default ScheduleSidebar;
