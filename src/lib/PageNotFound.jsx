// Permission definitions
export const PERMISSIONS = {
  // Epic permissions
  CREATE_EPIC: "create_epic",
  EDIT_EPIC: "edit_epic",
  DELETE_EPIC: "delete_epic",

  // Issue permissions
  CREATE_ISSUE: "create_issue",
  EDIT_ISSUE: "edit_issue",
  DELETE_ISSUE: "delete_issue",

  // Project permissions
  CREATE_PROJECT: "create_project",
  EDIT_PROJECT: "edit_project",
  DELETE_PROJECT: "delete_project",
  MANAGE_PROJECT_ACCESS: "manage_project_access",

  // Task permissions
  CREATE_TASK: "create_task",
  EDIT_TASK: "edit_task",
  DELETE_TASK: "delete_task",

  // Comment permissions
  CREATE_COMMENT: "create_comment",
  EDIT_COMMENT: "edit_comment",
  DELETE_COMMENT: "delete_comment",

  // User management
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  VIEW_REPORTS: "view_reports",
};

// Default roles
export const DEFAULT_ROLES = {
  ADMIN: {
    name: "Admin",
    description: "Full access to all features",
    permissions: Object.values(PERMISSIONS),
    is_custom: false,
  },
  EDITOR: {
    name: "Editor",
    description: "Can create and edit content",
    permissions: [
      PERMISSIONS.CREATE_EPIC,
      PERMISSIONS.EDIT_EPIC,
      PERMISSIONS.CREATE_ISSUE,
      PERMISSIONS.EDIT_ISSUE,
      PERMISSIONS.CREATE_TASK,
      PERMISSIONS.EDIT_TASK,
      PERMISSIONS.CREATE_COMMENT,
      PERMISSIONS.EDIT_COMMENT,
      PERMISSIONS.VIEW_REPORTS,
    ],
    is_custom: false,
  },
  PROJECT_LEAD: {
    name: "Project Lead",
    description: "Can manage specific projects",
    permissions: [
      PERMISSIONS.CREATE_EPIC,
      PERMISSIONS.EDIT_EPIC,
      PERMISSIONS.DELETE_EPIC,
      PERMISSIONS.CREATE_ISSUE,
      PERMISSIONS.EDIT_ISSUE,
      PERMISSIONS.DELETE_ISSUE,
      PERMISSIONS.EDIT_PROJECT,
      PERMISSIONS.MANAGE_PROJECT_ACCESS,
      PERMISSIONS.CREATE_TASK,
      PERMISSIONS.EDIT_TASK,
      PERMISSIONS.DELETE_TASK,
      PERMISSIONS.CREATE_COMMENT,
      PERMISSIONS.VIEW_REPORTS,
    ],
    is_custom: false,
  },
  VIEWER: {
    name: "Viewer",
    description: "Read-only access",
    permissions: [PERMISSIONS.VIEW_REPORTS],
    is_custom: false,
  },
};

export const PERMISSION_LABELS = {
  [PERMISSIONS.CREATE_EPIC]: "Create Epics",
  [PERMISSIONS.EDIT_EPIC]: "Edit Epics",
  [PERMISSIONS.DELETE_EPIC]: "Delete Epics",
  [PERMISSIONS.CREATE_ISSUE]: "Create Issues",
  [PERMISSIONS.EDIT_ISSUE]: "Edit Issues",
  [PERMISSIONS.DELETE_ISSUE]: "Delete Issues",
  [PERMISSIONS.CREATE_PROJECT]: "Create Projects",
  [PERMISSIONS.EDIT_PROJECT]: "Edit Projects",
  [PERMISSIONS.DELETE_PROJECT]: "Delete Projects",
  [PERMISSIONS.MANAGE_PROJECT_ACCESS]: "Manage Project Access",
  [PERMISSIONS.CREATE_TASK]: "Create Tasks",
  [PERMISSIONS.EDIT_TASK]: "Edit Tasks",
  [PERMISSIONS.DELETE_TASK]: "Delete Tasks",
  [PERMISSIONS.CREATE_COMMENT]: "Create Comments",
  [PERMISSIONS.EDIT_COMMENT]: "Edit Comments",
  [PERMISSIONS.DELETE_COMMENT]: "Delete Comments",
  [PERMISSIONS.MANAGE_USERS]: "Manage Users",
  [PERMISSIONS.MANAGE_ROLES]: "Manage Roles",
  [PERMISSIONS.VIEW_REPORTS]: "View Reports",
};

import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PageNotFound() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-8">Page not found</p>
        <Link
          to={createPageUrl("Inbox")}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}