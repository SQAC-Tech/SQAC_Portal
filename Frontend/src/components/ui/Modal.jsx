import React, { useEffect, useRef } from "react";

/**
 * Accessible modal dialog — one consistent style for the whole app.
 * - Closes on Esc and backdrop click
 * - Locks body scroll while open
 * - Moves focus into the panel; restores it on close
 * - Gradient top bar, glass panel, mobile-friendly width
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {string} [title]
 * @param {string} [icon]            material-symbols name beside the title.
 * @param {React.ReactNode} [footer] Sticky footer (e.g. action buttons).
 * @param {("sm"|"md"|"lg")} [size="md"]
 */
const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export default function Modal({ open, onClose, title, icon, footer, size = "md", children }) {
  const panelRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // focus the panel
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[90vh] w-full ${SIZES[size] ?? SIZES.md} flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f1a] shadow-overlay outline-none`}
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-[#f183ff] via-[#81ecff] to-[#ff6c95]" />

        {title && (
          <div className="flex shrink-0 items-center gap-3 border-b border-white/8 px-6 py-4">
            {icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <span className="material-symbols-outlined text-[18px] text-[#f183ff]">{icon}</span>
              </span>
            )}
            <h3 className="flex-1 font-headline text-base font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/8 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-white/8 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
