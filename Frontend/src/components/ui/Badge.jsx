import React from "react";

/**
 * Pill badge — one consistent style for status / role / meta tags.
 *
 * @param {("primary"|"cyan"|"pink"|"emerald"|"amber"|"red"|"neutral")} [tone="neutral"]
 * @param {("sm"|"md")} [size="md"]
 * @param {string} [icon]  Optional material-symbols icon name.
 */
const TONES = {
  primary: "bg-[#f183ff]/10 border-[#f183ff]/20 text-[#f183ff]",
  cyan: "bg-[#81ecff]/10 border-[#81ecff]/20 text-[#81ecff]",
  pink: "bg-[#ff6c95]/10 border-[#ff6c95]/20 text-[#ff6c95]",
  emerald: "bg-emerald-500/10 border-emerald-400/20 text-emerald-300",
  amber: "bg-amber-500/10 border-amber-400/20 text-amber-300",
  red: "bg-red-500/10 border-red-500/20 text-red-200",
  neutral: "bg-white/5 border-white/10 text-white/70",
};

const SIZES = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

const Badge = ({ tone = "neutral", size = "md", icon, className = "", children, ...rest }) => (
  <span
    className={[
      "inline-flex items-center gap-1 rounded-full border font-semibold tracking-wide",
      TONES[tone] ?? TONES.neutral,
      SIZES[size] ?? SIZES.md,
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {icon && <span className="material-symbols-outlined text-[14px] leading-none">{icon}</span>}
    {children}
  </span>
);

export default Badge;
