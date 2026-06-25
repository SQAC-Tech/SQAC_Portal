import React from "react";

/**
 * Premium card — the signature SQAC profile card aesthetic, reusable.
 * Gradient hairline border + radial brand glow + glass gradient inner + soft
 * deep shadow. Matches `.member-id-card` from index.css.
 *
 * @param {boolean} [hover=false]  Adds the 3D tilt + shimmer sweep on hover
 *        (the full `.member-id-card` treatment). Off by default so dense
 *        layouts stay calm; turn on for feature cards.
 * @param {("sm"|"md"|"lg"|"none")} [padding="md"]
 * @param {string} [innerClassName]  Extra classes on the inner surface.
 * @param {React.ElementType} [as="div"]
 */
const PADDING = {
  none: "",
  sm: "p-5",
  md: "p-6",
  lg: "p-6 md:p-8",
};

const PremiumCard = ({
  hover = false,
  padding = "md",
  className = "",
  innerClassName = "",
  as: Tag = "div",
  children,
  ...rest
}) => (
  <Tag
    className={`group relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.04] p-[1px] shadow-[0_30px_80px_rgba(4,6,20,0.42)] ${
      hover ? "member-id-card " : ""
    }${className}`}
    {...rest}
  >
    {/* Radial brand glow */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(129,236,255,0.18),transparent_34%)] opacity-80" />
    {/* Glass inner surface */}
    <div
      className={`member-id-card__inner relative h-full rounded-[calc(2rem-1px)] border border-white/8 bg-[linear-gradient(155deg,rgba(22,20,31,0.98),rgba(12,11,18,0.92))] ${
        PADDING[padding] ?? PADDING.md
      } ${innerClassName}`}
    >
      {children}
    </div>
  </Tag>
);

export default PremiumCard;
