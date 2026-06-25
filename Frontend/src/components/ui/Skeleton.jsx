import React from "react";

/**
 * Loading skeleton block — pulse placeholder to prevent layout shift.
 * Use real dimensions via className (e.g. "h-20 w-full").
 *
 * @param {string} [rounded="rounded-2xl"]  Border-radius utility.
 */
const Skeleton = ({ className = "", rounded = "rounded-2xl", ...rest }) => (
  <div
    className={`animate-pulse bg-white/[0.05] ${rounded} ${className}`}
    aria-hidden="true"
    {...rest}
  />
);

export default Skeleton;
