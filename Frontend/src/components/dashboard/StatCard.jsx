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
      <div className="relative flex items-start gap-3.5 p-4">
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
    </PremiumCard>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block h-full">{inner}</Link>;
  }
  return inner;
}
