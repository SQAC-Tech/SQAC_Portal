import React from "react";

/**
 * Brand spinner — consistent loading indicator.
 *
 * @param {("sm"|"md"|"lg"|number)} [size="md"]
 * @param {string} [label]  Optional text shown beside the spinner.
 */
const SIZE_MAP = { sm: 16, md: 22, lg: 32 };

const Spinner = ({ size = "md", label, className = "" }) => {
  const px = typeof size === "number" ? size : SIZE_MAP[size] || SIZE_MAP.md;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      <span
        className="inline-block animate-spin rounded-full border-[#f183ff] border-t-transparent"
        style={{ width: px, height: px, borderWidth: Math.max(2, Math.round(px / 10)) }}
      />
      {label && <span className="text-sm text-[#aea9b6]">{label}</span>}
      <span className="sr-only">Loading</span>
    </span>
  );
};

export default Spinner;
