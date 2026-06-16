import React from "react";
import { Navigate } from "react-router-dom";

const ALL_ADMIN_ROLES = [
  "secretary",
  "joint_secretary",
  "technical_lead",
  "project_lead",
  "corp_lead",
  "domain_lead",
  "associate_lead",
];

function getUser() {
  try {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export const ProtectedRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Requires login + COC accepted
export const COCRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.cocAccepted) return <Navigate to="/accept-coc" replace />;
  return children;
};

// Requires login + COC accepted + profile completed
export const ActiveRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.cocAccepted) return <Navigate to="/accept-coc" replace />;
  if (!user.profileCompleted) return <Navigate to="/complete-profile" replace />;
  return children;
};

export const SecretaryRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "secretary") return <Navigate to="/dashboard" replace />;
  return children;
};

export const SecretaryOrJointRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "secretary" && user.role !== "joint_secretary") return <Navigate to="/dashboard" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role || "member";
  if (!ALL_ADMIN_ROLES.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
};
