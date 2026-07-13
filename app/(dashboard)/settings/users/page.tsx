"use client";

import { useState, useEffect, Fragment } from "react";
import { OrganizationProfile, useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePermission } from "@/hooks/usePermission";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/taxCalculator";
import { Shield, ShieldAlert, UserCheck, UserX, UserPlus, X, Eye, EyeOff, Settings2, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { ALL_PERMISSIONS } from "@/lib/permissions";

export default function UsersSettingsPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [expandedPermissions, setExpandedPermissions] = useState<Set<string>>(new Set());
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";
  const { orgId } = useAuth();
  
  const { hasPermission, isLoading: isPermissionLoading } = usePermission("users.manage");
  const users = useQuery(api.users.listUsers, { showInactive });
  
  const updateRole = useMutation(api.users.updateRole);
  const updateCustomPermissions = useMutation(api.users.updateCustomPermissions);
  const deactivateUser = useMutation(api.users.deactivateUser);
  const reactivateUser = useMutation(api.users.reactivateUser);
  const syncOrgMember = useMutation(api.users.syncOrganizationMember);

  const togglePermissions = (userId: string) => {
    setExpandedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handlePermissionToggle = async (userId: string, currentPermissions: string[] | undefined, permission: string) => {
    const permissions = currentPermissions || [];
    const newPermissions = permissions.includes(permission)
      ? permissions.filter(p => p !== permission)
      : [...permissions, permission];
    
    try {
      await updateCustomPermissions({ targetUserId: userId as any, permissions: newPermissions });
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Sync Clerk organization members with Convex on mount
  useEffect(() => {
    if (orgId && hasPermission) {
      fetch(`/api/sync-clerk-users?orgId=${orgId}`)
        .then(res => res.json())
        .then(data => {
          console.log("Synced users:", data);
        })
        .catch(err => console.error("Failed to sync users:", err));
    }
  }, [orgId, hasPermission]);

  if (isPermissionLoading || users === undefined) {
    return <div className="p-8 text-center animate-pulse">Loading...</div>;
  }

  if (!hasPermission) {
    return (
      <div className={cn("p-8 max-w-2xl mx-auto text-center space-y-4", isRTL && "text-right")} dir={dir}>
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-[var(--color-text-secondary)]">You do not have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-5xl space-y-6", isRTL && "text-right")} dir={dir}>
      <div className={cn("surface-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <Shield className="h-7 w-7 text-[var(--color-brand-light)]" />
          <div className={cn(isRTL && "text-right")}>
            <p className="section-kicker w-fit">{language === "ar" ? "الإعدادات" : language === "fr" ? "Paramètres" : "Settings"}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {language === "ar" ? "إدارة المستخدمين والأدوار" : language === "fr" ? "Utilisateurs et Rôles" : "Users & Roles"}
            </h1>
          </div>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={cn(
              "px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-bg-hover)] transition-colors flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}
          >
            {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showInactive 
              ? (language === "ar" ? "إخفاء غير النشطين" : language === "fr" ? "Masquer inactifs" : "Hide Inactive") 
              : (language === "ar" ? "إظهار غير النشطين" : language === "fr" ? "Afficher inactifs" : "Show Inactive")}
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className={cn(
              "bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary)]/90 transition-colors flex items-center justify-center gap-2",
              isRTL && "flex-row-reverse"
            )}
          >
            <UserPlus className="w-5 h-5" />
            {language === "ar" ? "دعوة مستخدمين" : language === "fr" ? "Inviter des utilisateurs" : "Invite Users"}
          </button>
        </div>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-[var(--color-bg-base)] rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-[var(--color-bg-elevated)] rounded-full hover:bg-[var(--color-bg-hover)] transition-colors border border-[var(--color-border)]"
            >
              <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </button>
            <div className="p-2 sm:p-4 flex justify-center">
               <OrganizationProfile routing="hash" />
            </div>
          </div>
        </div>
      )}

      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] uppercase text-xs">
              <tr className={cn(isRTL && "text-right")}>
                <th className="px-6 py-4 font-medium">{language === "ar" ? "المستخدم" : language === "fr" ? "Utilisateur" : "User"}</th>
                <th className="px-6 py-4 font-medium">{language === "ar" ? "الدور" : language === "fr" ? "Rôle" : "Role"}</th>
                <th className="px-6 py-4 font-medium">{language === "ar" ? "الحالة" : language === "fr" ? "Statut" : "Status"}</th>
                <th className="px-6 py-4 font-medium">{language === "ar" ? "آخر دخول" : language === "fr" ? "Dernière connexion" : "Last Login"}</th>
                <th className="px-6 py-4 font-medium text-center">{language === "ar" ? "إجراءات" : language === "fr" ? "Actions" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {users.map((user) => {
                const isExpanded = expandedPermissions.has(user._id);
                const isCustom = user.role === "custom";

                return (
                  <Fragment key={user._id}>
                    <tr className={cn("hover:bg-[var(--color-bg-hover)] transition-colors", user.isActive === false && "opacity-50")}>
                      <td className="px-6 py-4 font-medium">
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <div>
                            <div className="font-semibold text-[var(--color-text-primary)]">{user.name || "N/A"}</div>
                            <div className="text-xs text-[var(--color-text-secondary)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                            value={user.role}
                            onChange={(e) => {
                              const newRole = e.target.value as any;
                              updateRole({ targetUserId: user._id, newRole }).catch(err => alert(err.message));
                            }}
                          >
                            <option value="admin">Admin</option>
                            <option value="accountant">Accountant</option>
                            <option value="sales_manager">Sales Manager</option>
                            <option value="inventory_manager">Inventory Manager</option>
                            <option value="custom">Custom</option>
                            <option value="OWNER">Owner (Legacy)</option>
                            <option value="STAFF">Staff (Legacy)</option>
                          </select>
                          {isCustom && (
                            <button
                              onClick={() => togglePermissions(user._id)}
                              className="p-1.5 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] transition-colors"
                              title="Edit Custom Permissions"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          user.isActive !== false 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {user.isActive !== false 
                            ? (language === "ar" ? "نشط" : language === "fr" ? "Actif" : "Active") 
                            : (language === "ar" ? "غير نشط" : language === "fr" ? "Inactif" : "Inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--color-text-secondary)]">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {user.isActive !== false ? (
                            <button
                              onClick={() => deactivateUser({ targetUserId: user._id }).catch(err => alert(err.message))}
                              className="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors"
                              title="Deactivate User"
                            >
                              <UserX className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivateUser({ targetUserId: user._id }).catch(err => alert(err.message))}
                              className="text-green-500 hover:text-green-400 p-2 rounded hover:bg-green-500/10 transition-colors"
                              title="Reactivate User"
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && isCustom && (
                      <tr className="bg-[var(--color-bg-base)]">
                        <td colSpan={5} className="px-6 py-4 border-t border-dashed border-[var(--color-border)]">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                              <Lock className="w-4 h-4 text-[var(--color-brand-light)]" />
                              {language === "ar" ? "صلاحيات مخصصة" : language === "fr" ? "Permissions personnalisées" : "Custom Permissions"}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {ALL_PERMISSIONS.map((permission) => (
                                <label
                                  key={permission}
                                  className="flex items-center gap-2 p-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                    checked={user.customPermissions?.includes(permission)}
                                    onChange={() => handlePermissionToggle(user._id, user.customPermissions, permission)}
                                  />
                                  <span className="text-xs font-medium truncate" title={permission}>
                                    {permission}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                    {language === "ar" ? "لا يوجد مستخدمين" : language === "fr" ? "Aucun utilisateur" : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
