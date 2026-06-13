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

export const ProtectedRoute = ({ children }) => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const SecretaryRoute = ({ children }) => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(userStr);
    if (user.role !== "secretary") return <Navigate to="/dashboard" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  try {
    const user = JSON.parse(userStr);
    const role = user.role || "member";
    if (!ALL_ADMIN_ROLES.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
