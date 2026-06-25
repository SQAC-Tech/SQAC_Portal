import React from "react";
import SQACLogo from "./SQACLogo";

/**
 * Consistent empty state: icon (or brand logo) + title + description + optional action.
 *
 * @param {string}  [icon]        material-symbols name. Omit to show the SQAC logo.
 * @param {string}  title
 * @param {string}  [description]
 * @param {React.ReactNode} [action]   A button / link element.
 * @param {("sm"|"md")} [size="md"]
 */
const EmptyState = ({ icon, title, description, action, size = "md", className = "" }) => {
  const pad = size === "sm" ? "py-10" : "py-16";
  return (
    <div className={`flex flex-col items-center justify-center px-6 text-center ${pad} ${className}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
        {icon ? (
          <span className="material-symbols-outlined text-[32px] text-[#aea9b6]">{icon}</span>
        ) : (
          <SQACLogo size={32} />
        )}
      </div>
      <h3 className="font-headline text-base font-bold text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#aea9b6]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
