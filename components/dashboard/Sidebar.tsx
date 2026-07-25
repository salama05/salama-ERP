"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  TrendingUp, 
  Zap, 
  Package, 
  UserCheck, 
  Truck, 
  Users, 
  BarChart3, 
  FileText, 
  Wallet, 
  Settings, 
  Shield, 
  Activity, 
  X 
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: { fr: "Principal", ar: "الرئيسي", en: "Core" },
    items: [
      { key: "overview", href: "/overview", icon: LayoutDashboard, labelFr: "Vue d'ensemble", labelAr: "نظرة عامة", labelEn: "Overview" },
      { key: "analytics", href: "/analytics", icon: TrendingUp, labelFr: "Analytique", labelAr: "التحليلات", labelEn: "Analytics" },
      { key: "pos", href: "/pos", icon: Zap, labelFr: "Caisse (POS)", labelAr: "نقطة البيع", labelEn: "POS" },
    ],
  },
  {
    label: { fr: "Commerce", ar: "التجارة", en: "Commerce" },
    items: [
      { key: "products", href: "/products", icon: Package, labelFr: "Produits", labelAr: "المنتجات", labelEn: "Products" },
      { key: "suppliers", href: "/suppliers", icon: UserCheck, labelFr: "Fournisseurs", labelAr: "الموردون", labelEn: "Suppliers" },
      { key: "purchases", href: "/purchases", icon: Truck, labelFr: "Achats", labelAr: "المشتريات", labelEn: "Purchases" },
      { key: "customers", href: "/customers", icon: Users, labelFr: "Clients", labelAr: "الزبائن", labelEn: "Customers" },
      { key: "sales", href: "/sales", icon: BarChart3, labelFr: "Ventes", labelAr: "المبيعات", labelEn: "Sales" },
      { key: "invoices", href: "/invoices", icon: FileText, labelFr: "Factures", labelAr: "الفواتير", labelEn: "Invoices" },
    ],
  },
  {
    label: { fr: "Gestion", ar: "الإدارة", en: "Management" },
    items: [
      { key: "finance", href: "/finance", icon: Wallet, labelFr: "Finance", labelAr: "المالية", labelEn: "Finance" },
      { key: "settings", href: "/settings", icon: Settings, labelFr: "Paramètres", labelAr: "الإعدادات", labelEn: "Settings" },
      { key: "users", href: "/settings/users", icon: Shield, labelFr: "Utilisateurs et Rôles", labelAr: "المستخدمون والأدوار", labelEn: "Users & Roles" },
      { key: "audit-log", href: "/settings/audit-log", icon: Activity, labelFr: "Journal d'audit", labelAr: "سجل التدقيق", labelEn: "Audit Log" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ collapsed, toggleSidebar, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { language, dir } = useI18n();
  const isRTL = dir === "rtl";

  const EXACT_MATCH_HREFS = ["/overview", "/settings", "/settings/users", "/settings/audit-log"];

  return (
    <>
      {/* ── 1. Desktop Sidebar (hidden on mobile md:flex) ────────────────────────── */}
      <aside
        className={cn(
          "sidebar fixed inset-y-0 z-30 hidden border-r bg-[var(--color-bg-elevated)]/95 backdrop-blur-xl md:flex flex-col transition-all duration-300",
          collapsed && "collapsed",
          isRTL ? "right-0 border-r-0 border-l" : "left-0"
        )}
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute top-20 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] shadow-md transition hover:scale-110 active:scale-95",
            isRTL ? "-left-3" : "-right-3"
          )}
        >
          {collapsed ? (
            isRTL ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            isRTL ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-brand-light),var(--color-brand))] text-sm font-bold text-white shadow-lg shadow-[rgba(99,102,241,0.18)] flex-shrink-0">
              S
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">Salama ERP</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">Retail & wholesale</p>
              </div>
            )}
          </div>

          <nav className="space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label.fr} className="space-y-2">
                {!collapsed && (
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    {language === "ar" ? section.label.ar : language === "en" ? section.label.en : section.label.fr}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (!EXACT_MATCH_HREFS.includes(item.href) && pathname.startsWith(item.href));
                    const label = language === "ar" ? item.labelAr : language === "en" ? item.labelEn : item.labelFr;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        title={collapsed ? label : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl px-3 py-2.75 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "text-white"
                            : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                        )}
                        style={
                          isActive
                            ? {
                                background: "linear-gradient(135deg, var(--color-brand-light), var(--color-brand))",
                                boxShadow: "var(--shadow-glow)",
                              }
                            : undefined
                        }
                      >
                        {isActive && <span className="nav-indicator" />}
                        <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {!collapsed && (
            <div className="mt-auto rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                {language === "ar" ? "بيئة العمل" : language === "fr" ? "Espace de travail" : "Workspace"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {language === "ar" ? "نظام مستقل، نظيف، وسريع الصيانة." : language === "fr" ? "Adapté au solo, propre et rapide à maintenir." : "Solo-friendly, clean, and fast to maintain."}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ── 2. Mobile Off-Canvas Drawer (md:hidden) ─────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[90]">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Off-canvas Drawer Content */}
          <aside
            className={cn(
              "fixed inset-y-0 z-[100] w-72 max-w-[85vw] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-2xl p-4 flex flex-col transition-all duration-300 border-l dark:border-slate-800 animate-in slide-in-from-right",
              isRTL ? "right-0 border-r-0 border-l" : "left-0 border-l-0 border-r"
            )}
            dir={dir}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-brand-light),var(--color-brand))] text-sm font-bold text-white shadow-md">
                  S
                </div>
                <span className="font-bold text-base text-[var(--color-text-primary)]">Salama ERP</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                aria-label="إغلاق القائمة"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav List */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label.fr} className="space-y-2">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    {language === "ar" ? section.label.ar : language === "en" ? section.label.en : section.label.fr}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (!EXACT_MATCH_HREFS.includes(item.href) && pathname.startsWith(item.href));
                      const label = language === "ar" ? item.labelAr : language === "en" ? item.labelEn : item.labelFr;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "text-white"
                              : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                          )}
                          style={
                            isActive
                              ? {
                                  background: "linear-gradient(135deg, var(--color-brand-light), var(--color-brand))",
                                  boxShadow: "var(--shadow-glow)",
                                }
                              : undefined
                          }
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                          <span className="truncate">{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
