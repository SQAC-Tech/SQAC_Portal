import React from "react";

/**
 * Standard surface card — the one card style used across the app.
 * Matches the existing language: rounded-2xl, hairline border, glass blur.
 *
 * @param {boolean} [hover]   Adds a subtle lift + border highlight on hover.
 * @param {("sm"|"md"|"lg"|"none")} [padding="md"]
 */
const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 md:p-8",
};

const Card = ({ hover = false, padding = "md", className = "", children, ...rest }) => (
  <div
    className={[
      "relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(22,20,31,0.96),rgba(12,11,18,0.9))] shadow-[0_30px_80px_rgba(4,6,20,0.42)]",
      PADDING[padding] ?? PADDING.md,
      hover
        ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f183ff]/30"
        : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
