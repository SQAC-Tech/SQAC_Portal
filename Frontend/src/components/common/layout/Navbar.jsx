import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState("");
  const [user, setUser] = useState(null);
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

    const isAdmin = parsedUser && (parsedUser.role === "admin" || parsedUser.role === "subadmin" || parsedUser.role === "lead");

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

  const handleReject = async (memberId) => {
    setActionLoading(memberId);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reject/${memberId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json().catch(() => null);
      if (response.ok) {
        toast.success("Member rejected successfully!");
        setPendingApprovals((prev) => prev.filter((m) => m._id !== memberId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(data?.message || data?.error || "Rejection failed.");
      }
    } catch (err) {
      toast.error("Network error during rejection.");
      console.error(err);
    } finally {
      setActionLoading("");
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-16 border-b border-white/8 bg-[#070910]/82 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Visual Brand Indicator */}
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#f183ff] to-[#ff6c95] flex items-center justify-center font-headline font-bold text-black text-sm shadow-[0_0_15px_rgba(241,131,255,0.4)]">
          SQ
        </div>
        <Link to="/dashboard" className="font-headline text-lg font-bold text-white tracking-wider hover:text-primary transition-colors">
          SQAC <span className="text-[#ff6c95] font-light">Portal</span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="relative p-2 rounded-xl border border-white/8 bg-white/4 text-white/80 hover:text-white hover:bg-white/8 transition-all hover:scale-[1.03] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#ff6c95] ring-2 ring-[#070910] animate-pulse" />
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#0c0a15]/95 backdrop-blur-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-4 overflow-hidden z-[100]">
              <div className="px-5 pb-3 border-b border-white/8 flex justify-between items-center">
                <h3 className="font-headline font-bold text-white text-sm tracking-wide">Command Center Feed</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                    {unreadCount} NEW
                  </span>
                )}
              </div>

              {/* Pending Approvals Section */}
              {pendingApprovals.length > 0 && (
                <div className="border-b border-white/8 bg-white/[0.02] max-h-[220px] overflow-y-auto divide-y divide-white/4">
                  <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff6c95] sticky top-0 bg-[#0c0a15] z-10">
                    Pending Approvals ({pendingApprovals.length})
                  </div>
                  {pendingApprovals.map((member) => (
                    <div key={member._id} className="p-4 flex flex-col gap-2">
                      <div className="flex gap-3 items-center">
                        <div className="shrink-0 h-8 w-8 rounded-full overflow-hidden border border-white/10 bg-white/5">
                          <img 
                            src={member.image || "https://images.unsplash.com/photo-1680355466468-bd0a68b11fa0?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                            alt={member.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{member.name}</p>
                          <p className="text-[#aea9b6] text-[10px] truncate">{member.email}</p>
                          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider truncate">
                            {member.coreDomain} {member.subDomain ? `/ ${member.subDomain}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end mt-1">
                        <button
                          onClick={() => handleApprove(member._id)}
                          disabled={actionLoading === member._id}
                          className="px-3 py-1 text-[10px] font-bold rounded-lg border border-emerald-400/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {actionLoading === member._id ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          onClick={() => handleReject(member._id)}
                          disabled={actionLoading === member._id}
                          className="px-3 py-1 text-[10px] font-bold rounded-lg border border-red-400/25 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="max-h-[220px] overflow-y-auto divide-y divide-white/4">
                {notifications.length === 0 ? (
                  <div className="py-8 px-5 text-center text-[#aea9b6] text-xs">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-white/4 transition-colors flex gap-3 items-start">
                      <div className={`mt-0.5 shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${
                        item.type === "meet" 
                          ? "bg-purple-500/10 text-purple-300 border border-purple-400/20" 
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {item.type === "meet" ? "calendar_month" : "campaign"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                        <p className="text-[#aea9b6] text-[11px] mt-1 leading-relaxed">{item.description}</p>
                        <p className="text-slate-500 text-[10px] mt-1.5">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-5 pt-3 border-t border-white/8 text-center">
                <Link
                  to="/admin/notice"
                  onClick={() => setShowDropdown(false)}
                  className="text-xs text-primary hover:text-secondary font-semibold transition-colors uppercase tracking-wider"
                >
                  View All Notices →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Identity Profile Indicator */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-primary/80 uppercase tracking-widest leading-none mt-1 font-semibold">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center text-white hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/8 transition-all duration-300 group"
              title="Logout"
            >
              <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
