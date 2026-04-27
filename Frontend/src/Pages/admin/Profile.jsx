import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  DEFAULT_AVATAR,
  formatDate,
  initialsFromName,
  roleLabel,
} from "../../utils/memberHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyProfile = {
  image: "",
  bio: "",
  imageFile: null,
  imageFileName: "",
  socials: {
    linkedin: "",
    github: "",
    instagram: "",
  },
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
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
      setForm({
        image: user?.image || "",
        bio: user?.bio || "",
        imageFile: null,
        imageFileName: "",
        socials: {
          linkedin: user?.socials?.linkedin || "",
          github: user?.socials?.github || "",
          instagram: user?.socials?.instagram || "",
        },
      });
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

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    setSuccessMessage("");

    if (!file) {
      setForm((current) => ({
        ...current,
        imageFile: null,
        imageFileName: "",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        imageFile: typeof reader.result === "string" ? reader.result : null,
        imageFileName: file.name,
      }));
    };
    reader.readAsDataURL(file);
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
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
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

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to update your profile right now.",
        );
      }

      const updatedUser = data?.user || profile;
      setProfile(updatedUser);
      setForm({
        image: updatedUser?.image || "",
        bio: updatedUser?.bio || "",
        imageFile: null,
        imageFileName: "",
        socials: {
          linkedin: updatedUser?.socials?.linkedin || "",
          github: updatedUser?.socials?.github || "",
          instagram: updatedUser?.socials?.instagram || "",
        },
      });
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

    return [
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
  }, [profile]);

  return (
    <div
      ref={sceneRef}
      className="member-directory-page interactive-login-scene min-h-screen overflow-hidden bg-[#070910] text-[#f5eefc] selection:bg-primary/30 selection:text-black"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
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
              SQAC Portal
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white font-['Space_Grotesk'] md:text-3xl">
              Profile Command Deck
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
                        {profile.image ? (
                          <img
                            alt={profile.name}
                            className="h-full w-full object-cover"
                            src={profile.image || DEFAULT_AVATAR}
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
                      <h2 className="mt-3 text-3xl font-bold text-white font-['Space_Grotesk']">
                        {profile.name}
                      </h2>
                      <p className="mt-2 text-sm text-white/65">
                        {profile.position || roleLabel(profile)}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                          {profile.regNum || "No reg number"}
                        </span>
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
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:-translate-y-0.5"
                  onClick={() => {
                    setError("");
                    setSuccessMessage("");
                    setForm({
                      image: profile.image || "",
                      bio: profile.bio || "",
                      imageFile: null,
                      imageFileName: "",
                      socials: {
                        linkedin: profile.socials?.linkedin || "",
                        github: profile.socials?.github || "",
                        instagram: profile.socials?.instagram || "",
                      },
                    });
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0d1220]/95 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                  Edit Profile
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white font-['Space_Grotesk']">
                  Public details
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  Upload a new profile photo and update your bio or social links.
                </p>
              </div>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                onClick={() => {
                  if (saving) return;
                  setIsEditOpen(false);
                }}
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Profile photo
                </span>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-white/12 bg-white/6 px-4 py-3 text-sm text-white/85 transition-all hover:border-primary/45 hover:bg-white/8">
                  <div className="min-w-0">
                    <p className="font-medium text-white">
                      {form.imageFileName || "Choose an image to upload"}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      JPG, PNG, or WEBP
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-lg text-primary">
                    upload
                  </span>
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    type="file"
                  />
                </label>
                {profile.image ? (
                  <p className="mt-2 text-xs text-white/35">
                    Current photo is already set on your profile.
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Bio
                </span>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary/60"
                  maxLength={150}
                  onChange={(event) =>
                    handleFieldChange("bio", event.target.value)
                  }
                  placeholder="Write a short bio"
                  value={form.bio}
                />
                <span className="mt-2 block text-right text-xs text-white/35">
                  {form.bio.length}/150
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  LinkedIn
                </span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary/60"
                  onChange={(event) =>
                    handleSocialChange("linkedin", event.target.value)
                  }
                  placeholder="https://linkedin.com/in/username"
                  type="url"
                  value={form.socials.linkedin}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  GitHub
                </span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary/60"
                  onChange={(event) =>
                    handleSocialChange("github", event.target.value)
                  }
                  placeholder="https://github.com/username"
                  type="url"
                  value={form.socials.github}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Instagram
                </span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary/60"
                  onChange={(event) =>
                    handleSocialChange("instagram", event.target.value)
                  }
                  placeholder="https://instagram.com/username"
                  type="url"
                  value={form.socials.instagram}
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white"
                  onClick={() =>
                    setForm({
                      image: profile.image || "",
                      bio: profile.bio || "",
                      imageFile: null,
                      imageFileName: "",
                      socials: {
                        linkedin: profile.socials?.linkedin || "",
                        github: profile.socials?.github || "",
                        instagram: profile.socials?.instagram || "",
                      },
                    })
                  }
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
