import { useMemo } from "react";

// Mirrors Backend/src/middleware/permissions.middleware.js — keep in sync
const PERMISSIONS = {
  APPROVE_MEMBER:    ["secretary"],
  REJECT_MEMBER:     ["secretary"],
  DELETE_MEMBER:     ["secretary"],
  CHANGE_ROLE:       ["secretary"],
  SEND_MASS_MAIL:    ["secretary", "joint_secretary"],
  CREATE_PROJECT:    ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
  ASSIGN_PROJECT:    ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
  SCHEDULE_MEET:     ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
  SEND_NOTICE:       ["secretary", "joint_secretary", "technical_lead", "corp_lead", "project_lead"], // board members only
  ISSUE_WARNING:     ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
  GENERATE_CERT:     ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead"],
  GENERATE_MOM:      ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead", "associate_lead", "member"],
  VIEW_MEMBERS:      ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead", "associate_lead"],
  MANAGE_ATTENDANCE: ["secretary", "joint_secretary", "technical_lead", "project_lead", "corp_lead", "domain_lead"],
};

// Board Members — leadership circle, derived from role. Keep in sync with
// Backend/src/middleware/permissions.middleware.js → BOARD_ROLES.
export const BOARD_ROLES = ["secretary", "joint_secretary", "technical_lead", "corp_lead", "project_lead"];

const has = (role, action) => (PERMISSIONS[action] || []).includes(role);

export function usePermissions() {
  return useMemo(() => {
    let role = "member";
    let isBoardMember = false;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      role = u.role || "member";
      // Trust the stored flag if present, else derive from role.
      isBoardMember = u.isBoardMember === true || BOARD_ROLES.includes(role);
    } catch (_) {}

    return {
      role,
      isBoardMember,
      canApproveMember:   has(role, "APPROVE_MEMBER"),
      canRejectMember:    has(role, "REJECT_MEMBER"),
      canDeleteMember:    has(role, "DELETE_MEMBER"),
      canChangeRole:      has(role, "CHANGE_ROLE"),
      canSendMassMail:    has(role, "SEND_MASS_MAIL"),
      canCreateProject:   has(role, "CREATE_PROJECT"),
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
