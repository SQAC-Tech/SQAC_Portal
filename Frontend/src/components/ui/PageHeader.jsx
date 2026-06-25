import React from "react";

/**
 * Page header — title + subtitle on the left, optional actions on the right.
 * One consistent top-of-page block across admin/user pages.
 *
 * @param {string} title
 * @param {string} [subtitle]
 * @param {string} [icon]      Optional material-symbols name beside the title.
 * @param {React.ReactNode} [actions]
 */
const PageHeader = ({ title, subtitle, icon, actions, className = "" }) => (
  <div className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        {icon && <span className="material-symbols-outlined text-[#f183ff]">{icon}</span>}
        <h1 className="truncate font-headline text-2xl font-bold text-white">{title}</h1>
      </div>
      {subtitle && <p className="mt-1 text-sm text-[#aea9b6]">{subtitle}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
  </div>
);

export default PageHeader;
