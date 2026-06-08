import React, { useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

// ─── Design tokens ─────────────────────────────────────────────────────────
const T = {
  bg:        "#080b14",
  surface:   "#0d1220",
  border:    "rgba(255,255,255,0.07)",
  primary:   "#f183ff",
  secondary: "#ff6c95",
  cyan:      "#81ecff",
  text:      "#f1f5f9",
  muted:     "rgba(241,245,249,0.45)",
  faint:     "rgba(241,245,249,0.18)",
  glowRGB:   "241,131,255",
};

// ─── Nav items ──────────────────────────────────────────────────────────────
const NAV = [
  { label: "Dashboard",     icon: "grid_view",         href: "/dashboard" },
  { label: "Profile",       icon: "manage_accounts",   href: "/profile" },
  { label: "Members",       icon: "group",             href: "/members" },
  { label: "Calendar",      icon: "calendar_month",    href: "/calendar" },
  { label: "Announcements", icon: "campaign",          href: "/announcements" },
  { label: "Contributions", icon: "workspace_premium", href: "/contributions" },
];

// ─── API Setup ──────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";

function useFetchData(endpoint) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);
    fetch(`${API_BASE}${endpoint}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then(d => { setData(d); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
}

// ─── Global CSS ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Space+Grotesk:wght@500;600&display=swap');
  @import url('https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; color: ${T.text}; font-family: 'DM Sans', sans-serif; }

  /* ── Floating pill sidebar (matches original MemberDashboard) ── */
  .sq-sidebar {
    position: fixed; left: 16px; top: 50%; transform: translateY(-50%);
    z-index: 50; display: flex; flex-direction: column; align-items: center;
  }
  .sq-sidebar-inner {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    border-radius: 999px; border: 1px solid ${T.border};
    background: rgba(13,18,32,0.78); padding: 14px 10px;
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  }
  .sq-nav-btn {
    width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: ${T.muted}; background: transparent; border: none;
    cursor: pointer; transition: background .2s, color .2s, box-shadow .2s;
    text-decoration: none;
  }
  .sq-nav-btn:hover { background: rgba(241,131,255,0.1); color: ${T.text}; }
  .sq-nav-btn.active {
    background: linear-gradient(135deg, ${T.primary}, ${T.secondary});
    color: #fff; box-shadow: 0 0 18px rgba(${T.glowRGB}, .4);
  }
  .sq-nav-btn .material-symbols-outlined { font-size: 20px; }
  .sq-divider { width: 28px; height: 0.5px; background: ${T.border}; margin: 2px 0; }
  .sq-logout-btn {
    width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: rgba(252,165,165,.7); background: transparent; border: none; cursor: pointer;
    transition: background .2s, color .2s;
  }
  .sq-logout-btn:hover { background: rgba(239,68,68,.12); color: #fca5a5; }
  .sq-logout-btn .material-symbols-outlined { font-size: 20px; }

  /* ── Main layout ── */
  .sq-main { margin-left: 88px; padding: 1.5rem 1.5rem 2rem; min-height: 100vh; }

  /* ── Topbar ── */
  .sq-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .sq-portal-label { font-size: 10px; letter-spacing: .14em; color: ${T.muted}; text-transform: uppercase; margin-bottom: 2px; }
  .sq-page-title {
    font-size: 20px; font-weight: 600; font-family: 'Space Grotesk', sans-serif;
    background: linear-gradient(120deg, ${T.primary}, ${T.secondary});
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .sq-page-sub { font-size: 11px; color: ${T.muted}; margin-top: 1px; }
  .sq-topbar-right { display: flex; align-items: center; gap: 8px; }
  .sq-icon-btn {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,255,255,.05); border: 0.5px solid ${T.border};
    display: flex; align-items: center; justify-content: center;
    color: ${T.muted}; cursor: pointer; transition: background .15s, color .15s;
    font-size: 11px; font-family: 'DM Sans', sans-serif;
  }
  .sq-icon-btn:hover { background: rgba(${T.glowRGB}, .08); color: ${T.primary}; }
  .sq-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, ${T.primary}, ${T.secondary});
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; color: #fff; cursor: pointer;
    box-shadow: 0 0 16px rgba(${T.glowRGB}, .35);
    font-family: 'Space Grotesk', sans-serif;
  }

  /* ── Overview card ── */
  .sq-overview {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 18px; padding: 16px 18px; margin-bottom: 12px;
  }
  .sq-stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .sq-stat {
    background: ${T.bg}; border: 1px solid ${T.border};
    border-radius: 14px; padding: 14px;
    transition: border-color .25s, box-shadow .25s;
  }
  .sq-stat:hover { border-color: rgba(${T.glowRGB}, .25); box-shadow: 0 0 24px rgba(${T.glowRGB}, .06); }
  .sq-stat-lbl {
    font-size: 10px; text-transform: uppercase; letter-spacing: .1em;
    color: ${T.muted}; margin-bottom: 10px; font-weight: 500;
  }
  .sq-stat-val {
    font-size: 24px; font-weight: 600; font-family: 'Space Grotesk', sans-serif;
    line-height: 1; color: ${T.text};
  }
  .sq-stat-val.gradient {
    background: linear-gradient(120deg, ${T.primary}, ${T.secondary});
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .sq-stat-desc { font-size: 10px; color: ${T.muted}; margin-top: 3px; }

  /* attendance ring + bar chart */
  .sq-ring-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .sq-ring-info strong { display: block; font-size: 12px; font-weight: 500; color: ${T.text}; margin-bottom: 2px; }
  .sq-ring-info span { font-size: 11px; color: ${T.muted}; }
  .sq-bar-chart { display: flex; align-items: flex-end; gap: 5px; height: 38px; margin-top: 4px; }
  .sq-bar-col { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
  .sq-bar-track { width: 100%; border-radius: 3px; background: rgba(255,255,255,.06); position: relative; overflow: hidden; }
  .sq-bar-fill { width: 100%; border-radius: 3px; position: absolute; bottom: 0; transition: height .6s ease; }
  .sq-bar-month { font-size: 8px; color: rgba(241,245,249,.3); text-align: center; }

  /* meeting rows */
  .sq-meet-row {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 0; border-bottom: 0.5px solid rgba(255,255,255,.05);
  }
  .sq-meet-row:last-child { border-bottom: none; }
  .sq-meet-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .sq-meet-name { flex: 1; font-size: 11px; color: #e2e8f0; }
  .sq-meet-date { font-size: 10px; color: ${T.muted}; }

  /* mini calendar */
  .sq-cal-days-hdr { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; margin-bottom: 2px; }
  .sq-cal-dh { font-size: 9px; text-align: center; color: rgba(241,245,249,.3); font-weight: 500; }
  .sq-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
  .sq-cal-d {
    width: 100%; aspect-ratio: 1; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: rgba(241,245,249,.45); position: relative;
  }
  .sq-cal-d.other { color: rgba(241,245,249,.18); }
  .sq-cal-d.has-event::after {
    content: ''; position: absolute; bottom: 2px; left: 50%;
    transform: translateX(-50%); width: 3px; height: 3px;
    border-radius: 50%; background: ${T.primary};
  }
  .sq-cal-d.today {
    background: linear-gradient(135deg, ${T.primary}, ${T.secondary});
    color: #fff; font-weight: 600; box-shadow: 0 0 10px rgba(${T.glowRGB}, .35);
  }
  .sq-cal-d.today::after { display: none; }

  /* ── Bottom grid ── */
  .sq-bottom { display: grid; grid-template-columns: 1fr 1.6fr; gap: 12px; }

  /* ── Tiles ── */
  .sq-tile {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 18px; padding: 16px 18px;
    display: flex; flex-direction: column;
    transition: border-color .25s, box-shadow .25s;
    cursor: default;
  }
  .sq-tile:hover { border-color: rgba(${T.glowRGB}, .25); box-shadow: 0 0 40px rgba(${T.glowRGB}, .08); }
  .sq-tile-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .sq-tile-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: ${T.muted}; font-weight: 500; }
  .sq-view-all { font-size: 11px; color: ${T.primary}; background: none; border: none; cursor: pointer; }

  /* notice rows */
  .sq-notice-row {
    display: flex; align-items: flex-start; gap: 9px;
    padding: 9px 0; border-bottom: 0.5px solid rgba(255,255,255,.05);
  }
  .sq-notice-row:last-child { border-bottom: none; }
  .sq-n-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .sq-n-text { font-size: 11px; color: #cbd5e1; line-height: 1.55; }

  /* deadline rows */
  .sq-deadline-row {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 0; border-bottom: 0.5px solid rgba(255,255,255,.05);
  }
  .sq-deadline-row:last-child { border-bottom: none; }
  .sq-d-name { flex: 1; font-size: 11px; color: #e2e8f0; }
  .sq-pill { display: inline-block; font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 20px; line-height: 1.6; }
  .sq-pill-hot { background: rgba(248,113,113,.12); color: #f87171; }

  /* projects table */
  .sq-tbl-hdr {
    display: grid; grid-template-columns: 2fr 56px 68px 46px;
    gap: 6px; padding: 0 0 6px;
    border-bottom: 0.5px solid rgba(255,255,255,.07); margin-bottom: 4px;
  }
  .sq-tbl-hdr span { font-size: 10px; color: rgba(241,245,249,.3); text-transform: uppercase; letter-spacing: .07em; }
  .sq-proj-row {
    display: grid; grid-template-columns: 2fr 56px 68px 46px;
    gap: 6px; align-items: center;
    padding: 8px 0; border-bottom: 0.5px solid rgba(255,255,255,.05);
  }
  .sq-proj-row:last-child { border-bottom: none; }
  .sq-proj-name-cell { display: flex; align-items: center; gap: 7px; }
  .sq-proj-avatar {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 600; flex-shrink: 0;
  }
  .sq-proj-name { font-size: 11px; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sq-status { font-size: 10px; padding: 2px 7px; border-radius: 20px; font-weight: 500; text-align: center; }
  .s-active  { background: rgba(34,197,94,.12);  color: #22c55e; }
  .s-review  { background: rgba(241,131,255,.12); color: #f183ff; }
  .s-pending { background: rgba(251,191,36,.12);  color: #fbbf24; }
  .sq-prog-bg   { height: 4px; border-radius: 2px; background: rgba(255,255,255,.07); }
  .sq-prog-fill { height: 100%; border-radius: 2px; }
  .sq-proj-due  { font-size: 10px; color: ${T.muted}; text-align: right; }

  /* ── Skeletons & Errors ── */
  .sq-skeleton { background: rgba(255,255,255,0.05); animation: pulse 1.5s infinite ease-in-out; border-radius: 8px; width: 100%; }
  @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
  .sq-error { color: #f87171; font-size: 11px; padding: 12px; text-align: center; background: rgba(248,113,113,0.1); border-radius: 8px; width: 100%; display: flex; align-items: center; justify-content: center; height: 100%; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .sq-stats-row { grid-template-columns: 1fr 1fr; }
    .sq-bottom    { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .sq-stats-row { grid-template-columns: 1fr; }
    .sq-main { margin-left: 0; padding: 12px; }
    .sq-sidebar { display: none; }
  }
`;

// ─── Floating Pill Sidebar (exactly as original) ─────────────────────────────
const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  return (
    <aside className="sq-sidebar">
      <div className="sq-sidebar-inner">
        {NAV.map(item => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              title={item.label}
              aria-label={item.label}
              className={`sq-nav-btn${active ? " active" : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </Link>
          );
        })}
        <div className="sq-divider" />
        <button className="sq-logout-btn" title="Logout" onClick={onLogout}>
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  );
};

// ─── Topbar ──────────────────────────────────────────────────────────────────
const Topbar = ({ member }) => (
  <div className="sq-topbar">
    <div>
      <div className="sq-portal-label">SQAC Portal</div>
      <div className="sq-page-title">Overview</div>
      <div className="sq-page-sub">System performance and strategic insights.</div>
    </div>
    <div className="sq-topbar-right">
      <button className="sq-icon-btn">Dark mode</button>
      <div className="sq-avatar">{member.initials}</div>
    </div>
  </div>
);

// ─── Attendance Card (ring + monthly bar chart) ───────────────────────────────
const AttendanceCard = ({ attended, total, history }) => {
  const pct  = Math.round((attended / total) * 100);
  const r    = 19;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const maxPct = Math.max(...history.map(h => h.attended / h.total));

  return (
    <div className="sq-stat">
      <div className="sq-stat-lbl">Meetings Attended</div>

      {/* ring + text */}
      <div className="sq-ring-row">
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={T.primary} />
              <stop offset="100%" stopColor={T.secondary} />
            </linearGradient>
          </defs>
          <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4.5" />
          <circle cx="26" cy="26" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="4.5"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 26 26)" style={{ transition: "stroke-dashoffset .8s ease" }} />
          <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="600" fill={T.text}>{pct}%</text>
        </svg>
        <div className="sq-ring-info">
          <strong>{attended}/{total} this term</strong>
          <span style={{ display: "block" }}>12% above average</span>
          <span className="sq-pill" style={{ background: "rgba(34,197,94,.12)", color: "#22c55e", marginTop: 4 }}>
            Top 10%
          </span>
        </div>
      </div>

      {/* monthly bar chart */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 9, color: "rgba(241,245,249,.3)", marginBottom: 4, letterSpacing: ".06em", textTransform: "uppercase" }}>
          Last 6 months
        </div>
        <div className="sq-bar-chart">
          {history.map((h, i) => {
            const ratio   = (h.attended / h.total) / maxPct;
            const isLast  = i === history.length - 1;
            const trackH  = 32;
            return (
              <div key={i} className="sq-bar-col">
                <div className="sq-bar-track" style={{ height: trackH }}>
                  <div
                    className="sq-bar-fill"
                    style={{
                      height: `${ratio * 100}%`,
                      background: isLast
                        ? `linear-gradient(180deg, ${T.primary}, ${T.secondary})`
                        : "rgba(241,131,255,.28)",
                      boxShadow: isLast ? `0 0 8px rgba(${T.glowRGB},.4)` : "none",
                    }}
                  />
                </div>
                <div className="sq-bar-month" style={{ color: isLast ? T.primary : "rgba(241,245,249,.3)" }}>
                  {h.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Upcoming Meetings Card ───────────────────────────────────────────────────
const UpcomingMeetings = ({ meetings }) => (
  <div className="sq-stat">
    <div className="sq-stat-lbl">Upcoming Meetings</div>
    <div className="sq-stat-val gradient" style={{ marginBottom: 4 }}>
      {String(meetings.length).padStart(2, "0")}
    </div>
    <div className="sq-stat-desc" style={{ marginBottom: 10 }}>scheduled this week</div>
    {meetings.map((m, i) => (
      <div key={i} className="sq-meet-row">
        <div className="sq-meet-dot" style={{ background: m.color }} />
        <span className="sq-meet-name">{m.name}</span>
        <span className="sq-meet-date">{m.date}</span>
      </div>
    ))}
  </div>
);

// ─── Mini Calendar Card ───────────────────────────────────────────────────────
const MiniCalendar = ({ data }) => (
  <div className="sq-stat">
    <div className="sq-stat-lbl">{data.month}</div>
    <div className="sq-cal-days-hdr">
      {data.days.map((d, i) => <div key={i} className="sq-cal-dh">{d}</div>)}
    </div>
    <div className="sq-cal-grid">
      {data.cells.map((c, i) => {
        let cls = "sq-cal-d";
        if (c.other) cls += " other";
        if (c.today) cls += " today";
        if (c.event && !c.today) cls += " has-event";
        return <div key={i} className={cls}>{c.n}</div>;
      })}
    </div>
    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.primary }} />
      <span style={{ fontSize: 9, color: "rgba(241,245,249,.35)" }}>event scheduled</span>
    </div>
  </div>
);

// ─── Notices + Deadlines Tile ─────────────────────────────────────────────────
const NoticesDeadlinesTile = ({ notices, deadlines }) => (
  <div className="sq-tile">
    <div className="sq-tile-hdr">
      <div className="sq-tile-lbl">Notices</div>
    </div>
    {notices.map((n, i) => (
      <div key={i} className="sq-notice-row">
        <div className="sq-n-dot" style={{ background: n.color }} />
        <span className="sq-n-text">{n.text}</span>
      </div>
    ))}
    <div className="sq-tile-lbl" style={{ marginTop: 16, marginBottom: 8 }}>Deadlines</div>
    {deadlines.map((d, i) => (
      <div key={i} className="sq-deadline-row">
        <div className="sq-n-dot" style={{ background: d.hot ? "#f87171" : "rgba(241,245,249,.25)", marginTop: 0 }} />
        <span className="sq-d-name">{d.name}</span>
        {d.hot
          ? <span className="sq-pill sq-pill-hot">{d.date}</span>
          : <span style={{ fontSize: 10, color: T.muted }}>{d.date}</span>
        }
      </div>
    ))}
  </div>
);

// ─── Projects Tile ────────────────────────────────────────────────────────────
const ProjectsTile = ({ projects }) => (
  <div className="sq-tile">
    <div className="sq-tile-hdr">
      <div className="sq-tile-lbl">Recent Projects</div>
      <button className="sq-view-all">View all ↗</button>
    </div>
    <div className="sq-tbl-hdr">
      <span>Project Name</span>
      <span>Status</span>
      <span>Progress</span>
      <span>Due</span>
    </div>
    {projects.map((p, i) => (
      <div key={i} className="sq-proj-row">
        <div className="sq-proj-name-cell">
          <div className="sq-proj-avatar" style={{ background: p.color + "26", color: p.color }}>TS</div>
          <span className="sq-proj-name">{p.name}</span>
        </div>
        <span className={`sq-status ${p.statusClass}`}>{p.status}</span>
        <div>
          <div className="sq-prog-bg">
            <div className="sq-prog-fill" style={{ width: `${p.pct}%`, background: p.color }} />
          </div>
        </div>
        <span className="sq-proj-due" style={p.date === "Tomorrow" ? { color: "#f87171" } : {}}>
          {p.date || "—"}
        </span>
      </div>
    ))}
  </div>
);

// ─── Async Wrappers ──────────────────────────────────────────────────────────
const AsyncTopbar = ({ memberId }) => {
  const { data, loading, error } = useFetchData(`/member/${memberId}`);
  if (loading) return <div className="sq-topbar"><div className="sq-skeleton" style={{ width: 150, height: 40 }}></div></div>;
  if (error) return <div className="sq-topbar"><div className="sq-error" style={{ width: "auto" }}>Error loading profile</div></div>;
  return <Topbar member={data} />;
};

const AsyncAttendanceCard = ({ memberId }) => {
  const { data, loading, error } = useFetchData(`/member/${memberId}/attendance`);
  if (loading) return <div className="sq-stat"><div className="sq-skeleton" style={{ height: 160 }}></div></div>;
  if (error) return <div className="sq-stat"><div className="sq-error">Failed to load attendance</div></div>;
  return <AttendanceCard attended={data.attended} total={data.total} history={data.history} />;
};

const AsyncUpcomingMeetings = () => {
  const { data, loading, error } = useFetchData(`/meetings/upcoming`);
  if (loading) return <div className="sq-stat"><div className="sq-skeleton" style={{ height: 160 }}></div></div>;
  if (error) return <div className="sq-stat"><div className="sq-error">Failed to load meetings</div></div>;
  return <UpcomingMeetings meetings={data} />;
};

const AsyncMiniCalendar = ({ month, year }) => {
  const { data, loading, error } = useFetchData(`/calendar/${month}/${year}`);
  if (loading) return <div className="sq-stat"><div className="sq-skeleton" style={{ height: 160 }}></div></div>;
  if (error) return <div className="sq-stat"><div className="sq-error">Failed to load calendar</div></div>;
  return <MiniCalendar data={data} />;
};

const AsyncNoticesDeadlines = () => {
  const { data: notices, loading: l1, error: e1 } = useFetchData(`/notices`);
  const { data: deadlines, loading: l2, error: e2 } = useFetchData(`/deadlines`);
  if (l1 || l2) return <div className="sq-tile"><div className="sq-skeleton" style={{ height: 200 }}></div></div>;
  if (e1 || e2) return <div className="sq-tile"><div className="sq-error">Failed to load notices/deadlines</div></div>;
  return <NoticesDeadlinesTile notices={notices} deadlines={deadlines} />;
};

const AsyncProjectsTile = () => {
  const { data, loading, error } = useFetchData(`/projects`);
  if (loading) return <div className="sq-tile"><div className="sq-skeleton" style={{ height: 200 }}></div></div>;
  if (error) return <div className="sq-tile"><div className="sq-error">Failed to load projects</div></div>;
  return <ProjectsTile projects={data} />;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function MemberDashboard({ memberId: propMemberId, onLogout = () => {} }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const memberId = propMemberId || (user ? user.id : "1");

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Sidebar onLogout={onLogout} />
      <main className="sq-main">
        <AsyncTopbar memberId={memberId} />

        {/* Overview row */}
        <div className="sq-overview">
          <div className="sq-stats-row">
            <AsyncAttendanceCard memberId={memberId} />
            <AsyncUpcomingMeetings />
            <AsyncMiniCalendar month={currentMonth} year={currentYear} />
          </div>
        </div>

        {/* Bottom grid */}
        <div className="sq-bottom">
          <AsyncNoticesDeadlines />
          <AsyncProjectsTile />
        </div>
      </main>
    </>
  );
}