import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [assigningId, setAssigningId] = useState(null);

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

  const handleAssignTeam = async (projectId) => {
    if (!window.confirm("Auto-assign a recommended team for this project based on skills?")) return;
    
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
      
      alert(`Success! Assigned ${data.project.assignedTeam.length} members to the project.`);
      fetchProjects();
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigningId(null);
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
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(129,236,255,0.14),transparent_28%),linear-gradient(180deg,#070910_0%,#0b1020_44%,#070910_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-30 opacity-70 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <AdminSidebar onLogout={() => {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }} />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#070910]/70 backdrop-blur-2xl">
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
                      disabled={assigningId === project._id}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all font-bold text-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">psychology</span>
                      {assigningId === project._id ? "Calculating..." : "Auto-Assign Team via AI Engine"}
                    </button>
                  ) : (
                    <div className="bg-[#0d1220] rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-2">Assigned Team ({project.assignedTeam.length})</p>
                      <div className="flex -space-x-2">
                        {project.assignedTeam.map((member, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-white/10 border border-[#0d1220] flex items-center justify-center text-xs font-bold text-white shadow-sm" title={member.userId?.name || "Member"}>
                            {(member.userId?.name || "?")[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
