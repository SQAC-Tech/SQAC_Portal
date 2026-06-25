import React from "react";
import { Link } from "react-router-dom";
import PremiumCard from "../ui/PremiumCard";

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
    <PremiumCard hover padding="none" className="h-full">
      {/* Accent rail */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${a.text} bg-current opacity-50`} />
      <div className="relative flex items-start gap-3.5 p-4 pl-5">
        <div className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${a.bg} border ${a.border} transition-transform group-hover:scale-105`}>
          <span className={`material-symbols-outlined text-xl ${a.text}`}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
          <p className="text-2xl font-bold font-headline text-white mt-1 leading-none">
            {value ?? "—"}
          </p>
          {sub && <p className="text-[11px] text-white/35 mt-1.5">{sub}</p>}
        </div>
        {linkTo && (
          <span className={`shrink-0 material-symbols-outlined text-sm ${a.text} opacity-0 group-hover:opacity-70 -translate-x-1 group-hover:translate-x-0 transition-all mt-1`}>
            arrow_forward
          </span>
        )}
      </div>
    </PremiumCard>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block h-full">{inner}</Link>;
  }
  return inner;
}
