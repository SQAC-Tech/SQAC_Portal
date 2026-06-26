import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import SQACLogo from "../../ui/SQACLogo";
import MobileNav from "./MobileNav";
import MobileBottomNav from "./MobileBottomNav";
import { ROLE_LABELS } from "../../../utils/memberHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState("");
  const [user, setUser] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Read user details from localStorage
    const savedUser = localStorage.getItem("user");
    let parsedUser = null;
    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user details:", e);
      }
    }

    // Only Secretary sees pending approvals
    const isAdmin = parsedUser && parsedUser.role === "secretary";

    // Fetch notices and meetings to construct notifications
    const fetchNotifications = async () => {
      try {
        const [noticesRes, meetsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/notices`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
          }),
          fetch(`${API_BASE_URL}/meet/getmeet`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
          }),
        ]);

        let items = [];
        if (noticesRes.ok) {
          const notices = await noticesRes.json();
          items = items.concat(
            (Array.isArray(notices) ? notices : []).map((notice) => ({
              id: notice._id,
              type: "notice",
              title: notice.title,
              description: notice.desc || notice.description,
              date: new Date(notice.createdAt),
            }))
          );
        }

        if (meetsRes.ok) {
          const meets = await meetsRes.json();
          items = items.concat(
            (Array.isArray(meets) ? meets : []).map((meet) => ({
              id: meet._id,
              type: "meet",
              title: `Meeting: ${meet.title}`,
              description: `Scheduled for ${new Date(meet.startDate).toLocaleDateString()} at ${meet.startTime ? meet.startTime.split("T")[1]?.slice(0, 5) || "TBD" : "TBD"}`,
              date: new Date(meet.createdAt || meet.updatedAt),
            }))
          );
        }

        // Sort items by date descending
        items.sort((a, b) => b.date - a.date);

        // Limit to 8 notifications
        const latestItems = items.slice(0, 8);
        setNotifications(latestItems);

        let pendingList = [];
        if (isAdmin) {
          const pendingRes = await fetch(`${API_BASE_URL}/admin/pending`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (pendingRes.ok) {
            const data = await pendingRes.json();
            pendingList = Array.isArray(data) ? data : [];
          }
        }
        setPendingApprovals(pendingList);

        // Mock unread count based on unseen IDs + pending signups
        const seenIds = JSON.parse(localStorage.getItem("seenNotifications") || "[]");
        const newUnread = latestItems.filter((item) => !seenIds.includes(item.id)).length;
        setUnreadCount(newUnread + pendingList.length);
      } catch (err) {
        console.error("Failed to fetch notification items:", err);
      }
    };

    fetchNotifications();

    // Poll every 45 seconds for updates
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) {
      // Mark all current items as read
      const seenIds = notifications.map((item) => item.id);
      localStorage.setItem("seenNotifications", JSON.stringify(seenIds));
      setUnreadCount(pendingApprovals.length);
    }
  };

  const handleApprove = async (memberId) => {
    setActionLoading(memberId);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/approve/${memberId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json().catch(() => null);
      if (response.ok) {
        toast.success("Member approved successfully!");
        setPendingApprovals((prev) => prev.filter((m) => m._id !== memberId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(data?.message || data?.error || "Approval failed.");
      }
    } catch (err) {
      toast.error("Network error during approval.");
      console.error(err);
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = (memberId) => {
    setRejectingId(memberId);
    setRejectionReason("");
  };

  const submitReject = async () => {
    if (!rejectingId) return;
    setActionLoading(rejectingId);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reject/${rejectingId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok) {
        toast.success("Member rejected.");
        setPendingApprovals((prev) => prev.filter((m) => m._id !== rejectingId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(data?.message || data?.error || "Rejection failed.");
      }
    } catch (err) {
      toast.error("Network error during rejection.");
      console.error(err);
    } finally {
      setActionLoading("");
      setRejectingId(null);
      setRejectionReason("");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    } finally {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const isSecretary = user?.role === "secretary";

  return (
    <nav className="sticky top-0 z-[100] h-16 border-b border-white/8 bg-[#070910]/90 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between">

      {/* Left: hamburger (mobile) + brand */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-white lg:hidden"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <Link to="/dashboard" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-[0_0_18px_rgba(241,131,255,0.25)]">
            <SQACLogo size={22} />
          </span>
          <div className="leading-tight">
            <p className="font-headline text-lg font-bold tracking-wider text-white transition-colors group-hover:text-primary">
              SQAC <span className="font-light text-[#ff6c95]">Portal</span>
            </p>
            <p className="hidden text-[10px] uppercase tracking-[0.35em] text-white/35 sm:block">
              Software Quality Assurance Community
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="relative p-2.5 rounded-xl border border-white/8 bg-white/4 text-white/70 hover:text-white hover:bg-white/8 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#ff6c95] text-[9px] font-black text-black flex items-center justify-center leading-none ring-2 ring-[#070910]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="fixed left-2 right-2 top-[4.25rem] z-[110] rounded-2xl border border-white/10 bg-[#0c0f1a]/96 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.7)] overflow-hidden sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[360px]">

              {/* Panel Header */}
              <div className="px-4 pt-4 pb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-[#ff6c95]/15 border border-[#ff6c95]/30 text-[#ff6c95] px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                {/* Tabs — only show Approvals tab for Secretary */}
                <div className="flex gap-1 bg-white/4 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("feed")}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      activeTab === "feed"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/45 hover:text-white/70"
                    }`}
                  >
                    Feed
                  </button>
                  {isSecretary && (
                    <button
                      onClick={() => setActiveTab("approvals")}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                        activeTab === "approvals"
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-white/45 hover:text-white/70"
                      }`}
                    >
                      Approvals
                      {pendingApprovals.length > 0 && (
                        <span className="bg-[#ff6c95] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                          {pendingApprovals.length}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Feed Tab ── */}
              {activeTab === "feed" && (
                <div className="mt-3 max-h-[340px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-2 text-white/30">
                      <span className="material-symbols-outlined text-3xl">notifications_off</span>
                      <p className="text-xs">Nothing new here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {notifications.map((item) => {
                        const isMeet = item.type === "meet";
                        return (
                          <div key={item.id} className="flex gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors">
                            <div className={`shrink-0 mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center ${
                              isMeet
                                ? "bg-violet-500/15 border border-violet-400/20 text-violet-300"
                                : "bg-cyan-500/15 border border-cyan-400/20 text-cyan-300"
                            }`}>
                              <span className="material-symbols-outlined text-[16px]">
                                {isMeet ? "calendar_month" : "campaign"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-white text-xs font-semibold leading-snug">{item.title}</p>
                                <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                  isMeet
                                    ? "bg-violet-500/15 text-violet-400"
                                    : "bg-cyan-500/15 text-cyan-400"
                                }`}>
                                  {isMeet ? "Meet" : "Notice"}
                                </span>
                              </div>
                              <p className="text-white/45 text-[11px] mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
                              <p className="text-white/25 text-[10px] mt-1">{timeAgo(item.date)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="px-4 py-3 border-t border-white/6">
                    <Link
                      to="/admin/notice"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center justify-center gap-1.5 text-[11px] text-white/40 hover:text-primary font-semibold transition-colors"
                    >
                      View all notices
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ── Approvals Tab ── */}
              {activeTab === "approvals" && isSecretary && (
                <div className="mt-3 max-h-[380px] overflow-y-auto">
                  {pendingApprovals.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-2 text-white/30">
                      <span className="material-symbols-outlined text-3xl">how_to_reg</span>
                      <p className="text-xs">No pending approvals</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 px-3 pb-3">
                      {pendingApprovals.map((member) => (
                        <div key={member._id} className="py-3.5">
                          <div className="flex gap-3 items-start">
                            {/* Avatar */}
                            <div className="shrink-0 h-10 w-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                              <img
                                src={member.image || "https://images.unsplash.com/photo-1680355466468-bd0a68b11fa0?q=80&w=100"}
                                alt={member.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-bold truncate">{member.name}</p>
                              <p className="text-white/40 text-[10px] truncate">{member.email}</p>

                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {/* Role badge */}
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 text-[#f183ff]">
                                  {ROLE_LABELS[member.role] || member.role}
                                </span>
                                {/* Domain badge */}
                                {(member.subDomain || member.coreDomain) && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/6 border border-white/10 text-white/50">
                                    {member.subDomain || member.coreDomain}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Reg number */}
                            <p className="shrink-0 text-[9px] text-white/25 font-mono mt-0.5">{member.regNum}</p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleApprove(member._id)}
                              disabled={actionLoading === member._id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border border-emerald-400/20 bg-emerald-500/8 text-emerald-300 hover:bg-emerald-500/18 disabled:opacity-40 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              {actionLoading === member._id ? "Approving…" : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(member._id)}
                              disabled={actionLoading === member._id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border border-red-400/20 bg-red-500/8 text-red-300 hover:bg-red-500/18 disabled:opacity-40 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              {actionLoading === member._id ? "Rejecting…" : "Reject"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── User Pill ── */}
        {user && (
          <div className="flex items-center gap-2.5 pl-4 border-l border-white/8">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-primary/70 uppercase tracking-widest leading-none mt-0.5">
                {ROLE_LABELS[user.role] || user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/8 transition-all group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">logout</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Rejection Reason Modal ── */}
      {rejectingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0f1a]/98 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-lg">report</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Reject Application</h3>
                <p className="text-white/40 text-[11px]">Reason is optional but recommended</p>
              </div>
            </div>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-red-400/40 resize-none transition-colors"
              rows={3}
              placeholder="e.g. Incomplete profile, domain mismatch…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={!!actionLoading}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-red-500/15 border border-red-400/25 text-red-300 hover:bg-red-500/25 disabled:opacity-40 transition-all"
              >
                {actionLoading ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile navigation drawer (full list, opened via "More") ── */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      {/* ── Always-visible bottom nav bar on phones/tablets ── */}
      <MobileBottomNav user={user} onMore={() => setMobileNavOpen(true)} />

    </nav>
  );
}
