"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Wallet,
  FileText,
  Zap,
  Shield,
  Activity,
  X
} from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { LanguageProvider, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { Header } from "@/components/dashboard/Header";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";
import { useDemoSession } from "@/hooks/useDemoSession";
import { useAuthSafe } from "@/hooks/useAuthSafe";
import { OrganizationSwitcherSafe, UserButtonSafe } from "@/components/auth/ClerkComponents";

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

const THEME_KEY = "saas_walaa_theme";
const SIDEBAR_KEY = "saas_walaa_sidebar_collapsed";

function getSaved<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return (window.localStorage.getItem(key) as T) ?? fallback;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DashboardShell>{children}</DashboardShell>
    </LanguageProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage, dir } = useI18n();
  const isDemoMode = useIsDemoMode();
  const { exitDemo } = useDemoSession();
  const isRTL = dir === "rtl";

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = useQuery(api.users.getCurrentUser);
  const userRole = user?.role === "admin" || user?.role === "accountant" || user?.role === "sales_manager" || user?.role === "inventory_manager" ? user?.role : undefined;
  const notifications = useQuery(api.notifications.getUnreadRoleNotifications, userRole ? { role: userRole } : "skip");
  const unreadCount = notifications?.length || 0;

  useEffect(() => {
    setTheme(getSaved(THEME_KEY, "dark"));
    setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [dir, language]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  const languageOptions = [
    { code: "fr" as const, label: "FR" },
    { code: "en" as const, label: "EN" },
    { code: "ar" as const, label: "AR" },
  ];

  if (!mounted) return null;

  return (
    <div
      dir={dir}
      lang={language}
      className="relative min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]"
    >
      <aside
        className={cn(
          "sidebar fixed inset-y-0 z-30 hidden border-r bg-[var(--color-bg-elevated)]/95 backdrop-blur-xl md:flex",
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
          {collapsed ? (isRTL ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : (isRTL ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />)}
        </button>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-brand-light),var(--color-brand))] text-sm font-bold text-white shadow-lg shadow-[rgba(99,102,241,0.18)]">
              S
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold">Salama ERP</p>
                <p className="text-xs text-[var(--color-text-muted)]">Retail & wholesale</p>
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
                    // Exact-match routes (have children that would otherwise cause false-positive).
                    // For /overview we already special-case; for /settings sub-routes we need exact match
                    // so that /settings doesn't stay active when /settings/users is open.
                    const EXACT_MATCH_HREFS = ["/overview", "/settings", "/settings/users", "/settings/audit-log"];
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
                          isActive ? "text-white" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                        )}
                        style={isActive ? { background: "linear-gradient(135deg, var(--color-brand-light), var(--color-brand))", boxShadow: "var(--shadow-glow)" } : undefined}
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

      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300",
          collapsed ? "md:ms-[var(--sidebar-collapsed-width)]" : "md:ms-[var(--sidebar-width)]"
        )}
      >
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />

        {/* Demo mode alert banner */}
        <DemoBanner />

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
