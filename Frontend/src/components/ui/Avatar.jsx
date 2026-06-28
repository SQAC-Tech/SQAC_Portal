import React, { useState } from "react";
import { isDefaultAvatar } from "../../utils/memberHelpers";

/**
 * Avatar with a branded fallback: when no/failed image, shows the SQAC logo
 * on a subtle brand surface instead of a generic placeholder.
 *
 * @param {string} [src]   Image URL.
 * @param {string} [alt]
 * @param {("xs"|"sm"|"md"|"lg"|"xl"|number)} [size="md"]  px or named.
 * @param {boolean} [ring]  Brand gradient ring around the avatar.
 */
const SIZE_MAP = { xs: 28, sm: 40, md: 56, lg: 80, xl: 112 };

const Avatar = ({ src, alt = "", size = "md", ring = false, className = "" }) => {
  const px = typeof size === "number" ? size : SIZE_MAP[size] || SIZE_MAP.md;
  const [failed, setFailed] = useState(false);
  const showImage = src && !isDefaultAvatar(src) && !failed;

  const inner = (
    <div
      className="relative h-full w-full overflow-hidden rounded-[inherit] border border-white/10 bg-white/5"
      style={{ borderRadius: ring ? undefined : px * 0.28 }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,rgba(241,131,255,0.18),rgba(129,236,255,0.1))]">
          <img
            src="/sqac-logo.png"
            alt={alt || "SQAC"}
            className="h-[58%] w-[58%] object-contain opacity-90"
          />
        </div>
      )}
    </div>
  );

  if (!ring) {
    return (
      <div className={`shrink-0 ${className}`} style={{ width: px, height: px }}>
        {inner}
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 rounded-[1.1rem] bg-[linear-gradient(145deg,rgba(241,131,255,0.5),rgba(129,236,255,0.22))] p-0.5 ${className}`}
      style={{ width: px, height: px }}
    >
      {inner}
    </div>
  );
};

export default Avatar;
