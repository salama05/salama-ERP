"use client";

import { useState, useEffect, Fragment } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePermission } from "@/hooks/usePermission";
import { useAuthSafe } from "@/hooks/useAuthSafe";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, UserCheck, UserX, UserPlus, Eye, EyeOff, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";
import { DemoExplorerBanner } from "@/components/demo/DemoExplorerBanner";
import { AddUserModal } from "@/components/users/AddUserModal";

const MOCK_DEMO_USERS = [
  {
    _id: "demo-user-1" as any,
    name: "المدير العام (Owner)",
    email: "owner@salamaerp.com",
    role: "OWNER",
    isActive: true,
    lastLoginAt: Date.now() - 1000 * 60 * 30,
    customPermissions: [],
  },
  {
    _id: "demo-user-2" as any,
    name: "محاسب الشركة (Accountant)",
    email: "accountant@salamaerp.com",
    role: "accountant",
    isActive: true,
    lastLoginAt: Date.now() - 1000 * 60 * 60 * 24,
    customPermissions: [],
  },
  {
    _id: "demo-user-3" as any,
    name: "مدير المبيعات (Sales Manager)",
    email: "sales@salamaerp.com",
    role: "sales_manager",
    isActive: true,
    lastLoginAt: Date.now() - 1000 * 60 * 60 * 48,
    customPermissions: [],
  },
  {
    _id: "demo-user-4" as any,
    name: "مساعد المخزون (Staff)",
    email: "staff@salamaerp.com",
    role: "STAFF",
    isActive: true,
    lastLoginAt: Date.now() - 1000 * 60 * 60 * 5,
    customPermissions: [],
  },
];

export default function UsersSettingsPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [expandedPermissions, setExpandedPermissions] = useState<Set<string>>(new Set());
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";
  const { orgId } = useAuthSafe();
  const isDemoMode = useIsDemoMode();
  
  const { hasPermission, isLoading: isPermissionLoading } = usePermission("users.manage");
  const serverUsers = useQuery(api.users.listUsers, isDemoMode ? "skip" : { showInactive });
  
  const displayUsers = isDemoMode
    ? MOCK_DEMO_USERS
    : (serverUsers || []);

  const updateRole = useMutation(api.users.updateRole);
  const updateCustomPermissions = useMutation(api.users.updateCustomPermissions);
  const deactivateUser = useMutation(api.users.deactivateUser);
  const reactivateUser = useMutation(api.users.reactivateUser);

  const togglePermissions = (userId: string) => {
    setExpandedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handlePermissionToggle = async (userId: string, currentPermissions: string[] | undefined, permission: string) => {
    if (isDemoMode) return;
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
    if (orgId && hasPermission && !isDemoMode) {
      fetch(`/api/sync-clerk-users?orgId=${orgId}`)
        .then(res => res.json())
        .then(data => {
          console.log("Synced users:", data);
        })
        .catch(err => console.error("Failed to sync users:", err));
    }
  }, [orgId, hasPermission, isDemoMode]);

  if (!isDemoMode && (isPermissionLoading || serverUsers === undefined)) {
    return <div className="p-8 text-center animate-pulse text-slate-500 dark:text-slate-400 font-medium">{t("loading")}...</div>;
  }

  if (!isDemoMode && !hasPermission) {
    return (
      <div className={cn("p-8 max-w-2xl mx-auto text-center space-y-4", isRTL && "text-right")} dir={dir}>
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Access Denied</h1>
        <p className="text-slate-500 dark:text-slate-400">You do not have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-6xl space-y-6", isRTL && "text-right")} dir={dir}>
      {/* Demo Exploration Banner */}
      <DemoExplorerBanner
        featureName={{
          ar: "المستخدمين والأدوار",
          fr: "Utilisateurs et Rôles",
          en: "Users & Roles",
        }}
      />

      {/* Page Header */}
      <div className={cn(
        "p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200",
        "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm",
        isRTL && "flex-row-reverse"
      )}>
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Shield className="h-7 w-7" />
          </div>
          <div className={cn(isRTL && "text-right")}>
            <p className="text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              {language === "ar" ? "الإعدادات" : language === "fr" ? "Paramètres" : "Settings"}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {language === "ar" ? "إدارة المستخدمين والأدوار" : language === "fr" ? "Utilisateurs et Rôles" : "Users & Roles"}
            </h1>
          </div>
        </div>

        <div className={cn("flex items-center gap-2.5", isRTL && "flex-row-reverse")}>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={cn(
              "px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors flex items-center gap-2",
              "bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700",
              isRTL && "flex-row-reverse"
            )}
          >
            {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showInactive 
              ? (language === "ar" ? "إخفاء غير النشطين" : language === "fr" ? "Masquer inactifs" : "Hide Inactive") 
              : (language === "ar" ? "إظهار غير النشطين" : language === "fr" ? "Afficher inactifs" : "Show Inactive")}
          </button>
          {!isDemoMode && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className={cn(
                "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2",
                isRTL && "flex-row-reverse"
              )}
            >
              <UserPlus className="w-4 h-4" />
              {language === "ar" ? "دعوة مستخدمين" : language === "fr" ? "Inviter des utilisateurs" : "Invite Users"}
            </button>
          )}
        </div>
      </div>

      {/* Add / Invite User Modal */}
      <AddUserModal 
        isOpen={isInviteModalOpen && !isDemoMode}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Users Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs">
              <tr className={cn(isRTL && "text-right")}>
                <th className="px-6 py-4 font-bold">{language === "ar" ? "المستخدم" : language === "fr" ? "Utilisateur" : "User"}</th>
                <th className="px-6 py-4 font-bold">{language === "ar" ? "الدور" : language === "fr" ? "Rôle" : "Role"}</th>
                <th className="px-6 py-4 font-bold">{language === "ar" ? "الحالة" : language === "fr" ? "Statut" : "Status"}</th>
                <th className="px-6 py-4 font-bold">{language === "ar" ? "آخر دخول" : language === "fr" ? "Dernière connexion" : "Last Login"}</th>
                <th className="px-6 py-4 font-bold text-center">{language === "ar" ? "إجراءات" : language === "fr" ? "Actions" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-slate-900 dark:text-slate-100">
              {displayUsers.map((user) => {
                const isExpanded = expandedPermissions.has(user._id);
                const isCustom = user.role === "custom";

                return (
                  <Fragment key={user._id}>
                    <tr className={cn("hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition-colors", user.isActive === false && "opacity-60")}>
                      <td className="px-6 py-4 font-medium">
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                            {(user.name || user.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{user.name || "N/A"}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isDemoMode}
                            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                            value={user.role}
                            onChange={(e) => {
                              if (isDemoMode) return;
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
                              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                              title="Edit Custom Permissions"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5",
                          user.isActive !== false 
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", user.isActive !== false ? "bg-emerald-500" : "bg-rose-500")} />
                          {user.isActive !== false 
                            ? (language === "ar" ? "نشط" : language === "fr" ? "Actif" : "Active") 
                            : (language === "ar" ? "غير نشط" : language === "fr" ? "Inactif" : "Inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString(language, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : (language === "ar" ? "لم يدخل بعد" : "Never")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isDemoMode ? (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                            {language === "ar" ? "للعرض فقط" : "Read-only"}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              if (user.isActive !== false) {
                                deactivateUser({ targetUserId: user._id }).catch(err => alert(err.message));
                              } else {
                                reactivateUser({ targetUserId: user._id }).catch(err => alert(err.message));
                              }
                            }}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors text-xs font-semibold inline-flex items-center gap-1 px-2.5",
                              user.isActive !== false
                                ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            )}
                          >
                            {user.isActive !== false ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>{language === "ar" ? "تعطيل" : "Deactivate"}</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{language === "ar" ? "تنشيط" : "Reactivate"}</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Custom Permissions Sub-row */}
                    {isCustom && isExpanded && (
                      <tr className="bg-gray-50/50 dark:bg-slate-900/40">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {language === "ar" ? "الصلاحيات المخصصة:" : "Custom Permissions:"}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {ALL_PERMISSIONS.map((perm) => {
                                const isChecked = (user.customPermissions || []).includes(perm);
                                return (
                                  <label
                                    key={perm}
                                    className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-slate-700/70 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/60"
                                  >
                                    <input
                                      type="checkbox"
                                      disabled={isDemoMode}
                                      checked={isChecked}
                                      onChange={() => handlePermissionToggle(user._id, user.customPermissions, perm)}
                                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                    />
                                    <span className="truncate">{perm}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
