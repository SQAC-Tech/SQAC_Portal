import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Navbar from "../../components/common/layout/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", onConfirm: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "info" });

  const showAlert = (message, type = "info") => {
    setAlertModal({ isOpen: true, message, type });
  };

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/my-projects`, {
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
    fetchMyProjects();
  }, []);

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
      fetchMyProjects(); // Refresh background list
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setPosting(false);
    }
  };

  const handleCompleteProject = () => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to mark this project as completed? This will inform admins and free up your team.",
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
          fetchMyProjects();
        } catch (err) {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          showAlert(err.message, "error");
        }
      }
    });
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case "beginner": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "intermediate": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "advanced": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      default: return "text-white/60 bg-white/10 border-white/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] overflow-hidden relative flex pt-16">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(129,236,255,0.14),transparent_28%),linear-gradient(180deg,#070910_0%,#0b1020_44%,#070910_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-30 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <AdminSidebar onLogout={() => {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden pl-0 lg:pl-24">
        <header className="flex-shrink-0 z-40 border-b border-white/8 bg-[#070910]/70 backdrop-blur-2xl px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">Workspace</p>
          <h1 className="mt-2 text-2xl font-bold text-white font-['Space_Grotesk'] md:text-3xl">My Assigned Projects</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="text-white/50 text-center py-20 animate-pulse">Loading assignments...</div>
          ) : error ? (
            <div className="text-red-400 text-center py-20">{error}</div>
          ) : projects.length === 0 ? (
            <div className="text-white/50 text-center py-20 text-lg">You have not been assigned any projects yet.</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.07] transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs text-primary/80 font-bold uppercase tracking-widest">{project.domain}</span>
                      <h3 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk']">{project.title}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mb-6 flex-1">{project.description}</p>
                  
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="mt-auto w-full py-3 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all font-bold text-sm"
                  >
                    Open Project Workspace & Live Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0d1220] h-full flex flex-col border-l border-white/10 shadow-2xl animate-slide-in-right">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#070910]">
              <div>
                <span className="text-xs text-primary/80 font-bold uppercase tracking-widest">{selectedProject.domain}</span>
                <h2 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk']">{selectedProject.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                {selectedProject.status === "in_progress" && (
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
                <div className="flex gap-2 flex-wrap mt-3">
                  {selectedProject.techStack.map(t => (
                    <span key={t} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white/70">{t}</span>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 my-2"></div>

              <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-base">forum</span> Live Review Thread
              </h4>
              
              {(!selectedProject.threads || selectedProject.threads.length === 0) ? (
                <div className="text-center py-10 text-white/40 text-sm">No messages yet. Start the thread by posting your updates!</div>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  {selectedProject.threads.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.senderRole === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/80">{msg.senderName}</span>
                        <span className={`text-[10px] uppercase px-1.5 rounded ${msg.senderRole === 'user' ? 'bg-white/10 text-white/60' : 'bg-primary/20 text-primary'}`}>
                          {msg.senderRole}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.senderRole === 'user' ? 'bg-primary/20 border border-primary/30 text-white' : 'bg-white/5 border border-white/10 text-white/90'}`}>
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
                placeholder="Post an update, link, or review..."
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

export default MyProjects;
