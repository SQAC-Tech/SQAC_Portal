import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../components/common/layout/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import { usePermissions } from "../utils/usePermissions";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Meet() {
  const { canScheduleMeet, isBoardMember } = usePermissions();
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

  // Minutes of Meeting (MOM) for the selected meeting
  const [mom, setMom] = useState(null);
  const [momLoading, setMomLoading] = useState(false);
  const [momError, setMomError] = useState("");
  const [showMom, setShowMom] = useState(false);

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

  // When a meeting is opened, load its Minutes of Meeting (if one is linked)
  useEffect(() => {
    setMom(null);
    setMomError("");
    setShowMom(false);

    const momId = selectedMeeting?.momRef;
    if (!momId) return;

    let cancelled = false;
    (async () => {
      setMomLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/mom/${momId}`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (cancelled) return;
        if (res.ok) {
          setMom(await res.json());
        } else if (res.status === 403) {
          setMomError("You don't have access to these minutes.");
        } else {
          setMomError("Minutes not available.");
        }
      } catch (err) {
        if (!cancelled) setMomError("Couldn't load the minutes.");
      } finally {
        if (!cancelled) setMomLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedMeeting]);

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
    if (scope === "board") return "bg-[#f183ff]/15 text-[#f183ff] border-[#f183ff]/25";
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
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] lg:pl-28 selection:bg-primary/30 flex flex-col font-body">
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
              <p className="text-[#aea9b6] text-xs tracking-wider uppercase mt-1">Meeting Schedule</p>
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
                  New Meeting
                </button>
              )}
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="relative flex-grow overflow-x-auto overflow-y-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)] flex flex-col">
            {/* Days header */}
            <div className="grid grid-cols-7 min-w-[620px] border-b border-white/8 bg-white/2 text-center py-3">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                <div key={d} className="text-xs font-bold tracking-widest text-[#aea9b6] font-label">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 grid-rows-5 min-w-[620px] flex-grow divide-x divide-y divide-white/8 border-l border-t border-transparent">
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
                    className={`min-h-[100px] p-2 flex flex-col gap-1.5 transition-all duration-200 ${cell.isCurrentMonth ? "bg-transparent" : "bg-[#070910]/30 opacity-40"
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
        <div className="w-full lg:w-96 shrink-0 border-l border-white/8 bg-[#0c0f1a]/90 backdrop-blur-3xl p-6 lg:p-8 flex flex-col gap-8">
          {/* Today's Agenda Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-white tracking-wide">Today's Agenda</h2>
            <div className="space-y-3">
              {todayMeetings.length === 0 ? (
                <div className="rounded-xl border border-white/6 bg-white/2 p-5 text-center text-[#aea9b6] text-xs">
                  No meetings today
                </div>
              ) : (
                todayMeetings.map((meet) => {
                  const mTime = meet.startTime
                    ? new Date(meet.startTime).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false
                    })
                    : "TBD";
                  return (
                    <div
                      key={meet._id}
                      className="rounded-xl border border-primary/20 bg-primary/4 p-4 space-y-3 relative overflow-hidden shadow-[0_5px_15px_rgba(241,131,255,0.05)]"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold bg-[#ff6c95]/15 border border-[#ff6c95]/20 text-[#ff6c95] px-2 py-0.5 rounded-full font-label uppercase tracking-widest">
                          Today
                        </span>
                        <span className="text-[10px] text-[#aea9b6] font-semibold">
                          {mTime}
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
        </div>
      </main>

      {/* New Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/72 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0f1a]/95 backdrop-blur-[24px] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold font-headline text-white tracking-wide">New Meeting</h3>
                <p className="text-[#aea9b6] text-xs mt-1">Schedule a meeting for your team</p>
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
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Web Dev Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Meeting Link (URL) *
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
                  className="w-full bg-[#0c0f1a] border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="all">All Members</option>
                  {isBoardMember && <option value="board">Board Members</option>}
                  <option value="technical">Technical Division</option>
                  <option value="corporate">Corporate Division</option>
                  <option value="Web Development">Web Development</option>
                  <option value="App Development">App Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Events">Events</option>
                  <option value="Media">Media</option>
                  <option value="Sponsorships">Sponsorships</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                  Description
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
                  {submitting ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/72 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0f1a]/95 backdrop-blur-[24px] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
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

              {/* Minutes of Meeting */}
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] mb-1">Minutes of Meeting</h4>
                {momLoading ? (
                  <p className="text-xs text-[#aea9b6] bg-white/4 border border-white/8 rounded-xl p-3">Loading minutes…</p>
                ) : mom ? (
                  <button
                    type="button"
                    onClick={() => setShowMom(true)}
                    className="w-full flex items-center justify-between gap-3 bg-tertiary/10 border border-tertiary/25 rounded-xl p-3 text-left hover:bg-tertiary/15 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{mom.title}</p>
                      <p className="text-[11px] text-[#aea9b6] mt-0.5">
                        {(mom.discussedPoints?.length || 0)} points · {(mom.decisions?.length || 0)} decisions · {(mom.actionItems?.length || 0)} actions
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-tertiary group-hover:translate-x-0.5 transition-transform">description</span>
                  </button>
                ) : (
                  <p className="text-xs text-[#aea9b6] bg-white/4 border border-white/8 rounded-xl p-3">
                    {momError || "No minutes recorded for this meeting yet."}
                  </p>
                )}
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

      {/* Minutes of Meeting Popup */}
      {showMom && mom && (
        <div
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 py-8"
          onClick={() => setShowMom(false)}
        >
          <div
            className="w-full max-w-2xl max-h-full overflow-y-auto rounded-3xl border border-white/10 bg-[#0c0f1a]/97 backdrop-blur-[24px] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />

            <div className="flex justify-between items-start mb-6">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#81ecff] mb-1">Minutes of Meeting</p>
                <h3 className="text-2xl font-bold font-headline text-white tracking-wide">{mom.title}</h3>
                <p className="text-xs text-[#aea9b6] mt-1">
                  {new Date(mom.date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  {mom.startTime ? ` · ${mom.startTime}` : ""}
                  {mom.duration ? ` · ${mom.duration}` : ""}
                </p>
              </div>
              <button
                onClick={() => setShowMom(false)}
                className="text-[#aea9b6] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 shrink-0"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {mom.description && (
                <p className="text-sm text-white/90 bg-white/4 border border-white/8 rounded-xl p-4">{mom.description}</p>
              )}

              {mom.attendees?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] mb-2">Attendees ({mom.attendees.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {mom.attendees.map((a, i) => (
                      <span key={i} className="text-xs text-white/85 bg-white/5 border border-white/8 rounded-full px-3 py-1">
                        {a.name}{a.role ? ` · ${a.role}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mom.discussedPoints?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] mb-2">Discussion Points</h4>
                  <ul className="space-y-1.5">
                    {mom.discussedPoints.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/90">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {mom.decisions?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] mb-2">Key Decisions</h4>
                  <ul className="space-y-1.5">
                    {mom.decisions.map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/90">
                        <span className="h-2 w-2 rounded-sm bg-tertiary mt-1.5 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {mom.actionItems?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] mb-2">Action Items</h4>
                  <div className="overflow-x-auto rounded-xl border border-white/8">
                    <table className="w-full min-w-[420px] text-left text-xs">
                      <thead className="bg-white/4 text-[#aea9b6]">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Task</th>
                          <th className="px-3 py-2 font-semibold">Assignee</th>
                          <th className="px-3 py-2 font-semibold">Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6">
                        {mom.actionItems.map((a, i) => (
                          <tr key={i} className="text-white/90">
                            <td className="px-3 py-2">{a.task}</td>
                            <td className="px-3 py-2 text-white/70">{a.assignee || "—"}</td>
                            <td className="px-3 py-2 text-white/70">
                              {a.dueDate ? new Date(a.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(mom.nextMeetDate || mom.nextMeetAgenda) && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] mb-1">Next Meeting</h4>
                  {mom.nextMeetDate && (
                    <p className="text-sm font-semibold text-white">
                      {new Date(mom.nextMeetDate).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                  )}
                  {mom.nextMeetAgenda && <p className="text-xs text-white/80 mt-1">{mom.nextMeetAgenda}</p>}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowMom(false)}
                className="px-5 py-2.5 border border-white/10 hover:bg-white/4 text-white rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
