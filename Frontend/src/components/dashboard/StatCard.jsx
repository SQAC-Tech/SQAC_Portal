import React from "react";
import { Link } from "react-router-dom";

const ACCENTS = {
  magenta: { bg: "bg-[#f183ff]/10", border: "border-[#f183ff]/20", text: "text-[#f183ff]" },
  cyan:    { bg: "bg-[#81ecff]/10", border: "border-[#81ecff]/20", text: "text-[#81ecff]" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-400/20", text: "text-emerald-300" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-400/20",   text: "text-amber-300" },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-400/20",  text: "text-violet-300" },
};

export default function StatCard({ icon, label, value, sub, linkTo, accent = "magenta" }) {
  const a = ACCENTS[accent] || ACCENTS.magenta;

  const inner = (
    <div className="relative rounded-2xl border border-white/8 bg-[#0c0f1a]/70 backdrop-blur-xl p-4 flex items-start gap-3.5 overflow-hidden group hover:border-white/15 transition-all duration-200">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${a.bg} border ${a.border}`}>
        <span className={`material-symbols-outlined text-lg ${a.text}`}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
        <p className="text-[1.35rem] font-bold font-headline text-white mt-0.5 leading-none">
          {value ?? "—"}
        </p>
        {sub && <p className="text-[11px] text-white/35 mt-1">{sub}</p>}
      </div>
      {linkTo && (
        <span className={`shrink-0 material-symbols-outlined text-sm ${a.text} opacity-0 group-hover:opacity-60 transition-opacity mt-1`}>
          arrow_forward
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block">{inner}</Link>;
  }
  return inner;
}
