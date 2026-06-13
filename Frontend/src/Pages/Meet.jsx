import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../components/common/layout/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import { usePermissions } from "../utils/usePermissions";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Meet() {
  const { canScheduleMeet } = usePermissions();
  const [meetings, setMeetings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [startDateStr, setStartDateStr] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [description, setDescription] = useState("");
  const [teamScope, setTeamScope] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Retrieve user details from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/meet/getmeet`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setMeetings(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to load meetings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Calendar logic helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    // Adjust day so Monday is 0, Sunday is 6
    return day === 0 ? 6 : day - 1;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Calendar cells generation
  const cells = [];
  // Previous month padding
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    cells.push({
      date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }
  // Next month padding
  const totalCells = Math.ceil(cells.length / 7) * 7;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const paddingNeeded = totalCells - cells.length;
  for (let i = 1; i <= paddingNeeded; i++) {
    cells.push({
      date: new Date(nextYear, nextMonth, i),
      isCurrentMonth: false,
    });
  }

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const isToday = (someDate) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  // Get color based on scope/type
  const getEventBg = (scope) => {
    if (scope === "Web Development" || scope === "AI/ML") return "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
    if (scope === "technical") return "bg-cyan-500/15 text-cyan-300 border-cyan-400/20";
    if (scope === "corporate" || scope === "Events") return "bg-purple-500/15 text-purple-300 border-purple-400/20";
    return "bg-amber-500/15 text-amber-300 border-amber-400/20";
  };

  const handleCreateMeet = async (e) => {
    e.preventDefault();
    if (!title || !startDateStr || !startTimeStr || !meetLink) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/meet/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          startdate: startDateStr,
          starttime: `${startDateStr}T${startTimeStr}:00.000Z`,
          link: meetLink,
          description,
          teamScope,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Meeting Scheduled Successfully!");
        setIsModalOpen(false);
        // Clear inputs
        setTitle("");
        setStartDateStr("");
        setStartTimeStr("");
        setMeetLink("");
        setDescription("");
        setTeamScope("all");
        fetchMeetings();
      } else {
        toast.error(data.message || "Failed to schedule meeting");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to the backend server");
    } finally {
      setSubmitting(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const todayMeetings = meetings.filter((m) => {
    const mDate = new Date(m.startDate);
    return isToday(mDate);
  });

  const upcomingMeetings = meetings.filter((m) => {
    const mDate = new Date(m.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return mDate > today && !isToday(mDate);
  });

  const isOrganizer = canScheduleMeet;

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] pt-16 lg:pl-24 selection:bg-primary/30 flex flex-col font-body">
      <Navbar />
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left Column: Calendar */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6">
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline text-white tracking-wide">
                {monthNames[month]} {year}
              </h1>
              <p className="text-[#aea9b6] text-xs tracking-wider uppercase mt-1">Command Timeline View</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-white/8 bg-white/4 p-1">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/8 hover:bg-white/12 rounded-lg transition-all"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>

              {isOrganizer && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-secondary text-black font-headline font-bold px-5 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(241,131,255,0.25)] active:scale-95 transition-all duration-300 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg font-bold">add</span>
                  Deploy Meeting
                </button>
              )}
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="flex-grow border border-white/8 bg-[#090812]/52 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {/* Days header */}
            <div className="grid grid-cols-7 border-b border-white/8 bg-white/2 text-center py-3">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                <div key={d} className="text-xs font-bold tracking-widest text-[#aea9b6] font-label">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 grid-rows-5 flex-grow divide-x divide-y divide-white/8 border-l border-t border-transparent">
              {cells.map((cell, idx) => {
                const dayMeetings = meetings.filter((m) => {
                  const mDate = new Date(m.startDate);
                  return (
                    mDate.getDate() === cell.date.getDate() &&
                    mDate.getMonth() === cell.date.getMonth() &&
                    mDate.getFullYear() === cell.date.getFullYear()
                  );
                });

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 flex flex-col gap-1.5 transition-all duration-200 ${cell.isCurrentMonth ? "bg-transparent" : "bg-[#0b0a13]/30 opacity-40"
                      } ${isToday(cell.date) ? "bg-primary/5 border border-primary/20 relative" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-bold font-label flex items-center justify-center h-6 w-6 rounded-full ${isToday(cell.date)
                            ? "bg-primary text-black shadow-[0_0_10px_rgba(241,131,255,0.4)]"
                            : "text-[#aea9b6]"
                          }`}
                      >
                        {cell.date.getDate()}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-none">
                      {dayMeetings.map((meet) => (
                        <div
                          key={meet._id}
                          title={`${meet.title}\nScope: ${meet.teamScope}`}
                          onClick={() => setSelectedMeeting(meet)}
                          className={`cursor-pointer text-[10px] font-semibold py-0.5 px-1.5 rounded border leading-tight truncate hover:scale-[1.02] transition-transform ${getEventBg(
                            meet.teamScope
                          )}`}
                        >
                          {meet.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side Panel: Agenda & Feed */}
        <div className="w-full lg:w-96 shrink-0 border-l border-white/8 bg-[#090814]/90 backdrop-blur-3xl p-6 lg:p-8 flex flex-col gap-8">
          {/* Today's Agenda Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-white tracking-wide">Today's Agenda</h2>
            <div className="space-y-3">
              {todayMeetings.length === 0 ? (
                <div className="rounded-xl border border-white/6 bg-white/2 p-5 text-center text-[#aea9b6] text-xs">
                  No briefings scheduled for today
                </div>
              ) : (
                todayMeetings.map((meet) => {
                  const mTime = meet.startTime
                    ? new Date(meet.startTime).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false
                    })
                    : "10:00";
                  return (
                    <div
                      key={meet._id}
                      className="rounded-xl border border-primary/20 bg-primary/4 p-4 space-y-3 relative overflow-hidden shadow-[0_5px_15px_rgba(241,131,255,0.05)]"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold bg-[#ff6c95]/15 border border-[#ff6c95]/20 text-[#ff6c95] px-2 py-0.5 rounded-full font-label uppercase tracking-widest animate-pulse">
                          In Progress
                        </span>
                        <span className="text-[10px] text-[#aea9b6] font-semibold">
                          {mTime} UTC
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{meet.title}</h4>
                        <p className="text-xs text-[#aea9b6] mt-1 line-clamp-2">{meet.description || "No description provided."}</p>
                      </div>
                      <a
                        href={meet.meetlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-gradient-to-r from-primary to-secondary text-black font-headline font-bold py-2 rounded-lg text-xs shadow-[0_3px_10px_rgba(241,131,255,0.2)] hover:scale-[1.01] active:scale-95 transition-all"
                      >
                        Join Now
                      </a>
                    </div>
                  );
                })
              )}

              {/* Upcoming preview list */}
              {upcomingMeetings.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#aea9b6]">Upcoming Days</h3>
                  {upcomingMeetings.slice(0, 2).map((meet) => {
                    const meetDate = new Date(meet.startDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <div
                        key={meet._id}
                        className="rounded-lg border border-white/6 bg-white/2 p-3 flex justify-between items-center text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-white truncate">{meet.title}</p>
                          <p className="text-[10px] text-[#aea9b6] mt-0.5">{meetDate}</p>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-[#81ecff]">
                          {meet.teamScope}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Global Hotkeys Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-white tracking-wide">Global Hotkeys</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Quick Deploy", keys: "CTRL + N", icon: "bolt" },
                { label: "Shift Log", keys: "CTRL + L", icon: "schedule" },
                { label: "Data Dump", keys: "CTRL + D", icon: "database" },
                { label: "Console", keys: "CTRL + -", icon: "terminal" },
              ].map((hk) => (
                <div
                  key={hk.label}
                  className="rounded-xl border border-white/6 bg-white/2 p-3 flex flex-col gap-2 hover:bg-white/4 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#ff6c95] text-lg">{hk.icon}</span>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#aea9b6] uppercase tracking-wider">{hk.label}</h4>
                    <p className="text-xs font-bold text-white mt-0.5 font-label">{hk.keys}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Command Center Feed Section */}
          <div className="space-y-4 flex-grow flex flex-col">
            <h2 className="text-xl font-bold font-headline text-white tracking-wide">Command Center Feed</h2>
            <div className="flex-grow rounded-xl border border-white/6 bg-white/2 p-4 flex flex-col gap-4 overflow-y-auto max-h-[160px]">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <div>
                  <p className="text-white/90">Uplink D4 verified meeting room "Void"</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Just now</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-pink-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(244,114,182,0.6)]" />
                <div>
                  <p className="text-white/90">Priority Alert: Sector 7 briefing starts in 5m</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">3 mins ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-white/90">Archive: Q3 Review log moved to storage</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Deploy Briefing Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/72 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0a15]/95 backdrop-blur-[24px] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Background cyber glowing details */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold font-headline text-white tracking-wide">Deploy New Briefing</h3>
                <p className="text-[#aea9b6] text-xs mt-1">Initialize meeting schedule logs</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#aea9b6] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateMeet} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                  Briefing Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tactical Review: Sector 7"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                  Secure Meeting Link (URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/..."
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                  Domain/Team Scope
                </label>
                <select
                  value={teamScope}
                  onChange={(e) => setTeamScope(e.target.value)}
                  className="w-full bg-[#0d0c16] border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="all">All Members</option>
                  <option value="technical">Technical Division</option>
                  <option value="corporate">Corporate Division</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Events">Events</option>
                  <option value="Creatives">Creatives</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                  Briefing Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline topics, protocols, or agenda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-white/10 hover:bg-white/4 text-white rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-primary to-secondary text-black font-headline font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(241,131,255,0.25)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? "Deploying..." : "Deploy Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/72 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0a15]/95 backdrop-blur-[24px] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mb-2 inline-block ${getEventBg(selectedMeeting.teamScope)}`}>
                  {selectedMeeting.teamScope}
                </span>
                <h3 className="text-2xl font-bold font-headline text-white tracking-wide">{selectedMeeting.title}</h3>
                <p className="text-[#81ecff] text-xs font-semibold mt-1">
                  {new Date(selectedMeeting.startDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at {new Date(selectedMeeting.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-[#aea9b6] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] mb-1">Description</h4>
                <p className="text-sm text-white/90 bg-white/4 border border-white/8 rounded-xl p-3">
                  {selectedMeeting.description || "No description provided."}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-5 py-2.5 border border-white/10 hover:bg-white/4 text-white rounded-xl text-sm transition-colors"
              >
                Close
              </button>
              <a
                href={selectedMeeting.meetlink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedMeeting(null)}
                className="bg-gradient-to-r from-primary to-secondary text-black font-headline font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(241,131,255,0.25)] hover:scale-[1.02] active:scale-95 transition-all inline-block"
              >
                Join Meeting
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
