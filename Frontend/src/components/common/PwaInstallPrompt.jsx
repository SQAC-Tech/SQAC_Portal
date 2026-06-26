import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const DISMISS_KEY = "pwaInstallDismissedAt";
// Re-offer the install prompt this long after a dismissal.
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;

const recentlyDismissed = () => {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return ts && Date.now() - ts < SNOOZE_MS;
  } catch {
    return false;
  }
};

/**
 * Custom "Install app" popup. Uses the browser's beforeinstallprompt event
 * (Chrome/Edge/Android) for one-tap install; on iOS Safari (no install API) it
 * shows Add-to-Home-Screen instructions. Auto-hides when already installed or
 * recently dismissed. Rendered via a portal so its fixed positioning is
 * viewport-relative regardless of where it's mounted.
 */
export default function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return undefined;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires beforeinstallprompt — surface a manual hint.
    let iosTimer;
    if (isIos()) iosTimer = setTimeout(() => setVisible(true), 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    setIosHelp(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore storage failures */
    }
  };

  const install = async () => {
    if (isIos()) {
      setIosHelp(true);
      return;
    }
    if (!deferred) return;
    deferred.prompt();
    try {
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") dismiss();
    } catch {
      /* user closed the native dialog */
    }
    setDeferred(null);
  };

  if (!visible) return null;

  return createPortal(
    <div className="fixed left-3 right-3 bottom-[5.25rem] z-[200] sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f1a]/98 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#f183ff] via-[#ff6c95] to-[#81ecff]" />

        <div className="flex items-start gap-3">
          <img
            src="/pwa-192x192.png"
            alt="SQAC"
            className="h-12 w-12 shrink-0 rounded-xl border border-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="font-headline text-sm font-bold text-white">Install SQAC Portal</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/55">
              {iosHelp
                ? "Tap the Share icon, then “Add to Home Screen”."
                : "Add the app to your home screen for a faster, full-screen experience."}
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {!iosHelp && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={dismiss}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            >
              Not now
            </button>
            <button
              onClick={install}
              className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] py-2.5 text-xs font-bold text-black shadow-[0_4px_15px_rgba(241,131,255,0.25)] transition-transform hover:scale-[1.02] active:scale-95"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Install
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
