import React from "react";

/**
 * Section header — small uppercase label with an optional trailing action
 * (e.g. a "View all →" link). One consistent style for in-page sections.
 *
 * @param {string} title
 * @param {string} [icon]   Optional material-symbols name.
 * @param {React.ReactNode} [action]
 */
const SectionHeader = ({ title, icon, action, className = "" }) => (
  <div className={`mb-4 flex items-center justify-between gap-3 ${className}`}>
    <div className="flex items-center gap-2">
      {icon && <span className="material-symbols-outlined text-[18px] text-[#f183ff]">{icon}</span>}
      <h2 className="font-headline text-sm font-bold uppercase tracking-[0.15em] text-white">
        {title}
      </h2>
    </div>
    {action}
  </div>
);

export default SectionHeader;
