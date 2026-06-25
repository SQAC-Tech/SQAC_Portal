import React from "react";

/**
 * Official SQAC logo — single source of truth for branding.
 * Always preserves aspect ratio (square mark) and never stretches.
 *
 * @param {("xs"|"sm"|"md"|"lg"|"xl"|"2xl"|"3xl"|number)} [size="md"]
 *        Named size maps to the approved scale (16/20/24/32/40/64/128 px),
 *        or pass a raw pixel number.
 * @param {boolean} [glow]   Soft brand glow behind the mark.
 * @param {string}  [className]
 */
const SIZE_MAP = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 64,
  "3xl": 128,
};

const SQACLogo = ({ size = "md", glow = false, className = "", alt = "SQAC", ...rest }) => {
  const px = typeof size === "number" ? size : SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      {...rest}
    >
      {glow && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-[#f183ff]/30 blur-xl"
        />
      )}
      <img
        src="/sqac-logo.png"
        alt={alt}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        className="relative h-full w-full object-contain"
      />
    </span>
  );
};

export default SQACLogo;
