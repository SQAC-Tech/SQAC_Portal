import React, { useEffect, useMemo, useRef, useState } from "react";
import MemberCard from "../../components/admin/MemberCard";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Navbar from "../../components/common/layout/Navbar";
import { usePermissions } from "../../utils/usePermissions";
import { DEFAULT_AVATAR, roleLabel, formatDate } from "../../utils/memberHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ROLE_LABELS = {
  secretary: "Secretary", joint_secretary: "Joint Secretary",
  technical_lead: "Technical Lead", project_lead: "Project Lead",
  corp_lead: "Corporate Lead", domain_lead: "Domain Lead",
  associate_lead: "Associate Lead", member: "Member",
};

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#aea9b6]">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

function MemberDetailModal({ member, onClose }) {
  if (!member) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0f1a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* gradient top bar */}
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#f183ff] via-[#81ecff] to-[#ff6c95]" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <img
              src={member.image || DEFAULT_AVATAR}
              alt={member.name}
              className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] truncate">{member.name}</h2>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#81ecff]/10 border border-[#81ecff]/20 text-[#81ecff] text-[10px] font-semibold uppercase tracking-wide">
                  {ROLE_LABELS[member.role] || member.role || "Member"}
                </span>
                {member.cocAccepted && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-semibold">
                    COC ✓
                  </span>
                )}
                {member.profileCompleted && (
                  <span className="px-2 py-0.5 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 text-[#f183ff] text-[10px] font-semibold">
                    Profile ✓
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#aea9b6] hover:text-white text-2xl leading-none shrink-0"
            >
              ×
            </button>
          </div>

          {/* Identity */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f183ff]">Identity</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Registration No." value={member.regNum} />
              <DetailRow label="Phone" value={member.phoneNumber} />
              <div className="col-span-2">
                <DetailRow label="Email" value={member.email} />
              </div>
            </div>
          </div>

          {/* Academic */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#81ecff]">Academic</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Department" value={member.department} />
              <DetailRow label="Section" value={member.section} />
              <DetailRow label="Faculty Advisor" value={member.facultyAdvisorName} />
              <DetailRow label="Faculty Contact" value={member.facultyAdvisorNo} />
              <DetailRow label="Residence" value={member.residenceType} />
            </div>
          </div>

          {/* Club Role */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#aea9b6]">Club Role</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Core Domain" value={member.coreDomain} />
              <DetailRow label="Sub Domain" value={member.subDomain} />
              <DetailRow label="Position" value={member.position} />
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#aea9b6]">Account</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Joined" value={formatDate(member.createdAt)} />
              <DetailRow label="COC Version" value={member.cocVersionAccepted} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CSV Export ────────────────────────────────────────────────────────────────
function exportCSV(members) {
  const headers = [
    "Name", "Registration No.", "Email", "Phone",
    "Role", "Core Domain", "Sub Domain", "Position",
    "Department", "Section", "Faculty Advisor", "Faculty Contact",
    "Residence", "COC Accepted", "Profile Completed", "Joined",
  ];

  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = members.map((m) => [
    m.name, m.regNum, m.email, m.phoneNumber,
    ROLE_LABELS[m.role] || m.role || "",
    m.coreDomain, m.subDomain, m.position,
    m.department, m.section, m.facultyAdvisorName, m.facultyAdvisorNo,
    m.residenceType,
    m.cocAccepted ? "Yes" : "No",
    m.profileCompleted ? "Yes" : "No",
    m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : "",
  ].map(escape).join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sqac-members-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Page ──────────────────────────────────────────────────────────────────────
const Members = () => {
  const { canDeleteMember } = usePermissions();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", onConfirm: null });

  const sceneRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const dotFieldRef = useRef({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef(null);
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  const fetchMembers = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/members`, {
        method: "GET", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || data?.error || "Unable to fetch members.");
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load members right now.");
      setMembers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty("--pointer-x", "50%");
    scene.style.setProperty("--pointer-y", "50%");
    scene.style.setProperty("--dot-cluster-x", "50%");
    scene.style.setProperty("--dot-cluster-y", "50%");
    scene.style.setProperty("--parallax-x", "0px");
    scene.style.setProperty("--parallax-y", "0px");
    scene.style.setProperty("--parallax-x-soft", "0px");
    scene.style.setProperty("--parallax-y-soft", "0px");

    const animate = () => {
      const tx = (pointerRef.current.x - 0.5) * 32;
      const ty = (pointerRef.current.y - 0.5) * 32;
      currentOffsetRef.current.x += (tx - currentOffsetRef.current.x) * 0.08;
      currentOffsetRef.current.y += (ty - currentOffsetRef.current.y) * 0.08;
      dotFieldRef.current.x += (pointerRef.current.x - dotFieldRef.current.x) * 0.12;
      dotFieldRef.current.y += (pointerRef.current.y - dotFieldRef.current.y) * 0.12;
      scene.style.setProperty("--pointer-x", `${pointerRef.current.x * 100}%`);
      scene.style.setProperty("--pointer-y", `${pointerRef.current.y * 100}%`);
      scene.style.setProperty("--dot-cluster-x", `${dotFieldRef.current.x * 100}%`);
      scene.style.setProperty("--dot-cluster-y", `${dotFieldRef.current.y * 100}%`);
      scene.style.setProperty("--parallax-x", `${currentOffsetRef.current.x}px`);
      scene.style.setProperty("--parallax-y", `${currentOffsetRef.current.y}px`);
      scene.style.setProperty("--parallax-x-soft", `${currentOffsetRef.current.x * 0.45}px`);
      scene.style.setProperty("--parallax-y-soft", `${currentOffsetRef.current.y * 0.45}px`);
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };
    animationFrameRef.current = window.requestAnimationFrame(animate);
    return () => { if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current); };
  }, []);

  const handlePointerMove = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height };
  };

  const handleDeleteMember = async (member) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${member._id}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || data?.error || "Unable to delete member.");
      setMembers((cur) => cur.filter((m) => m._id !== member._id));
      if (selectedMember?._id === member._id) setSelectedMember(null);
    } catch (err) {
      alert(err.message || "Failed to delete member.");
    }
  };

  const deleteMemberWrapper = (member) => {
    setConfirmModal({
      isOpen: true,
      message: `Delete ${member.name}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
        await handleDeleteMember(member);
      },
    });
  };

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.email, m.regNum, m.phoneNumber, m.position, m.coreDomain, m.subDomain, m.department]
        .filter(Boolean).some((v) => v.toLowerCase().includes(q))
    );
  }, [members, searchTerm]);

  const stats = useMemo(() => ({
    total: members.length,
    leads: members.filter((m) => m.role !== "member").length,
  }), [members]);

  return (
    <div
      ref={sceneRef}
      className="member-directory-page interactive-login-scene min-h-screen overflow-hidden bg-[#070910] text-[#f5eefc] selection:bg-primary/30 selection:text-black pt-16"
      onPointerLeave={() => { pointerRef.current = { x: 0.5, y: 0.5 }; }}
      onPointerMove={handlePointerMove}
    >
      <Navbar />
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(129,236,255,0.14),transparent_28%),linear-gradient(180deg,#070910_0%,#0b1020_44%,#070910_100%)]" />
      <div className="bg-grid pointer-events-none fixed inset-0 -z-30 opacity-70" />
      <div className="member-orb member-orb-a fixed -left-24 top-10 -z-20 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="member-orb member-orb-b fixed right-0 top-48 -z-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-[130px]" />
      <div className="member-orb member-orb-c fixed bottom-0 left-1/3 -z-20 h-96 w-96 rounded-full bg-secondary/12 blur-[150px]" />
      <div className="interactive-dot-field member-dot-field pointer-events-none fixed inset-0 -z-10" />
      <div className="interactive-spotlight member-spotlight pointer-events-none fixed inset-0 -z-10" />

      <AdminSidebar />

      <header className="sticky top-16 z-40 border-b border-white/8 bg-[#070910]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 md:px-8 lg:pl-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">SQAC Portal</p>
            <h1 className="mt-2 text-2xl font-bold text-white font-['Space_Grotesk'] md:text-3xl">Members Command Deck</h1>
          </div>

          <div className="hidden min-w-[280px] flex-1 md:flex md:max-w-xl">
            <label className="relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/35">search</span>
              <input
                className="w-full rounded-full border border-white/10 bg-white/6 py-3 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:border-primary/60 focus:bg-white/10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, reg no, domain or email"
                type="text"
                value={searchTerm}
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-all hover:-translate-y-0.5 hover:bg-emerald-500/20"
              onClick={() => exportCSV(filteredMembers)}
              type="button"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Export CSV
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2.5 text-sm font-semibold text-white/85 transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:text-white"
              onClick={() => fetchMembers({ silent: true })}
              type="button"
            >
              <span className={`material-symbols-outlined text-lg ${refreshing ? "animate-spin" : ""}`}>refresh</span>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 pb-16 pt-8 md:px-8 lg:pl-28">
        <div className="mt-8 md:hidden">
          <label className="relative block">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/35">search</span>
            <input
              className="w-full rounded-full border border-white/10 bg-white/6 py-3 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/35 focus:border-primary/60 focus:bg-white/10"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members"
              type="text"
              value={searchTerm}
            />
          </label>
        </div>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">Member IDs</h3>
            <p className="mt-1 text-sm text-white/55">Showing {filteredMembers.length} of {members.length} members</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Total: {stats.total}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Leads: {stats.leads}
            </div>
          </div>
        </section>

        {loading && (
          <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="member-skeleton h-[370px] rounded-[2rem] border border-white/8 bg-white/[0.04]" key={i} />
            ))}
          </section>
        )}

        {!loading && error && (
          <section className="mt-8 rounded-[2rem] border border-red-300/15 bg-red-500/8 p-6 text-white/85">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-bold text-white">Members unavailable</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">{error}</p>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                onClick={() => fetchMembers()}
              >Try again</button>
            </div>
          </section>
        )}

        {!loading && !error && filteredMembers.length === 0 && (
          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-2xl font-bold text-white font-['Space_Grotesk']">No matching members</p>
            <p className="mt-3 text-sm text-white/60">Try a different search term.</p>
          </section>
        )}

        {!loading && !error && filteredMembers.length > 0 && (
          <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member, index) => (
              <MemberCard
                index={index}
                key={member._id || `${member.email}-${index}`}
                member={member}
                onView={setSelectedMember}
                onDelete={deleteMemberWrapper}
                canDelete={canDeleteMember}
              />
            ))}
          </section>
        )}
      </main>

      {/* Member Detail Modal */}
      <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />

      {/* Confirm Delete Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0a15] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">Confirm Delete</h3>
            <p className="text-white/60 text-sm mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
                className="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
              >Cancel</button>
              <button
                onClick={() => confirmModal.onConfirm && confirmModal.onConfirm()}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-colors"
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
