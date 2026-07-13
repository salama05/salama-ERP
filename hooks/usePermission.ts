import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { hasPermission, Permission } from "@/lib/permissions";

export function usePermission(permission: Permission) {
  const user = useQuery(api.users.getCurrentUser);
  
  if (user === undefined) {
    return { isLoading: true, hasPermission: false };
  }
  
  if (user === null || user.isActive === false) {
    return { isLoading: false, hasPermission: false };
  }
  
  const granted = hasPermission(user.role, user.customPermissions, permission);
  
  return { isLoading: false, hasPermission: granted, user };
}
