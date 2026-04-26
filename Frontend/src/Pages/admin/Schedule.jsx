import React from "react";
import ScheduleSidebar from "../../components/admin/ScheduleSidebar";
import CalendarModule from "../../components/admin/CalendarModule";
import CreateMeetingPanel from "../../components/admin/CreateMeetingPanel";

const Schedule = () => {
  return (
    <div className="sched-page">
      {/* Deep Obsidian Background with radial gradient */}
      <div className="sched-page__bg" />

      {/* Top Bar */}
      <header className="sched-page__topbar">
        <div className="sched-page__topbar-left">
          <span className="sched-page__topbar-brand">SQAC Admin</span>
        </div>
        <div className="sched-page__topbar-search">
          <span className="material-symbols-outlined sched-page__topbar-search-icon">
            search
          </span>
          <input
            type="text"
            className="sched-page__topbar-search-input"
            placeholder="Search schedule..."
          />
        </div>
        <div className="sched-page__topbar-right">
          <button type="button" className="sched-page__topbar-icon-btn" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button type="button" className="sched-page__topbar-icon-btn" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="sched-page__topbar-avatar">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>person</span>
          </div>
        </div>
      </header>

      {/* Three-Pane Layout */}
      <div className="sched-page__layout">
        {/* Left Rail */}
        <ScheduleSidebar />

        {/* Main Content */}
        <main className="sched-page__main">
          {/* Page Headline */}
          <div className="sched-page__headline">
            <h1 className="sched-page__title">Meeting Scheduler</h1>
            <p className="sched-page__subtitle">
              Coordinate team sprints and executive syncs.
            </p>
          </div>

          {/* Calendar Module */}
          <CalendarModule />
        </main>

        {/* Right Utility Panel */}
        <aside className="sched-page__utility">
          <CreateMeetingPanel />
        </aside>
      </div>
    </div>
  );
};

export default Schedule;
