import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import SkillsEditorModal from "../../components/admin/SkillsEditorModal";
import Navbar from "../../components/common/layout/Navbar";
import {
  isDefaultAvatar,
  formatDate,
  initialsFromName,
  roleLabel,
} from "../../utils/memberHelpers";
import { BOARD_ROLES } from "../../utils/usePermissions";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Raster formats the browser can decode onto a canvas (so we can compress them).
// Anything else (HEIC/HEIF, etc.) is sent as-is for Cloudinary to convert.
const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * Accept any image format with no size limit. Large JPEG/PNG/WEBP are
 * downscaled + re-encoded on a canvas to keep the upload light; formats the
 * browser can't decode (HEIC, …) are passed through untouched.
 * @returns {Promise<string>} a data-URL ready to send to the backend
 */
async function prepareImage(file) {
  const dataUrl = await readFileAsDataURL(file);
  if (!COMPRESSIBLE_TYPES.includes(file.type)) return dataUrl; // e.g. HEIC → as-is
  try {
    const img = await loadImage(dataUrl);
    const MAX = 1280; // longest edge
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    // Small + light already → no point re-encoding.
    if (scale === 1 && file.size < 1_200_000) return dataUrl;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return dataUrl; // decoding failed → send original, let the server handle it
  }
}

const DEPARTMENTS = ["CTECH", "CINTEL", "ECE", "NWC", "DSBS", "Mechanical", "Other"];
const RESIDENCE = ["Hosteller", "Dayscholar"];

// Shared field styles for the edit modal.
const MODAL_FIELD =
  "w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary/60";
const MODAL_LABEL =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45";

// Build the editable form state from a user object (single source of truth).
const formFromUser = (u = {}) => ({
  image: u.image || "",
  bio: u.bio || "",
  imageFile: null,
  imageFileName: "",
  name: u.name || "",
  phoneNumber: u.phoneNumber || "",
  department: u.department || "",
  section: u.section || "",
  facultyAdvisorName: u.facultyAdvisorName || "",
  facultyAdvisorNo: u.facultyAdvisorNo || "",
  residenceType: u.residenceType || "",
  socials: {
    linkedin: u.socials?.linkedin || "",
    github: u.socials?.github || "",
    instagram: u.socials?.instagram || "",
  },
});

const emptyProfile = formFromUser();

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const sceneRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const dotFieldRef = useRef({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef(null);
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  const fetchProfile = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to fetch your profile right now.",
        );
      }

      const user = data?.user || null;
      setProfile(user);

      if (user?.email) {
        try {
          const mResponse = await fetch(`${API_BASE_URL}/api/projects/members/email/${user.email}`, {
            credentials: "include",
          });
          if (mResponse.ok) {
            const mData = await mResponse.json();
            setMemberProfile(mData);
          } else {
            setMemberProfile(null);
          }
        } catch(e) {
          console.error("Failed to fetch member profile", e);
        }
      }

      setForm(formFromUser(user));
      setSuccessMessage("");
    } catch (fetchError) {
      setError(
        fetchError.message ||
          "Unable to load your profile right now. Please try again.",
      );
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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

  const handleFieldChange = (field, value) => {
    setSuccessMessage("");
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    setSuccessMessage("");
    setError("");

    if (!file) {
      setForm((current) => ({ ...current, imageFile: null, imageFileName: "" }));
      return;
    }

    // No size limit, any format accepted — compressed when possible, else as-is.
    try {
      const dataUrl = await prepareImage(file);
      setForm((current) => ({
        ...current,
        imageFile: typeof dataUrl === "string" ? dataUrl : null,
        imageFileName: file.name,
      }));
    } catch {
      setError("Could not read that image file.");
    }
  };

  const handleSocialChange = (field, value) => {
    setSuccessMessage("");
    setForm((current) => ({
      ...current,
      socials: {
        ...current.socials,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Only Faculty Advisor details are required.
    if (!form.facultyAdvisorName.trim() || !form.facultyAdvisorNo.trim()) {
      setError("Faculty Advisor name and contact are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        department: form.department.trim(),
        section: form.section.trim(),
        facultyAdvisorName: form.facultyAdvisorName.trim(),
        facultyAdvisorNo: form.facultyAdvisorNo.trim(),
        residenceType: form.residenceType,
        bio: form.bio.trim(),
        socials: {
          linkedin: form.socials.linkedin.trim(),
          github: form.socials.github.trim(),
          instagram: form.socials.instagram.trim(),
        },
      };

      if (form.imageFile) {
        payload.imageFile = form.imageFile;
      }

      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      // Keep the localStorage user (used by navbar/dashboard avatars) in sync.
      const syncLocalUser = (u) => {
        if (!u) return;
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem("user", JSON.stringify({ ...stored, image: u.image ?? stored.image }));
        } catch { /* ignore */ }
      };

      // Backend saved the text fields but the photo upload failed (502).
      if (response.status === 502 && data?.imageFailed) {
        if (data.user) {
          setProfile(data.user);
          syncLocalUser(data.user);
        }
        setError(`${data?.message || "Photo upload failed."} Your other changes were saved.`);
        return; // keep the editor open so they can retry the photo
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to update your profile right now.",
        );
      }

      const updatedUser = data?.user || profile;
      setProfile(updatedUser);
      syncLocalUser(updatedUser);
      setForm(formFromUser(updatedUser));
      setSuccessMessage("Profile updated successfully.");
      setIsEditOpen(false);
      fetchProfile({ silent: true });
    } catch (saveError) {
      setError(
        saveError.message ||
          "Unable to save your profile changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const profileStats = useMemo(() => {
    if (!profile) {
      return [];
    }

    const stats = [
      {
        label: "Role",
        value: roleLabel(profile),
      },
      {
        label: "Domain",
        value: profile.coreDomain
          ? `${profile.coreDomain}${profile.subDomain ? ` / ${profile.subDomain}` : ""}`
          : "Not assigned",
      },
      {
        label: "Joined",
        value: formatDate(profile.createdAt),
      },
      {
        label: "Approval",
        value: profile.approved ? "Approved" : "Pending",
      },
    ];

    if (memberProfile) {
      stats.push({
        label: "Rank",
        value: memberProfile.coreDomain === "Corporate" ? memberProfile.corpTier?.toUpperCase() : memberProfile.overallScore >= 55 ? "SENIOR" : memberProfile.overallScore >= 30 ? "MID" : "ROOKIE",
      });
      stats.push({
        label: "Skill Score",
        value: `${memberProfile.overallScore || 0}%`,
      });
    }

    return stats;
  }, [profile, memberProfile]);

  return (
    <div
      ref={sceneRef}
      className="member-directory-page interactive-login-scene min-h-screen overflow-hidden bg-[#070910] text-[#f5eefc] selection:bg-primary/30 selection:text-black"
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

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#070910]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 md:px-8 lg:pl-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
              Your account
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white font-headline md:text-3xl">
              My Profile
            </h1>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2.5 text-sm font-semibold text-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:text-white"
            onClick={() => fetchProfile({ silent: true })}
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
        {loading ? (
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="member-skeleton h-[520px] rounded-[2rem] border border-white/8 bg-white/[0.04]" />
            <div className="member-skeleton h-[520px] rounded-[2rem] border border-white/8 bg-white/[0.04]" />
          </section>
        ) : null}

        {!loading && error && !profile ? (
          <section className="rounded-[2rem] border border-red-300/15 bg-red-500/8 p-6 text-white/85">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-bold text-white">
                  Profile unavailable
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
                  {error}
                </p>
              </div>

              <button
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-transform duration-300 hover:-translate-y-0.5"
                onClick={() => fetchProfile()}
                type="button"
              >
                Try again
              </button>
            </div>
          </section>
        ) : null}

        {!loading && profile ? (
          <div className="space-y-6">
            <section className="member-id-card group relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.04] p-[1px] shadow-[0_30px_80px_rgba(4,6,20,0.42)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.28),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,236,255,0.22),transparent_34%)] opacity-80" />
              <div className="member-id-card__inner relative h-full rounded-[calc(2rem-1px)] border border-white/8 bg-[linear-gradient(155deg,rgba(22,20,31,0.98),rgba(12,11,18,0.92))] p-6 md:p-8">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -left-10 top-8 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
                  <div className="absolute -right-8 bottom-10 h-28 w-28 rounded-full bg-tertiary/15 blur-3xl" />
                </div>

                <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-5">
                    <div className="member-avatar-shell shrink-0 rounded-[1.6rem] p-1">
                      <div className="h-28 w-28 overflow-hidden rounded-[1.3rem] border border-white/10 bg-white/5">
                        {profile.image && !isDefaultAvatar(profile.image) ? (
                          <img
                            alt={profile.name}
                            className="h-full w-full object-cover"
                            src={profile.image}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,rgba(241,131,255,0.24),rgba(129,236,255,0.16))] text-3xl font-bold text-white">
                            {initialsFromName(profile.name)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/80">
                        SQAC Member Profile
                      </p>
                      <h2 className="mt-3 text-3xl font-bold text-white font-headline">
                        {profile.name}
                      </h2>
                      <p className="mt-2 text-sm text-white/65">
                        {profile.position || roleLabel(profile)}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                          {profile.regNum || "No reg number"}
                        </span>
                        {(profile.isBoardMember === true || BOARD_ROLES.includes(profile.role)) && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#f183ff]/30 bg-[#f183ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f183ff]">
                            <span className="material-symbols-outlined text-[13px]">shield_person</span>
                            Board Member
                          </span>
                        )}
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                            profile.approved
                              ? "border-emerald-300/20 bg-emerald-400/12 text-emerald-100"
                              : "border-amber-300/20 bg-amber-400/12 text-amber-100"
                          }`}
                        >
                          {profile.approved ? "Approved member" : "Pending approval"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="member-chip shrink-0 self-start rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                    {profile.role || "user"}
                  </div>
                </div>

                <div className="relative mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {profileStats.map((item) => (
                    <div
                      className="member-info-block rounded-2xl border border-white/8 px-4 py-4"
                      key={item.label}
                    >
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white/85">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="member-id-bar relative mt-6 rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.03] px-4 py-4">
                  <div className="absolute inset-y-0 left-5 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                  <div className="grid gap-4 pl-4 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Email
                      </p>
                      <p className="mt-1 text-sm font-medium text-white/80">
                        {profile.email || "Unavailable"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Phone
                      </p>
                      <p className="mt-1 text-sm font-medium text-white/80">
                        {profile.phoneNumber || "Unavailable"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Bio
                      </p>
                      <p className="mt-1 text-sm font-medium text-white/80">
                        {profile.bio || "No bio added yet."}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Attendance
                      </p>
                      <p className="mt-1 text-sm font-medium text-white/80">
                        {profile.attendance ?? 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic & Membership details */}
                <div className="relative mt-6">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/80">
                    Academic &amp; Membership
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {[
                      { label: "Department", value: profile.department },
                      { label: "Section", value: profile.section },
                      { label: "Core Domain", value: profile.coreDomain },
                      { label: "Sub Domain", value: profile.subDomain },
                      { label: "Position", value: profile.position },
                      { label: "Residence", value: profile.residenceType },
                      { label: "Faculty Advisor", value: profile.facultyAdvisorName },
                      { label: "Faculty Contact", value: profile.facultyAdvisorNo },
                      {
                        label: "Code of Conduct",
                        value: profile.cocAccepted
                          ? `Accepted${profile.cocVersionAccepted ? ` · ${profile.cocVersionAccepted}` : ""}`
                          : "Not accepted",
                      },
                      {
                        label: "Accepted On",
                        value: profile.cocAcceptedAt ? formatDate(profile.cocAcceptedAt) : null,
                      },
                      {
                        label: "Profile Status",
                        value: profile.profileCompleted ? "Completed" : "Incomplete",
                      },
                    ].map((item) => (
                      <div
                        className="member-info-block rounded-2xl border border-white/8 px-4 py-4"
                        key={item.label}
                      >
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white/85">
                          {item.value || "Not provided"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    {
                      label: "LinkedIn",
                      href: profile.socials?.linkedin,
                      icon: "work",
                    },
                    {
                      label: "GitHub",
                      href: profile.socials?.github,
                      icon: "code",
                    },
                    {
                      label: "Instagram",
                      href: profile.socials?.instagram,
                      icon: "photo_camera",
                    },
                  ].map((item) => (
                    <div
                      className="member-info-block rounded-2xl border border-white/8 px-4 py-4"
                      key={item.label}
                    >
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-white"
                          href={item.href}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <span className="material-symbols-outlined text-base">
                            {item.icon}
                          </span>
                          <span className="truncate">{item.href}</span>
                        </a>
                      ) : (
                        <p className="mt-3 text-sm font-medium text-white/50">
                          Not added yet
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-xl">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
                  Profile Actions
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Open the editor to update your photo, bio, and social links.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {successMessage ? (
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100">
                    {successMessage}
                  </span>
                ) : null}
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-primary/50 text-primary hover:bg-primary/10 px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
                  onClick={() => setIsSkillsOpen(true)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">
                    psychology
                  </span>
                  Update Skills
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:-translate-y-0.5"
                  onClick={() => {
                    setError("");
                    setSuccessMessage("");
                    setForm(formFromUser(profile));
                    setIsEditOpen(true);
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">
                    edit_square
                  </span>
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {isEditOpen && profile ? (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-md sm:items-center sm:py-10"
          onClick={(e) => { if (!saving && e.target === e.currentTarget) setIsEditOpen(false); }}
        >
          <div className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0c0f1a]/95 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                  Edit Profile
                </p>
                <h3 className="mt-2 text-xl font-bold text-white font-headline sm:text-2xl">
                  Update your details
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  Only Faculty Advisor fields are required. All other fields are optional.
                </p>
              </div>
              <button
                className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                onClick={() => { if (saving) return; setIsEditOpen(false); }}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable form body */}
            <form
              className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-6 pb-6 pt-5 space-y-5 sm:max-h-[75vh]"
              onSubmit={handleSubmit}
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}
            >
              {/* ── Profile photo ── */}
              <label className="block">
                <span className={MODAL_LABEL}>Profile photo</span>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-white/12 bg-white/6 px-4 py-3 text-sm transition-all hover:border-primary/45 hover:bg-white/8">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">
                      {form.imageFileName || "Choose an image to upload"}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      JPG, PNG, WEBP, HEIC… (optimized automatically)
                    </p>
                  </div>
                  <span className="material-symbols-outlined shrink-0 text-lg text-primary">upload</span>
                  <input accept="image/*,.heic,.heif" className="hidden" onChange={handleImageSelect} type="file" />
                </label>
                {profile.image && (
                  <p className="mt-2 text-xs text-white/35">Current photo is already set on your profile.</p>
                )}
              </label>

              {/* ── Name + Phone ── */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className={MODAL_LABEL}>Full name</span>
                  <input
                    className={MODAL_FIELD}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Your full name"
                    type="text"
                    value={form.name}
                  />
                </label>
                <label className="block">
                  <span className={MODAL_LABEL}>Phone number</span>
                  <input
                    className={MODAL_FIELD}
                    onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    type="tel"
                    value={form.phoneNumber}
                  />
                </label>
              </div>

              {/* ── Department + Section ── */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className={MODAL_LABEL}>Department</span>
                  <select
                    className={MODAL_FIELD + " cursor-pointer bg-[#131620]"}
                    onChange={(e) => handleFieldChange("department", e.target.value)}
                    value={form.department}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={MODAL_LABEL}>Section</span>
                  <input
                    className={MODAL_FIELD}
                    onChange={(e) => handleFieldChange("section", e.target.value)}
                    placeholder="e.g. A, B, C"
                    type="text"
                    value={form.section}
                  />
                </label>
              </div>

              {/* ── Residence ── */}
              <div>
                <span className={MODAL_LABEL}>Residence type</span>
                <div className="flex flex-wrap gap-3">
                  {RESIDENCE.map((opt) => (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all ${
                        form.residenceType === opt
                          ? "border-primary/60 bg-primary/15 text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
                      }`}
                    >
                      <input
                        checked={form.residenceType === opt}
                        className="hidden"
                        name="residenceType"
                        onChange={() => handleFieldChange("residenceType", opt)}
                        type="radio"
                        value={opt}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Faculty Advisor (required) ── */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                  Faculty Advisor <span className="normal-case text-red-400">* required</span>
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={MODAL_LABEL}>Advisor name</span>
                    <input
                      className={MODAL_FIELD}
                      onChange={(e) => handleFieldChange("facultyAdvisorName", e.target.value)}
                      placeholder="Prof. Full Name"
                      required
                      type="text"
                      value={form.facultyAdvisorName}
                    />
                  </label>
                  <label className="block">
                    <span className={MODAL_LABEL}>Advisor contact</span>
                    <input
                      className={MODAL_FIELD}
                      onChange={(e) => handleFieldChange("facultyAdvisorNo", e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      type="tel"
                      value={form.facultyAdvisorNo}
                    />
                  </label>
                </div>
              </div>

              {/* ── Bio ── */}
              <label className="block">
                <span className={MODAL_LABEL}>Bio</span>
                <textarea
                  className={"min-h-[100px] " + MODAL_FIELD}
                  maxLength={150}
                  onChange={(e) => handleFieldChange("bio", e.target.value)}
                  placeholder="Write a short bio (optional)"
                  value={form.bio}
                />
                <span className="mt-1.5 block text-right text-xs text-white/35">{form.bio.length}/150</span>
              </label>

              {/* ── Social links ── */}
              <div>
                <span className={MODAL_LABEL}>Social links</span>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined shrink-0 text-base text-white/40">work</span>
                    <input
                      className={MODAL_FIELD}
                      onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                      placeholder="LinkedIn URL"
                      type="url"
                      value={form.socials.linkedin}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined shrink-0 text-base text-white/40">code</span>
                    <input
                      className={MODAL_FIELD}
                      onChange={(e) => handleSocialChange("github", e.target.value)}
                      placeholder="GitHub URL"
                      type="url"
                      value={form.socials.github}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined shrink-0 text-base text-white/40">photo_camera</span>
                    <input
                      className={MODAL_FIELD}
                      onChange={(e) => handleSocialChange("instagram", e.target.value)}
                      placeholder="Instagram URL"
                      type="url"
                      value={form.socials.instagram}
                    />
                  </div>
                </div>
              </div>

              {/* ── Error ── */}
              {error && (
                <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              {/* ── Actions ── */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white"
                  onClick={() => setForm(formFromUser(profile))}
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isSkillsOpen && profile ? (
        <SkillsEditorModal
          user={profile}
          memberProfile={memberProfile}
          onClose={() => setIsSkillsOpen(false)}
          onSave={(newMemberProfile) => {
            setMemberProfile(newMemberProfile);
            setSuccessMessage("Skills updated successfully.");
            setIsSkillsOpen(false);
          }}
        />
      ) : null}
    </div>
  );
};

export default Profile;
