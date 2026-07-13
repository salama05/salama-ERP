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
};

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
