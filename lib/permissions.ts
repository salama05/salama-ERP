export type Permission = 
  | "invoices.*"
  | "invoices.void"
  | "invoices.create"
  | "invoices.edit"
  | "products.*"
  | "products.editPrice"
  | "products.create"
  | "inventory.*"
  | "inventory.adjustStock"
  | "users.manage"
  | "reports.view"
  | "customers.*"
  | "suppliers.*"
  | "purchases.*"
  | "finance.manage"
  | "settings.manage";

export const ALL_PERMISSIONS: Permission[] = [
  "invoices.*",
  "invoices.create",
  "invoices.edit",
  "invoices.void",
  "products.*",
  "products.create",
  "products.editPrice",
  "inventory.*",
  "inventory.adjustStock",
  "customers.*",
  "suppliers.*",
  "purchases.*",
  "finance.manage",
  "users.manage",
  "reports.view",
  "settings.manage",
];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    "invoices.*", "products.*", "inventory.*", "users.manage", "reports.view",
    "customers.*", "suppliers.*", "purchases.*", "finance.manage", "settings.manage"
  ],
  OWNER: [
    "invoices.*", "products.*", "inventory.*", "users.manage", "reports.view",
    "customers.*", "suppliers.*", "purchases.*", "finance.manage", "settings.manage"
  ],
  accountant: [
    "invoices.void", "invoices.create", "invoices.edit",
    "reports.view", "finance.manage", "purchases.*"
  ],
  sales_manager: [
    "invoices.create", "invoices.edit", "products.create",
    "inventory.adjustStock", "customers.*"
  ],
  inventory_manager: [
    "products.*", "inventory.*", "invoices.create", "invoices.edit",
    "purchases.*", "suppliers.*", "reports.view"
  ],
  STAFF: [
    "invoices.create", "invoices.edit", "products.create",
    "customers.*"
  ],
  // Demo role: read + limited create/edit. No delete, no settings, no finance, no users.
  demo_user: [
    "invoices.create", "invoices.edit",
    "products.create",
    "inventory.adjustStock",
    "customers.*",
    "reports.view",
  ],
};

/** The fixed Convex orgId used for all demo sessions. */
export const DEMO_ORG_ID = "demo_workspace";

/**
 * Permissions that are completely blocked for demo users regardless of role.
 * Server-side mutations should call blockIfDemoOrg() before executing.
 */
export const DEMO_BLOCKED_PERMISSIONS: Permission[] = [
  "invoices.void",
  "invoices.*",
  "products.*",
  "products.editPrice",
  "inventory.*",
  "users.manage",
  "finance.manage",
  "settings.manage",
  "suppliers.*",
  "purchases.*",
];

/** True if the role belongs to a demo session. */
export function isDemoRole(role: string | undefined): boolean {
  return role === "demo_user";
}

export function hasPermission(
  role: string | undefined,
  customPermissions: string[] | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  
  if (role === "custom") {
    return customPermissions?.includes(permission) ?? false;
  }

  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  if (permissions.includes(permission)) return true;

  const [domain] = permission.split(".");
  if (permissions.includes(`${domain}.*` as Permission)) return true;

  return false;
}
