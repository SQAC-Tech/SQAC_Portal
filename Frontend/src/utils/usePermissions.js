import { useMemo } from "react";

// Mirrors Backend/src/middleware/permissions.middleware.js — keep in sync
const PERMISSIONS = {
  APPROVE_MEMBER:    ["secretary"],
  REJECT_MEMBER:     ["secretary"],
  DELETE_MEMBER:     ["secretary"],
  CHANGE_ROLE:       ["secretary"],
  SEND_MASS_MAIL:    ["secretary", "joint_secretary"],
  ASSIGN_PROJECT:    ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
  SCHEDULE_MEET:     ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
  SEND_NOTICE:       ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
  ISSUE_WARNING:     ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
  GENERATE_CERT:     ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead"],
  GENERATE_MOM:      ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead", "associate_lead", "member"],
  VIEW_MEMBERS:      ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead", "associate_lead"],
  MANAGE_ATTENDANCE: ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
};

const has = (role, action) => (PERMISSIONS[action] || []).includes(role);

export function usePermissions() {
  return useMemo(() => {
    let role = "member";
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      role = u.role || "member";
    } catch (_) {}

    return {
      role,
      canApproveMember:   has(role, "APPROVE_MEMBER"),
      canRejectMember:    has(role, "REJECT_MEMBER"),
      canDeleteMember:    has(role, "DELETE_MEMBER"),
      canChangeRole:      has(role, "CHANGE_ROLE"),
      canSendMassMail:    has(role, "SEND_MASS_MAIL"),
      canAssignProject:   has(role, "ASSIGN_PROJECT"),
      canScheduleMeet:    has(role, "SCHEDULE_MEET"),
      canSendNotice:      has(role, "SEND_NOTICE"),
      canIssueWarning:    has(role, "ISSUE_WARNING"),
      canGenerateCert:    has(role, "GENERATE_CERT"),
      canGenerateMom:     has(role, "GENERATE_MOM"),
      canViewMembers:     has(role, "VIEW_MEMBERS"),
      canManageAttendance: has(role, "MANAGE_ATTENDANCE"),
    };
  }, []);
}
