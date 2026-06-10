import React, { useRef, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import MOMGenerator from "../mom/MOMGenerator";
import Navbar from "../../components/common/layout/Navbar";

const AdminMOMGenerator = () => {
  const handleLogout = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/logout`,
        { method: "POST", credentials: "include" }
      );
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#070910] text-[#f5eefc] relative overflow-hidden pt-16">
      <Navbar />
      {/* Background — matches admin aesthetic */}
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(circle_at_top_left,rgba(241,131,255,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(129,236,255,0.14),transparent_28%),linear-gradient(180deg,#070910_0%,#0b1020_44%,#070910_100%)]" />
      <div className="bg-grid pointer-events-none fixed inset-0 -z-30 opacity-70" />
      <div className="member-orb fixed -left-24 top-10 -z-20 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="member-orb member-orb-b fixed right-0 top-48 -z-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-[130px]" />

      <AdminSidebar onLogout={handleLogout} />

      {/* Offset content to account for the fixed sidebar (sidebar is ~94px wide from left edge) */}
      <div className="lg:pl-28">
        <MOMGenerator />
      </div>
    </div>
  );
};

export default AdminMOMGenerator;
