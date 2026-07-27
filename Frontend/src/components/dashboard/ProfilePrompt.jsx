import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SNOOZE_KEY = "profilePromptDismissedAt";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // re-nudge after 3 days

/**
 * Dashboard nudge: prompts the member to finish their profile and add skills
 * (so the recommendation engine can match them to projects). Shows only when
 * the profile is incomplete or no skills are set yet, and snoozes on dismissal.
 * Fully responsive — a bottom sheet on phones, a centered card on desktop.
 */
export default function ProfilePrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const ts = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      if (ts && Date.now() - ts < SNOOZE_MS) return; // recently dismissed
    } catch { /* ignore */ }

    let user = {};
    try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch { /* ignore */ }
    if (!user?.email) return;

    let cancelled = false;
    (async () => {
      let needs = user.profileCompleted !== true;
      if (!needs) {
        try {
          const res = await fetch(
            `${API}/api/projects/members/email/${encodeURIComponent(user.email)}`,
            { credentials: "include" }
          );
          if (res.ok) {
            const mp = await res.json();
            needs = !mp || !(mp.overallScore > 0); // no skills rated yet
          } else {
            needs = true; // no skills profile exists yet
          }
        } catch {
          needs = false; // network error — don't nag
        }
      }
      if (!cancelled && needs) setShow(true);
    })();

    return () => { cancelled = true; };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now())); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0f1a]/98 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] relative">
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#f183ff] via-[#ff6c95] to-[#81ecff]" />

        <div className="flex items-start gap-4">
          <div className="shrink-0 h-12 w-12 rounded-2xl bg-[#f183ff]/10 border border-[#f183ff]/25 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#f183ff]">badge</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white font-headline">Complete your profile</h3>
            <p className="text-sm text-white/55 mt-1 leading-relaxed">
              Add your skills and finish your profile so you get matched to the right projects.
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="ml-auto shrink-0 h-8 w-8 rounded-lg text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={dismiss}
            className="order-2 sm:order-1 sm:flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/65 hover:bg-white/10 hover:text-white transition-colors"
          >
            Maybe later
          </button>
          <Link
            to="/user/profile"
            onClick={dismiss}
            className="order-1 sm:order-2 sm:flex-[1.4] py-2.5 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-center text-sm font-bold text-black hover:-translate-y-0.5 transition-transform"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
