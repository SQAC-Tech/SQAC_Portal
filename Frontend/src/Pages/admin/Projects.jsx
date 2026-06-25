import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Navbar from "../../components/common/layout/Navbar";
import { usePermissions } from "../../utils/usePermissions";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DOMAINS = ["Web Development", "AI/ML", "Cross-Domain", "Events", "Media", "Public Relations", "Sponsorships", "Creatives", "Corporate"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const PRIORITIES = ["high", "medium", "low"];

const EMPTY_FORM = {
  title: "",
  domain: "Web Development",
  difficulty: "intermediate",
  timeline: "",
  teamSize: 3,
  description: "",
  techStack: "",     // comma-separated
  objectives: "",    // one per line
  deliverables: "",  // one per line
  features: [],       // [{ name, description, priority }]
};

const Projects = () => {
  const { canAssignProject, canCreateProject } = usePermissions();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", onConfirm: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

  // Create-project modal
  const [showCreate, setShowCreate] = useState(false);
  const [createTab, setCreateTab] = useState("ai"); // "ai" | "manual"
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const showAlert = (message, type = "info") => {
    setAlertModal({ isOpen: true, message, type });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "user") {
      window.location.href = "/user/projects";
    }
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch projects");
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAssignTeam = (projectId) => {
    setConfirmModal({
      isOpen: true,
      message: "Auto-assign a recommended team for this project based on skills?",
      onConfirm: async () => {
        setAssigningId(projectId);
        try {
          const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/recommend`, {
            method: "POST",
            credentials: "include",
          });
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || data.error || "Failed to assign team.");
          }
          
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          showAlert(`Success! Assigned ${data.project?.teamMembers?.length || data.teamFormed?.length || 0} members to the project.`, "success");
          fetchProjects();
        } catch (err) {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          showAlert(err.message, "error");
        } finally {
          setAssigningId(null);
        }
      }
    });
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedProject) return;

    setPosting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${selectedProject._id}/threads`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to post message.");

      setSelectedProject(data);
      setMessage("");
      fetchProjects(); // Refresh background list
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setPosting(false);
    }
  };

  const handleCompleteProject = () => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to mark this project as completed? This will free up the assigned members.",
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/projects/${selectedProject._id}/complete`, {
            method: "PUT",
            credentials: "include",
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Failed to complete project.");

          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          showAlert("Project marked as completed!", "success");
          setSelectedProject(null);
          fetchProjects();
        } catch (err) {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          showAlert(err.message, "error");
        }
      }
    });
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setAiPrompt("");
    setAiError("");
    setCreateTab("ai");
    setShowCreate(true);
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateFeature = (i, key, value) =>
    setForm((f) => ({
      ...f,
      features: f.features.map((ft, idx) => (idx === i ? { ...ft, [key]: value } : ft)),
    }));

  const addFeature = () =>
    setForm((f) => ({ ...f, features: [...f.features, { name: "", description: "", priority: "medium" }] }));

  const removeFeature = (i) =>
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));

  const handleAIGenerate = async () => {
    if (aiPrompt.trim().length < 10) {
      setAiError("Describe the project in a bit more detail (at least 10 characters).");
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/ai-generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "AI generation failed.");

      const d = data.data || {};
      setForm((f) => ({
        ...f,
        title: d.title || f.title,
        description: d.description || f.description,
        domain: DOMAINS.includes(d.domain) ? d.domain : f.domain,
        difficulty: DIFFICULTIES.includes(d.difficulty) ? d.difficulty : f.difficulty,
        timeline: d.timeline || f.timeline,
        teamSize: Number(d.teamSize) > 0 ? Number(d.teamSize) : f.teamSize,
        techStack: Array.isArray(d.techStack) ? d.techStack.join(", ") : f.techStack,
        objectives: Array.isArray(d.objectives) ? d.objectives.join("\n") : f.objectives,
        deliverables: Array.isArray(d.deliverables) ? d.deliverables.join("\n") : f.deliverables,
        features: Array.isArray(d.features)
          ? d.features.map((ft) => ({
              name: ft.name || "",
              description: ft.description || "",
              priority: PRIORITIES.includes(ft.priority) ? ft.priority : "medium",
            }))
          : f.features,
      }));
      setCreateTab("manual"); // switch to review/edit the generated draft
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showAlert("Title and description are required.", "error");
      return;
    }
    const toLines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      domain: form.domain,
      difficulty: form.difficulty,
      timeline: form.timeline.trim(),
      teamSize: Number(form.teamSize) || 3,
      techStack: form.techStack.split(",").map((x) => x.trim()).filter(Boolean),
      objectives: toLines(form.objectives),
      deliverables: toLines(form.deliverables),
      features: form.features
        .filter((ft) => ft.name.trim())
        .map((ft) => ({ name: ft.name.trim(), description: ft.description.trim(), priority: ft.priority })),
    };

    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create project.");

      setShowCreate(false);
      await fetchProjects();
      // Chain straight into team assignment for the freshly created project
      if (canAssignProject && data?._id) {
        handleAssignTeam(data._id);
      } else {
        showAlert("Project created successfully.", "success");
      }
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter !== "all") {
      if (filter === "assigned" && p.status === "unassigned") return false;
      if (filter === "unassigned" && p.status !== "unassigned") return false;
    }
    if (search) {
      if (!p.title.toLowerCase().includes(search.toLowerCase()) && !p.domain.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case "beginner": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "intermediate": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "advanced": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      default: return "text-white/60 bg-white/10 border-white/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] overflow-hidden relative">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(129,236,255,0.14),transparent_28%),linear-gradient(180deg,#070910_0%,#0b1020_44%,#070910_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-30 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <AdminSidebar onLogout={() => {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }} />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#070910]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 md:px-8 lg:pl-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">Track and assign work</p>
            <h1 className="mt-2 text-2xl font-bold text-white font-headline md:text-3xl">Projects</h1>
          </div>
          <div className="flex items-center gap-3 md:flex-1 md:justify-end">
            <div className="hidden md:flex max-w-md flex-1">
              <input
                type="text"
                placeholder="Search PRDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/6 py-3 px-6 text-sm text-white outline-none transition-all placeholder:text-white/35 focus:border-primary/60 focus:bg-white/10"
              />
            </div>
            {canCreateProject && (
              <button
                onClick={openCreate}
                className="shrink-0 bg-gradient-to-r from-primary to-secondary text-black font-headline font-bold px-5 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(241,131,255,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg font-bold">add</span>
                New Project
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 pb-16 pt-8 md:px-8 lg:pl-28">
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === "all" ? "bg-white text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>All Projects</button>
          <button onClick={() => setFilter("unassigned")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === "unassigned" ? "bg-white text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>Unassigned</button>
          <button onClick={() => setFilter("assigned")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === "assigned" ? "bg-white text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>Assigned</button>
        </div>

        {loading ? (
          <div className="text-white/50 text-center py-20 animate-pulse">Loading PRDs...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-20">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project._id} className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)] p-6 hover:-translate-y-1 hover:border-[#f183ff]/30 transition-all group">
                <div className="absolute top-0 right-0 p-6 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${project.status === 'unassigned' ? 'text-white/60 border-white/20' : 'text-primary border-primary/30 bg-primary/10'}`}>
                    {project.status}
                  </span>
                </div>

                <div className="mt-2 mb-4 pr-32">
                  <span className="text-xs text-primary/80 font-bold uppercase tracking-widest">{project.domain}</span>
                  <h3 className="text-xl font-bold text-white mt-1 font-headline leading-tight">{project.title}</h3>
                </div>

                <p className="text-sm text-white/60 mb-6 line-clamp-2">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-[#0c0f1a] border border-white/5 text-white/70">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 mt-auto">
                  {project.status === "unassigned" ? (
                    <button
                      onClick={() => handleAssignTeam(project._id)}
                      disabled={assigningId === project._id || !canAssignProject}
                      title={!canAssignProject ? "Only leads and above can assign teams" : undefined}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-lg">psychology</span>
                      {assigningId === project._id ? "Calculating..." : "Auto-Assign Team via AI Engine"}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#0c0f1a] rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-2">Assigned Team ({project.teamMembers?.length || 0})</p>
                        <div className="flex -space-x-2">
                          {(project.teamMembers || []).map((member, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border border-[#0c0f1a] flex items-center justify-center text-xs font-bold text-white shadow-sm" title={member.memberId?.fullName || "Member"}>
                              {(member.memberId?.fullName || "?")[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedProject(project)}
                        className="w-14 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center text-white/70"
                        title="Live Review Thread"
                      >
                        <span className="material-symbols-outlined">forum</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0c0f1a] h-full flex flex-col border-l border-white/10 shadow-2xl animate-slide-in-right">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#070910]">
              <div>
                <span className="text-xs text-primary/80 font-bold uppercase tracking-widest">{selectedProject.domain}</span>
                <h2 className="text-xl font-bold text-white mt-1 font-headline">{selectedProject.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                {selectedProject.status === "in_progress" && canAssignProject && (
                  <button
                    onClick={handleCompleteProject}
                    className="px-4 py-2 rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/20 text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Mark as Completed
                  </button>
                )}
                <button onClick={() => setSelectedProject(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
                  <span className="material-symbols-outlined text-white/70">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-[#0c0f1a]">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">Project PRD</h4>
                <p className="text-sm text-white/60">{selectedProject.description}</p>
              </div>

              <div className="border-t border-white/10 my-2"></div>

              <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-base">forum</span> Live Review Thread
              </h4>
              
              {(!selectedProject.threads || selectedProject.threads.length === 0) ? (
                <div className="text-center py-10 text-white/40 text-sm">No messages yet. Post a review or ask for an update!</div>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  {selectedProject.threads.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.senderRole !== 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/80">{msg.senderName}</span>
                        <span className={`text-[10px] uppercase px-1.5 rounded ${msg.senderRole !== 'user' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/10 text-white/60'}`}>
                          {msg.senderRole}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.senderRole !== 'user' ? 'bg-emerald-400/10 border border-emerald-400/20 text-white' : 'bg-white/5 border border-white/10 text-white/90'}`}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-white/40 mt-1">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handlePostMessage} className="p-4 border-t border-white/10 bg-[#070910] flex gap-3">
              <input 
                type="text" 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Post a review, guidance, or reply..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50"
              />
              <button 
                type="submit" 
                disabled={posting || !message.trim()}
                className="bg-primary text-black px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-primary/90 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                {posting ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-2xl max-h-full overflow-y-auto rounded-3xl border border-white/10 bg-[#0c0f1a]/97 backdrop-blur-[24px] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative custom-scrollbar">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold font-headline text-white tracking-wide">New Project</h3>
                <p className="text-[#aea9b6] text-xs mt-1">Draft a PRD manually or let AI scaffold it for you</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-[#aea9b6] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/4 border border-white/8 w-fit">
              <button
                onClick={() => setCreateTab("ai")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${createTab === "ai" ? "bg-primary text-black" : "text-white/70 hover:text-white"}`}
              >
                <span className="material-symbols-outlined text-base">auto_awesome</span> AI Generate
              </button>
              <button
                onClick={() => setCreateTab("manual")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${createTab === "manual" ? "bg-primary text-black" : "text-white/70 hover:text-white"}`}
              >
                Manual
              </button>
            </div>

            {createTab === "ai" ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Describe the project idea</label>
                  <textarea
                    rows={6}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. A web dashboard for tracking club attendance with QR check-in, role-based access, and analytics charts."
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all resize-none"
                  />
                </div>
                {aiError && (
                  <div className="p-3 rounded-lg bg-[#ff6e84]/8 border border-[#ff6e84]/25 text-xs text-[#ff6e84]">✗ {aiError}</div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-5 py-2.5 border border-white/10 hover:bg-white/4 text-white rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={aiLoading}
                    className="bg-gradient-to-r from-primary to-secondary text-black font-headline font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(241,131,255,0.25)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    {aiLoading ? "Generating…" : "Generate Draft"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="Project name"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Domain</label>
                    <select
                      value={form.domain}
                      onChange={(e) => setField("domain", e.target.value)}
                      className="w-full bg-[#0c0f1a] border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    >
                      {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setField("difficulty", e.target.value)}
                      className="w-full bg-[#0c0f1a] border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all capitalize"
                    >
                      {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Timeline</label>
                    <input
                      type="text"
                      value={form.timeline}
                      onChange={(e) => setField("timeline", e.target.value)}
                      placeholder="e.g. 4 weeks"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Team Size</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={form.teamSize}
                      onChange={(e) => setField("teamSize", e.target.value)}
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Description *</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="What is this project about?"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Tech Stack <span className="text-white/30 normal-case">(comma-separated)</span></label>
                  <input
                    type="text"
                    value={form.techStack}
                    onChange={(e) => setField("techStack", e.target.value)}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Objectives <span className="text-white/30 normal-case">(one per line)</span></label>
                    <textarea
                      rows={3}
                      value={form.objectives}
                      onChange={(e) => setField("objectives", e.target.value)}
                      placeholder={"Build X\nIntegrate Y"}
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Deliverables <span className="text-white/30 normal-case">(one per line)</span></label>
                    <textarea
                      rows={3}
                      value={form.deliverables}
                      onChange={(e) => setField("deliverables", e.target.value)}
                      placeholder={"Frontend repo\nAPI docs"}
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-white/20 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aea9b6] ml-1">Features</label>
                    <button type="button" onClick={addFeature} className="text-xs text-primary hover:text-primary/80 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">add</span> Add
                    </button>
                  </div>
                  {form.features.length === 0 && (
                    <p className="text-xs text-white/30 ml-1">No features added.</p>
                  )}
                  {form.features.map((ft, i) => (
                    <div key={i} className="flex gap-2 items-start bg-white/3 border border-white/8 rounded-xl p-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={ft.name}
                          onChange={(e) => updateFeature(i, "name", e.target.value)}
                          placeholder="Feature name"
                          className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary placeholder:text-white/20"
                        />
                        <input
                          type="text"
                          value={ft.description}
                          onChange={(e) => updateFeature(i, "description", e.target.value)}
                          placeholder="Short description"
                          className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary placeholder:text-white/20"
                        />
                      </div>
                      <select
                        value={ft.priority}
                        onChange={(e) => updateFeature(i, "priority", e.target.value)}
                        className="bg-[#0c0f1a] border border-white/8 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-primary capitalize"
                      >
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button type="button" onClick={() => removeFeature(i)} className="text-white/40 hover:text-rose-400 p-1.5">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-5 py-2.5 border border-white/10 hover:bg-white/4 text-white rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-gradient-to-r from-primary to-secondary text-black font-headline font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(241,131,255,0.25)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {creating ? "Creating…" : "Create Project"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Generic Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0c0f1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 font-headline">Confirm Action</h3>
            <p className="text-white/60 text-sm mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={() => confirmModal.onConfirm && confirmModal.onConfirm()}
                className="px-4 py-2 rounded-xl bg-primary text-black hover:bg-primary/90 transition-all text-sm font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0c0f1a] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-up text-center">
            <div className={`mx-auto w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
              alertModal.type === 'error' ? 'bg-red-500/20 text-red-400' :
              alertModal.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-primary/20 text-primary'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {alertModal.type === 'error' ? 'error' : alertModal.type === 'success' ? 'check_circle' : 'info'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-headline">
              {alertModal.type === 'error' ? 'Error' : alertModal.type === 'success' ? 'Success' : 'Notice'}
            </h3>
            <p className="text-white/60 text-sm mb-6">{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({ isOpen: false, message: "", type: "info" })}
              className="w-full py-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 transition-all text-sm font-bold"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
