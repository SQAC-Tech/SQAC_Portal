import React, { useEffect, useMemo, useRef, useState } from "react";
import MemberCard from "../../components/admin/MemberCard";
import MemberEditModal from "../../components/admin/MemberEditModal";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Navbar from "../../components/common/layout/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({ role: "user", position: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", onConfirm: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

  const showAlert = (message, type = "info") => {
    setAlertModal({ isOpen: true, message, type });
  };
  const sceneRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const dotFieldRef = useRef({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef(null);
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  const fetchMembers = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/members`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const membersData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          membersData?.message ||
            membersData?.error ||
            "Unable to fetch members. Please log in as an admin.",
        );
      }

      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (fetchError) {
      setError(
        fetchError.message ||
          "Unable to load members right now. Please try again.",
      );
      setMembers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) {
      return undefined;
    }

    scene.style.setProperty("--pointer-x", "50%");
    scene.style.setProperty("--pointer-y", "50%");
    scene.style.setProperty("--dot-cluster-x", "50%");
    scene.style.setProperty("--dot-cluster-y", "50%");
    scene.style.setProperty("--parallax-x", "0px");
    scene.style.setProperty("--parallax-y", "0px");
    scene.style.setProperty("--parallax-x-soft", "0px");
    scene.style.setProperty("--parallax-y-soft", "0px");

    const animate = () => {
      const targetX = (pointerRef.current.x - 0.5) * 32;
      const targetY = (pointerRef.current.y - 0.5) * 32;

      currentOffsetRef.current.x +=
        (targetX - currentOffsetRef.current.x) * 0.08;
      currentOffsetRef.current.y +=
        (targetY - currentOffsetRef.current.y) * 0.08;
      dotFieldRef.current.x +=
        (pointerRef.current.x - dotFieldRef.current.x) * 0.12;
      dotFieldRef.current.y +=
        (pointerRef.current.y - dotFieldRef.current.y) * 0.12;

      scene.style.setProperty("--pointer-x", `${pointerRef.current.x * 100}%`);
      scene.style.setProperty("--pointer-y", `${pointerRef.current.y * 100}%`);
      scene.style.setProperty(
        "--dot-cluster-x",
        `${dotFieldRef.current.x * 100}%`,
      );
      scene.style.setProperty(
        "--dot-cluster-y",
        `${dotFieldRef.current.y * 100}%`,
      );
      scene.style.setProperty(
        "--parallax-x",
        `${currentOffsetRef.current.x}px`,
      );
      scene.style.setProperty(
        "--parallax-y",
        `${currentOffsetRef.current.y}px`,
      );
      scene.style.setProperty(
        "--parallax-x-soft",
        `${currentOffsetRef.current.x * 0.45}px`,
      );
      scene.style.setProperty(
        "--parallax-y-soft",
        `${currentOffsetRef.current.y * 0.45}px`,
      );

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0.5, y: 0.5 };
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

  const handleDeleteMember = async (member) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/user/${member._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to delete member.",
        );
      }

      setMembers((currentMembers) =>
        currentMembers.filter((current) => current._id !== member._id),
      );
    } catch (deleteError) {
      showAlert(
        deleteError.message || "Failed to delete member. Please try again.",
        "error"
      );
    }
  };

  const deleteMemberWrapper = (member) => {
    setConfirmModal({
      isOpen: true,
      message: `Delete ${member.name}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
        await handleDeleteMember(member);
      }
    });
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setEditForm({
      role: member.role || "user",
      position: member.position || "",
    });
  };

  const handleCloseEdit = () => {
    if (savingEdit) return;
    setEditingMember(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editingMember?._id) return;

    setSavingEdit(true);

    try {
      const updates = [];
      const trimmedPosition = editForm.position.trim();

      if ((editingMember.role || "user") !== editForm.role) {
        updates.push(
          fetch(`${API_BASE_URL}/admin/role/${editingMember._id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: editForm.role }),
          }),
        );
      }

      if ((editingMember.position || "") !== trimmedPosition) {
        updates.push(
          fetch(`${API_BASE_URL}/admin/position/${editingMember._id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ position: trimmedPosition }),
          }),
        );
      }

      if (updates.length === 0) {
        handleCloseEdit();
        return;
      }

      const responses = await Promise.all(updates);
      const failures = [];

      for (const response of responses) {
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          failures.push(data?.message || data?.error || "Update failed.");
        }
      }

      if (failures.length > 0) {
        throw new Error(failures[0]);
      }

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member._id === editingMember._id
            ? {
                ...member,
                role: editForm.role,
                position: trimmedPosition,
              }
            : member,
        ),
      );
      setEditingMember(null);
    } catch (saveError) {
      showAlert(
        saveError.message || "Failed to update member. Please try again.",
        "error"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) =>
      [
        member.name,
        member.email,
        member.regNum,
        member.phoneNumber,
        member.position,
        member.coreDomain,
        member.subDomain,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [members, searchTerm]);

  const stats = useMemo(() => {
    const domainCount = new Set(
      members.map((member) => member.coreDomain).filter(Boolean),
    ).size;
    const leadCount = members.filter(
      (member) => member.role === "lead" || member.position,
    ).length;

    return {
      total: members.length,
      domains: domainCount,
      leads: leadCount,
    };
  }, [members]);

  return (
    <div
      ref={sceneRef}
      className="member-directory-page interactive-login-scene min-h-screen overflow-hidden bg-[#070910] text-[#f5eefc] selection:bg-primary/30 selection:text-black pt-16"
      onPointerLeave={handlePointerLeave}
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

      <AdminSidebar onLogout={handleLogout} />

      <header className="sticky top-16 z-40 border-b border-white/8 bg-[#070910]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 md:px-8 lg:pl-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
              SQAC Portal
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white font-['Space_Grotesk'] md:text-3xl">
              Members Command Deck
            </h1>
          </div>

          <div className="hidden min-w-[280px] flex-1 md:flex md:max-w-xl">
            <label className="relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                search
              </span>
              <input
                className="w-full rounded-full border border-white/10 bg-white/6 py-3 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:border-primary/60 focus:bg-white/10"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, reg no, domain or email"
                type="text"
                value={searchTerm}
              />
            </label>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2.5 text-sm font-semibold text-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:text-white"
            onClick={() => fetchMembers({ silent: true })}
            type="button"
          >
            <span
              className={`material-symbols-outlined text-lg ${
                refreshing ? "animate-spin" : ""
              }`}
            >
              refresh
            </span>
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 pb-16 pt-8 md:px-8 lg:pl-28">
        <div className="mt-8 md:hidden">
          <label className="relative block">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
              search
            </span>
            <input
              className="w-full rounded-full border border-white/10 bg-white/6 py-3 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:border-primary/60 focus:bg-white/10"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search members"
              type="text"
              value={searchTerm}
            />
          </label>
        </div>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              Member IDs
            </h3>
            <p className="mt-1 text-sm text-white/55">
              Showing {filteredMembers.length} of {members.length} members
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Total Members: {stats.total}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Leads / positions: {stats.leads}
            </div>
          </div>
        </section>

        {loading ? (
          <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="member-skeleton h-[370px] rounded-[2rem] border border-white/8 bg-white/[0.04]"
                key={index}
              />
            ))}
          </section>
        ) : null}

        {!loading && error ? (
          <section className="mt-8 rounded-[2rem] border border-red-300/15 bg-red-500/8 p-6 text-white/85">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-bold text-white">
                  Members unavailable
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
                  {error}
                </p>
              </div>

              <button
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-transform duration-300 hover:-translate-y-0.5"
                onClick={() => fetchMembers()}
                type="button"
              >
                Try again
              </button>
            </div>
          </section>
        ) : null}

        {!loading && !error && filteredMembers.length === 0 ? (
          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-2xl font-bold text-white font-['Space_Grotesk']">
              No matching members
            </p>
            <p className="mt-3 text-sm text-white/60">
              Try a different search term or switch between all, approved, and
              pending members.
            </p>
          </section>
        ) : null}

        {!loading && !error && filteredMembers.length > 0 ? (
          <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member, index) => (
              <MemberCard
                index={index}
                key={member._id || `${member.email}-${index}`}
                member={member}
                onDelete={deleteMemberWrapper}
                onEdit={handleOpenEdit}
              />
            ))}
          </section>
        ) : null}
      </main>

      <MemberEditModal
        editForm={editForm}
        editingMember={editingMember}
        onChange={handleEditChange}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        savingEdit={savingEdit}
      />

      {/* Generic Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0a15] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">Confirm Action</h3>
            <p className="text-white/60 text-sm mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
                className="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmModal.onConfirm && confirmModal.onConfirm()}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-500 font-bold hover:bg-red-500/30 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
