import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/layout/Navbar';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const role = currentUser?.role || "user";
  const isAdmin = role === "admin" || role === "subadmin" || role === "lead";

  const adminLinks = [
    {
      to: '/admin/mom/create',
      label: 'Create MOM',
      sub: 'Minutes of Meeting Generator',
      icon: '📝',
      gradient: 'from-[#f183ff] to-[#ff6c95]',
      border: 'border-[#f183ff]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(241,131,255,0.15)]',
    },
    {
      to: '/admin/mom/list',
      label: 'MOM History',
      sub: 'Browse past meetings',
      icon: '📋',
      gradient: 'from-[#81ecff] to-[#f183ff]',
      border: 'border-[#81ecff]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(129,236,255,0.15)]',
    },
    {
      to: '/dashboard/certificates',
      label: 'Certificate Generator',
      sub: 'Issue & manage certificates',
      icon: '🏆',
      gradient: 'from-[#ff6c95] to-[#f183ff]',
      border: 'border-[#ff6c95]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(255,108,149,0.15)]',
    },
  ];

  const userLinks = [
    {
      to: '/user/profile',
      label: 'Profile Update',
      sub: 'Manage personal details',
      icon: '👤',
      gradient: 'from-[#81ecff] to-[#f183ff]',
      border: 'border-[#81ecff]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(129,236,255,0.15)]',
    },
    {
      to: '/admin/notice',
      label: 'Noticeboard',
      sub: 'View announcements',
      icon: '📢',
      gradient: 'from-[#f183ff] to-[#ff6c95]',
      border: 'border-[#f183ff]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(241,131,255,0.15)]',
    },
    {
      to: '/meet',
      label: 'Meeting Schedule',
      sub: 'View and join meetings',
      icon: '📅',
      gradient: 'from-[#ff6c95] to-[#f183ff]',
      border: 'border-[#ff6c95]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(255,108,149,0.15)]',
    },
  ];

  const displayLinks = isAdmin ? adminLinks : userLinks;

  return (
    <div className="min-h-screen bg-[#0f0d16] text-slate-200 flex flex-col items-center justify-center p-8 font-body relative overflow-hidden pt-16 lg:pl-24">
      <Navbar />
      <AdminSidebar onLogout={handleLogout} />
      
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#f183ff]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#81ecff]/5 blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full text-center space-y-10 relative z-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 text-sm text-[#f183ff] mb-2">
            🚧 Under Construction
          </div>
          <h1 className="text-5xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f183ff] to-[#ff6c95]">
            SQAC Portal
          </h1>
          <p className="text-[#aea9b6] text-lg max-w-md mx-auto">
            {isAdmin ? "We're building something amazing. Access features below while we get everything ready." : "Welcome to your user dashboard. Access your key features below."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {displayLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group relative p-6 rounded-2xl bg-[#1b1823] border ${link.border}
                hover:border-opacity-60 ${link.glow} transition-all duration-300 text-left overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity from-white to-transparent" />
              <div className={`text-3xl mb-3 w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center`}>
                {link.icon}
              </div>
              <h3 className="font-bold text-[#f5eefc] text-base mb-1">{link.label}</h3>
              <p className="text-xs text-[#aea9b6]">{link.sub}</p>
              <div className={`mt-4 text-xs font-semibold bg-gradient-to-r ${link.gradient} bg-clip-text text-transparent`}>
                Open →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

