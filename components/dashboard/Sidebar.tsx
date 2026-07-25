"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
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
  onItemClick?: () => void;
}

/**
 * Clean reusable Navigation Content list for Desktop and Mobile Drawer.
 */
export function SidebarContent({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { language } = useI18n();

  const EXACT_MATCH_HREFS = ["/overview", "/settings", "/settings/users", "/settings/audit-log"];

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 p-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md flex-shrink-0">
          S
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">Salama ERP</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Retail & wholesale</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label.fr} className="space-y-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
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
                    onClick={onItemClick}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info Box */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-800">
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {language === "ar" ? "بيئة العمل" : language === "fr" ? "Espace de travail" : "Workspace"}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-snug">
            {language === "ar" ? "نظام مستقل، نظيف، وسريع الصيانة." : "Solo-friendly, clean & fast to maintain."}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile Off-Canvas Drawer (lg:hidden)
 */
export function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { dir } = useI18n();
  const isRTL = dir === "rtl";

  return (
    <div className="lg:hidden fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside
        className={cn(
          "fixed inset-y-0 z-[10000] w-72 max-w-[85vw] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col transition-transform duration-300 border-l dark:border-slate-800 animate-in slide-in-from-right",
          isRTL ? "right-0 border-r-0 border-l" : "left-0 border-l-0 border-r"
        )}
        dir={dir}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800">
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">القائمة الرئيسية</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
            aria-label="إغلاق القائمة"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarContent onItemClick={onClose} />
        </div>
      </aside>
    </div>
  );
}

export default SidebarContent;
