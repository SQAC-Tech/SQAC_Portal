import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Navbar from "../../components/common/layout/Navbar";
import { usePermissions } from "../../utils/usePermissions";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Projects = () => {
  const { canAssignProject } = usePermissions();
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
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] overflow-hidden relative pt-16">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(129,236,255,0.14),transparent_28%),linear-gradient(180deg,#070910_0%,#0b1020_44%,#070910_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-30 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <AdminSidebar onLogout={() => {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }} />

      <header className="sticky top-16 z-40 border-b border-white/8 bg-[#070910]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 md:px-8 lg:pl-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">Project Database</p>
            <h1 className="mt-2 text-2xl font-bold text-white font-['Space_Grotesk'] md:text-3xl">Command Deck</h1>
          </div>
          <div className="hidden flex-1 md:flex max-w-md">
            <input
              type="text"
              placeholder="Search PRDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/6 py-3 px-6 text-sm text-white outline-none transition-all placeholder:text-white/35 focus:border-primary/60 focus:bg-white/10"
            />
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
              <div key={project._id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.07] transition-all relative overflow-hidden group">
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
                  <h3 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk'] leading-tight">{project.title}</h3>
                </div>

                <p className="text-sm text-white/60 mb-6 line-clamp-2">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-[#0d1220] border border-white/5 text-white/70">
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
                      <div className="flex-1 bg-[#0d1220] rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-2">Assigned Team ({project.teamMembers?.length || 0})</p>
                        <div className="flex -space-x-2">
                          {(project.teamMembers || []).map((member, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border border-[#0d1220] flex items-center justify-center text-xs font-bold text-white shadow-sm" title={member.memberId?.fullName || "Member"}>
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
          <div className="w-full max-w-2xl bg-[#0d1220] h-full flex flex-col border-l border-white/10 shadow-2xl animate-slide-in-right">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#070910]">
              <div>
                <span className="text-xs text-primary/80 font-bold uppercase tracking-widest">{selectedProject.domain}</span>
                <h2 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk']">{selectedProject.title}</h2>
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

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-[#0d1220]">
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

      {/* Generic Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0d1220] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">Confirm Action</h3>
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
          <div className="bg-[#0d1220] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-up text-center">
            <div className={`mx-auto w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
              alertModal.type === 'error' ? 'bg-red-500/20 text-red-400' :
              alertModal.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-primary/20 text-primary'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {alertModal.type === 'error' ? 'error' : alertModal.type === 'success' ? 'check_circle' : 'info'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">
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
