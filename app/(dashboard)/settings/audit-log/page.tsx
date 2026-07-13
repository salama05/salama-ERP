"use client";

import { useState } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePermission } from "@/hooks/usePermission";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/taxCalculator";
import { cn } from "@/lib/utils";
import { Activity, ShieldAlert, ChevronDown, ChevronUp, Filter, ExternalLink, User, Package, FileText, Settings, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AuditLogPage() {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";

  const { hasPermission: canManageUsers, isLoading: isManageLoading } = usePermission("users.manage");
  const { hasPermission: canViewReports, isLoading: isReportsLoading } = usePermission("reports.view");
  
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const hasAccess = canManageUsers || canViewReports;
  const isLoading = isManageLoading || isReportsLoading;

  const users = useQuery(api.users.listUsers, hasAccess ? { showInactive: true } : "skip");

  const { results: logs, status, loadMore } = usePaginatedQuery(
    api.audit.listAuditLogs,
    hasAccess
      ? {
          entityType: entityTypeFilter || undefined,
          action: actionFilter || undefined,
          userId: userFilter || undefined,
          startDate: startDate ? new Date(startDate).getTime() : undefined,
          endDate: endDate ? new Date(endDate).getTime() : undefined,
        }
      : "skip",
    { initialNumItems: 50 }
  );

  const getEntityIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === "invoice") return <FileText className="w-3.5 h-3.5" />;
    if (t === "product") return <Package className="w-3.5 h-3.5" />;
    if (t === "user") return <User className="w-3.5 h-3.5" />;
    return <Settings className="w-3.5 h-3.5" />;
  };

  const getEntityLink = (type: string, id: string) => {
    const t = type.toLowerCase();
    if (t === "invoice") return `/invoices/${id}`;
    if (t === "product") return `/products/${id}`;
    if (t === "customer") return `/customers/${id}`;
    if (t === "supplier") return `/suppliers/${id}`;
    if (t === "purchase") return `/purchases/${id}`;
    if (t === "user") return `/settings/users`;
    return null;
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">{t("loading")}...</div>;
  }

  if (!hasAccess) {
    return (
      <div className={cn("p-8 max-w-2xl mx-auto text-center space-y-4", isRTL && "text-right")} dir={dir}>
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">{t("accessDenied")}</h1>
        <p className="text-[var(--color-text-secondary)]">{t("accessDeniedDesc")}</p>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-5xl space-y-6", isRTL && "text-right")} dir={dir}>
      <div className="surface-panel p-6">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <Activity className="h-7 w-7 text-[var(--color-brand-light)]" />
          <div>
            <p className="section-kicker w-fit">{t("settings")}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{t("auditLog")}</h1>
          </div>
        </div>
      </div>

      <div className="surface-panel p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
        
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-w-[150px]"
        >
          <option value="">{t("allUsers")}</option>
          {users?.map((u) => (
            <option key={u.tokenIdentifier} value={u.tokenIdentifier}>
              {u.name || u.email}
            </option>
          ))}
        </select>

        <select
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-w-[150px]"
        >
          <option value="">{t("allEntities")}</option>
          <option value="invoice">{t("invoice")}</option>
          <option value="product">{t("product")}</option>
          <option value="inventory">{t("stock")}</option>
          <option value="user">{t("product") === "Product" ? "User" : language === "ar" ? "مستخدم" : "Utilisateur"}</option>
          <option value="purchase">{t("purchase")}</option>
          <option value="supplier">{t("supplier")}</option>
          <option value="customer">{t("customer")}</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-w-[150px]"
        >
          <option value="">{t("allActions")}</option>
          <option value="create">{language === "ar" ? "إنشاء" : language === "fr" ? "Création" : "Create"}</option>
          <option value="update">{language === "ar" ? "تحديث" : language === "fr" ? "Mise à jour" : "Update"}</option>
          <option value="delete">{language === "ar" ? "حذف" : language === "fr" ? "Suppression" : "Delete"}</option>
          <option value="void">{language === "ar" ? "إلغاء" : language === "fr" ? "Annulation" : "Void"}</option>
          <option value="price_change">{language === "ar" ? "تغيير سعر" : language === "fr" ? "Changement prix" : "Price Change"}</option>
          <option value="stock_adjustment">{language === "ar" ? "تعديل مخزون" : language === "fr" ? "Ajustement stock" : "Stock Adjustment"}</option>
          <option value="login">{language === "ar" ? "تسجيل دخول" : language === "fr" ? "Connexion" : "Login"}</option>
          <option value="role_change">{language === "ar" ? "تغيير دور" : language === "fr" ? "Changement rôle" : "Role Change"}</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm outline-none"
          />
          <span className="text-[var(--color-text-secondary)]">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm outline-none"
          />
        </div>
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] uppercase text-xs">
              <tr className={cn(isRTL && "text-right")}>
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">{t("date")}</th>
                <th className="px-6 py-4 font-medium">{language === "ar" ? "المستخدم" : language === "fr" ? "Utilisateur" : "User"}</th>
                <th className="px-6 py-4 font-medium">{language === "ar" ? "الإجراء" : language === "fr" ? "Action" : "Action"}</th>
                <th className="px-6 py-4 font-medium">{language === "ar" ? "الكيان" : language === "fr" ? "Entité" : "Entity"}</th>
                <th className="px-6 py-4 font-medium">{t("details")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {logs?.map((log) => {
                const isExpanded = expandedRows.has(log._id);
                const entityLink = getEntityLink(log.entityType, log.entityId);
                
                return (
                  <Fragment key={log._id}>
                    <tr className="hover:bg-[var(--color-bg-hover)] transition-colors group">
                      <td className="px-2 py-4 text-center">
                        <button
                          onClick={() => toggleRow(log._id)}
                          className="p-1 rounded hover:bg-[var(--color-bg-elevated)] transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-secondary)]">
                        {new Date(log.timestamp).toLocaleString(getLocaleForLanguage(language))}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {log.userName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                          log.action === "delete" || log.action === "void" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          log.action === "create" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                          "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        )}>
                          {log.action.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
                            {getEntityIcon(log.entityType)}
                          </span>
                          <div>
                            <div className="font-medium flex items-center gap-1.5 capitalize">
                              {log.entityType}
                              {entityLink && (
                                <Link href={entityLink} className="text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors">
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)]">{log.entityLabel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.changes && log.changes.length > 0 ? (
                          <button 
                            onClick={() => toggleRow(log._id)}
                            className="text-xs text-[var(--color-brand-light)] hover:underline font-medium"
                          >
                            {log.changes.length} {t("changes")}
                          </button>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">-</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[var(--color-bg-base)]">
                        <td colSpan={6} className="px-10 py-6 border-x-4 border-l-[var(--color-brand-light)]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                <RefreshCw className="w-3 h-3" />
                                {t("changes")}
                              </h4>
                              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">ID: {log.entityId}</span>
                            </div>
                            
                            {log.changes && log.changes.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.changes.map((change, idx) => (
                                  <div key={idx} className="surface-panel p-3 border border-[var(--color-border)] rounded-lg space-y-2">
                                    <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">{change.field}</div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{t("oldValue")}</div>
                                        <div className="text-xs truncate font-medium text-red-500/80 line-through decoration-red-500/30">
                                          {change.oldValue === null || change.oldValue === undefined ? "-" : String(change.oldValue)}
                                        </div>
                                      </div>
                                      <div className="text-[var(--color-text-muted)]">→</div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{t("newValue")}</div>
                                        <div className="text-xs truncate font-bold text-green-500">
                                          {change.newValue === null || change.newValue === undefined ? "-" : String(change.newValue)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-[var(--color-text-muted)] italic py-2">
                                No granular data recorded for this action.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {(!logs || logs.length === 0) && status !== "LoadingFirstPage" && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-[var(--color-bg-elevated)]">
                        <Activity className="w-6 h-6 text-[var(--color-text-muted)]" />
                      </div>
                      <p className="text-[var(--color-text-secondary)] font-medium">{t("noLogs")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {status === "CanLoadMore" && (
          <div className="p-4 border-t border-[var(--color-border)] text-center">
            <button
              onClick={() => loadMore(50)}
              className="px-6 py-2 text-sm font-bold text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t("loadMore")}
            </button>
          </div>
        )}

        {status === "LoadingMore" && (
          <div className="p-4 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-secondary)] animate-pulse">
            {t("loading")}...
          </div>
        )}
      </div>
    </div>
  );
}
