import React from "react";
import { Link } from "react-router-dom";

// Keys match the project schema's difficulty values (beginner/intermediate/advanced).
const DIFFICULTY_COLORS = {
  beginner:     "bg-emerald-500/10 border-emerald-400/20 text-emerald-300",
  intermediate: "bg-amber-500/10   border-amber-400/20   text-amber-300",
  advanced:     "bg-red-500/10     border-red-400/20     text-red-300",
};

const DOMAIN_COLORS = {
  Technical:  "text-blue-300",
  Corporate:  "text-amber-300",
  Board:      "text-[#f183ff]",
};

export default function MyProjectsWidget({ projects = [], limit = 3, linkTo = "/user/projects" }) {
  const list = projects.slice(0, limit);

  if (list.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-white/25">
        <span className="material-symbols-outlined text-3xl">rocket_launch</span>
        <p className="text-xs">No projects assigned yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {list.map((project) => {
        const diffClass = DIFFICULTY_COLORS[project.difficulty] || DIFFICULTY_COLORS.intermediate;
        const domainColor = DOMAIN_COLORS[project.domain] || "text-white/50";

        return (
          <div
            key={project._id}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/15 transition-all flex flex-col gap-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${domainColor} mb-0.5`}>
                  {project.domain || "General"}
                </p>
                <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                  {project.title}
                </h4>
              </div>
              {project.difficulty && (
                <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${diffClass}`}>
                  {project.difficulty}
                </span>
              )}
            </div>

            {project.description && (
              <p className="text-[11px] text-white/45 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Status pill */}
            {project.status && (
              <span className={`self-start text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                project.status === "completed"
                  ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300"
                  : project.status === "in-progress" || project.status === "in_progress"
                  ? "bg-blue-500/10 border-blue-400/20 text-blue-300"
                  : "bg-white/5 border-white/10 text-white/40"
              }`}>
                {project.status.replace(/-|_/g, " ")}
              </span>
            )}

            <Link
              to={linkTo}
              className="mt-auto text-[11px] font-semibold text-[#f183ff] hover:text-[#ff6c95] transition-colors"
            >
              Open workspace →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
