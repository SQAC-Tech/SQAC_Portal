import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AdminSidebar from "../../admin/AdminSidebar";
import { clearSession } from "../../../api/session";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Standard page shell — one consistent navbar offset, sidebar gutter,
 * max-width and padding for every page. Use instead of repeating the
 * Navbar + AdminSidebar + <main> scaffold on each page.
 *
 * @param {boolean} [orbs=true]      Render the default ambient background.
 * @param {string}  [maxWidth="max-w-[1500px]"]
 * @param {React.ReactNode} [stickyHeader]  Optional sticky sub-header rendered
 *        between the navbar and main (aligned to the shared gutter).
 * @param {boolean} [main=true]      When false, children are rendered directly
 *        (the page supplies its own <main> / custom layout) — the shell still
 *        provides the navbar, sidebar gutter and background.
 */
export default function AppShell({
  children,
  orbs = true,
  maxWidth = "max-w-[1500px]",
  stickyHeader = null,
  main = true,
  className = "",
}) {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
    } catch {
      /* ignore — clear client state regardless */
    }
    clearSession();
    navigate("/login");
  }, [navigate]);

  return (
    <div className={`min-h-screen bg-[#070910] text-[#f5eefc] font-body ${className}`}>
      <Navbar />
      <AdminSidebar onLogout={handleLogout} />

      {orbs && (
        <>
          <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(129,236,255,0.06),transparent_28%)]" />
          <div className="pointer-events-none fixed -left-16 top-20 -z-20 h-56 w-56 rounded-full bg-[#f183ff]/12 blur-[90px]" />
          <div className="pointer-events-none fixed right-0 bottom-24 -z-20 h-64 w-64 rounded-full bg-[#81ecff]/7 blur-[110px]" />
        </>
      )}

      {stickyHeader}

      {main ? (
        <main className={`mx-auto ${maxWidth} px-5 pb-16 pt-8 md:px-8 lg:pl-28`}>
          {children}
        </main>
      ) : (
        children
      )}
    </div>
  );
}
