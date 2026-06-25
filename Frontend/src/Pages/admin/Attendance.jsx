import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../../components/common/layout/Navbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { usePermissions } from "../../utils/usePermissions";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AttendancePage() {
  const { canManageAttendance } = usePermissions();
  const [attendanceList, setAttendanceList] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // Form states
  const [selectedUserId, setSelectedUserId] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [clockInStr, setClockInStr] = useState("");
  const [clockOutStr, setClockOutStr] = useState("");
  const [status, setStatus] = useState("present");
  const [meetType, setMeetType] = useState("gmeet");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");

  useEffect(() => {
    fetchAttendance();
    fetchMembers();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/all`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceList(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to load attendance logs");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading attendance logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/members`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch members list:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const openNewModal = () => {
    setEditingRecord(null);
    setSelectedUserId("");
    
    // Set default values for date & clockIn to current date/time
    const now = new Date();
    const localDate = now.toISOString().split("T")[0];
    const localTime = now.toTimeString().slice(0, 5);
    
    setDateStr(localDate);
    setClockInStr(localTime);
    setClockOutStr("");
    setStatus("present");
    setMeetType("gmeet");
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setSelectedUserId(record.userId?._id || "");
    
    const d = new Date(record.date);
    const dStr = d.toISOString().split("T")[0];
    
    const cIn = new Date(record.clockIn);
    const cInStr = cIn.toTimeString().slice(0, 5);
    
    let cOutStr = "";
    if (record.clockOut) {
      const cOut = new Date(record.clockOut);
      cOutStr = cOut.toTimeString().slice(0, 5);
    }

    setDateStr(dStr);
    setClockInStr(cInStr);
    setClockOutStr(cOutStr);
    setStatus(record.status || "present");
    setMeetType(record.meetType || "gmeet");
    setIsModalOpen(true);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !dateStr || !clockInStr) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const isoClockIn = `${dateStr}T${clockInStr}:00.000Z`;
      const isoClockOut = clockOutStr ? `${dateStr}T${clockOutStr}:00.000Z` : null;

      const payload = {
        userID: selectedUserId,
        date: `${dateStr}T00:00:00.000Z`,
        clockIn: isoClockIn,
        clockOut: isoClockOut,
        status,
        meetType,
      };

      const url = editingRecord 
        ? `${API_BASE_URL}/attendance/edit/${editingRecord._id}`
        : `${API_BASE_URL}/attendance/add`;

      const method = editingRecord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(editingRecord ? "Attendance Updated!" : "Attendance Registered!");
        setIsModalOpen(false);
        fetchAttendance();
      } else {
        toast.error(data.message || "Failed to save record");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return attendanceList.filter((rec) => {
      const user = rec.userId || {};
      const name = user.name || "";
      const email = user.email || "";
      const domain = user.coreDomain || "";

      const matchesSearch = 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
      const matchesDomain = domainFilter === "all" || domain === domainFilter;

      return matchesSearch && matchesStatus && matchesDomain;
    });
  }, [attendanceList, searchQuery, statusFilter, domainFilter]);

  // Generate stats
  const stats = useMemo(() => {
    const total = attendanceList.length;
    const present = attendanceList.filter(r => r.status === "present" || r.status === "late").length;
    const absent = attendanceList.filter(r => r.status === "absent").length;
    const excused = attendanceList.filter(r => r.status === "excused").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, excused, rate };
  }, [attendanceList]);

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] lg:pl-24 selection:bg-primary/30 flex flex-col font-body">
      <Navbar />
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-grow p-6 lg:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/8 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">Command Centre</p>
            <h1 className="text-3xl font-bold font-headline text-white mt-1 tracking-wide">
              Attendance Records
            </h1>
          </div>
          <button
            onClick={openNewModal}
            disabled={!canManageAttendance}
            title={!canManageAttendance ? "You don't have permission to mark attendance" : undefined}
            className="bg-gradient-to-r from-primary to-secondary text-black font-headline font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(241,131,255,0.25)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <span className="material-symbols-outlined text-lg font-bold">add</span>
            Mark Attendance
          </button>
        </div>

        {/* Dashboard Grid Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Submissions", value: stats.total, icon: "analytics", color: "text-[#81ecff]" },
            { label: "Attendance Rate", value: `${stats.rate}%`, icon: "trending_up", color: "text-emerald-400" },
            { label: "Absences Logged", value: stats.absent, icon: "close", color: "text-[#ff6c95]" },
            { label: "Excused Logs", value: stats.excused, icon: "event_busy", color: "text-amber-400" },
          ].map((st, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/8 bg-[#090812]/52 backdrop-blur-xl p-5 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            >
              <div>
                <p className="text-[10px] font-bold text-[#aea9b6] uppercase tracking-wider">{st.label}</p>
                <p className={`text-2xl font-bold font-headline mt-1.5 ${st.color}`}>{st.value}</p>
              </div>
              <span className={`material-symbols-outlined text-3xl opacity-20 ${st.color}`}>{st.icon}</span>
            </div>
          ))}
        </div>

        {/* Table Filters Section */}
        <div className="rounded-2xl border border-white/8 bg-[#090812]/52 backdrop-blur-xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <div className="w-full md:max-w-md">
            <label className="relative block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                search
              </span>
              <input
                className="w-full rounded-full border border-white/10 bg-white/6 py-2.5 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:border-primary/60 focus:bg-white/10"
                placeholder="Search by member name or email"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#aea9b6] uppercase tracking-wider font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0b0a13] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
              >
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>

            {/* Division Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#aea9b6] uppercase tracking-wider font-semibold">Division:</span>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="bg-[#0b0a13] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
              >
                <option value="all">All Divisions</option>
                <option value="Technical">Technical</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Log Table */}
        <div className="border border-white/8 bg-[#090812]/52 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2 border-b border-white/8 text-[#aea9b6] text-xs font-bold font-label tracking-wider uppercase">
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Reg No / Domain</th>
                  <th className="px-6 py-4">Briefing Date</th>
                  <th className="px-6 py-4">Clock In / Out</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Meet Type</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4 text-sm text-white/85">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#aea9b6]">
                      <span className="inline-block animate-pulse">Accessing attendance records database...</span>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#aea9b6]">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const recUser = record.userId || {};
                    const name = recUser.name || "Unknown";
                    const email = recUser.email || "N/A";
                    const regNo = recUser.regNum || "N/A";
                    const domain = recUser.coreDomain || "N/A";
                    const subDomain = recUser.subDomain ? ` / ${recUser.subDomain}` : "";

                    const formattedDate = new Date(record.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });

                    const formatTime = (timeStr) => {
                      if (!timeStr) return "--:--";
                      return new Date(timeStr).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                      });
                    };

                    const statusColors = {
                      present: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
                      absent: "bg-[#ff6c95]/10 text-[#ff6c95] border-[#ff6c95]/20",
                      late: "bg-amber-400/10 text-amber-300 border-amber-400/20",
                      excused: "bg-purple-400/10 text-purple-300 border-purple-400/20"
                    };

                    const meetTypes = {
                      gmeet: "Google Meet",
                      in_person: "In Person",
                      custom: "Custom Link"
                    };

                    return (
                      <tr key={record._id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-white">{name}</p>
                            <p className="text-xs text-[#aea9b6] mt-0.5">{email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{regNo}</p>
                            <p className="text-xs text-[#aea9b6] mt-0.5">{domain}{subDomain}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold">{formattedDate}</td>
                        <td className="px-6 py-4 font-semibold">
                          {formatTime(record.clockIn)} - {formatTime(record.clockOut)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                            statusColors[record.status] || "bg-slate-500/10 text-slate-300 border-slate-500/20"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-xs text-[#81ecff]">
                          {meetTypes[record.meetType] || record.meetType}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openEditModal(record)}
                            disabled={!canManageAttendance}
                            className="p-1.5 rounded-lg border border-white/10 hover:border-primary/40 text-[#aea9b6] hover:text-primary transition-colors flex items-center justify-center mx-auto disabled:opacity-30 disabled:cursor-not-allowed"
                            title={!canManageAttendance ? "You don't have permission to edit attendance" : "Edit Record"}
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Attendance Form Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/72 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0a15]/95 backdrop-blur-[24px] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold font-headline text-white tracking-wide">
                  {editingRecord ? "Edit Attendance Log" : "Mark Member Attendance"}
                </h3>
                <p className="text-[#aea9b6] text-xs mt-1">
                  {editingRecord ? "Modify selected attendance log record" : "Record a new entry in attendance files"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#aea9b6] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4">
              {/* Member Selection */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                  Select Member *
                </label>
                {editingRecord ? (
                  <input
                    type="text"
                    disabled
                    value={editingRecord.userId?.name || "Unknown"}
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-[#aea9b6] focus:outline-none"
                  />
                ) : (
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-[#0d0c16] border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.regNum || "No Reg"} / {m.coreDomain || "No Domain"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all [color-scheme:dark]"
                />
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                    Clock In Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={clockInStr}
                    onChange={(e) => setClockInStr(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                    Clock Out Time
                  </label>
                  <input
                    type="time"
                    value={clockOutStr}
                    onChange={(e) => setClockOutStr(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Status and Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                    Attendance Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#0d0c16] border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">
                    Meeting Venue Type
                  </label>
                  <select
                    value={meetType}
                    onChange={(e) => setMeetType(e.target.value)}
                    className="w-full bg-[#0d0c16] border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="gmeet">Google Meet</option>
                    <option value="in_person">In Person</option>
                    <option value="custom">Custom Link</option>
                  </select>
                </div>
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
                  {submitting ? "Saving..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
