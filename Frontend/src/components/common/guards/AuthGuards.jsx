import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "../../../api/session";

const ALL_ADMIN_ROLES = [
  "secretary",
  "joint_secretary",
  "technical_lead",
  "project_lead",
  "corp_lead",
  "domain_lead",
  "associate_lead",
];

// These guards are deliberately optimistic: they render from what's in
// storage so navigation stays instant, and never claim to prove the session is
// still alive — only the server can do that. If it isn't, the first API call
// the page makes comes back 401 and the fetch interceptor
// (api/installFetchInterceptor.js) sends the user to /login.
const getUser = getStoredUser;

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
