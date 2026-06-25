import React from "react";
import { Link } from "react-router-dom";

export default function QuickActionsWidget({ actions = [] }) {
  return (
    <div className={`grid gap-3 ${actions.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
      {actions.map((action) => {
        const inner = (
          <div className="group relative p-3.5 rounded-2xl bg-[#0c0f1a]/70 border border-white/8 hover:border-white/18 transition-all text-center flex flex-col items-center gap-2 overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`relative h-9 w-9 rounded-xl bg-gradient-to-br ${action.gradient} p-[1px]`}>
              <div className="h-full w-full rounded-xl bg-[#0c0f1a]/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[17px]">{action.icon}</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-white/60 group-hover:text-white transition-colors leading-tight text-center relative">
              {action.label}
            </span>
          </div>
        );

        if (action.href) {
          return (
            <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          );
        }
        return (
          <Link key={action.label} to={action.to || "#"}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
