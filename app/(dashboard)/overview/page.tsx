"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useI18n, formatCurrency, formatNumber } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import {
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Calendar,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";

  // Notifications panel toggle
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Real stats from the dedicated dashboard query ─────────────────────────
  const dashboardStats = useQuery(api.dashboard.getStats);
  const totalRevenue  = dashboardStats?.totalRevenue  ?? 0;
  const totalProducts = dashboardStats?.totalProducts ?? 0;
  const todaySales    = dashboardStats?.todaySales    ?? 0;
  const lowStockCount = dashboardStats?.lowStockAlerts ?? 0;

  // ── Notifications ─────────────────────────────────────────────────────────
  const notifications = useQuery(api.notifications.getUnreadRoleNotifications, {
    role: undefined,
  }) ?? [];
  const unreadCount = notifications.length;

  // ─────────────────────────────────────────────────────────────────────────
  const stats = [
    {
      label: t("totalRevenue") || "Total Revenue",
      value: formatCurrency(totalRevenue, language),
      change: 0,
      icon: DollarSign,
    },
    {
      label: t("products") || "Total Products",
      value: formatNumber(totalProducts, language),
      change: 0,
      icon: Package,
    },
    {
      label: t("todaySales") || "Today's Sales",
      value: formatCurrency(todaySales, language),
      change: 0,
      icon: TrendingUp,
    },
    {
      label: t("lowStockAlerts") || "Low Stock Alerts",
      value: formatNumber(lowStockCount, language),
      change: 0,
      icon: AlertTriangle,
    },
  ];

  const getDateDisplay = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat(getLocale(language), options).format(today);
  };

  return (
    <div className="space-y-8">

      {/* ─── Date & Live Operations Bar ──────────────────────────────────── */}
      <div
        className={cn(
          "surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm",
          isRTL && "sm:flex-row-reverse"
        )}
      >
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 font-bold">
              {t("today")}
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{getDateDisplay()}</p>
          </div>
        </div>

        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{t("liveOperationsBoard")}</span>
          </div>
        </div>
      </div>

      {/* ─── Section heading ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="section-kicker w-fit">{t("overview") || "Dashboard"}</p>
        <div className={cn("flex flex-col gap-2", isRTL && "items-end")}>
          <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
            {t("overviewPageTitle")}
          </h1>
          <p className="max-w-2xl text-sm text-[var(--color-text-secondary)] md:text-base">
            {t("overviewPageDesc")}
          </p>
        </div>
      </div>

      {/* ─── Stats grid ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
          const hasChange = stat.change !== 0;

          return (
            <div
              key={index}
              className="surface-panel group p-5 transition duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-base)] ring-1 ring-[var(--color-border-subtle)]">
                  <Icon className="h-6 w-6 text-[var(--color-brand-light)]" />
                </div>
                {hasChange && (
                  <div
                    className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", isRTL && "flex-row-reverse")}
                    style={{
                      backgroundColor: isPositive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      color: isPositive ? "var(--color-success)" : "var(--color-danger)",
                    }}
                  >
                    <ChangeIcon className="h-4 w-4" strokeWidth={2.3} />
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ─── Placeholder cards ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{t("recentSales")}</h3>
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-base)]/70 py-10 text-center text-sm text-[var(--color-text-muted)]">
            {t("noSalesDataAvailableYet")}
          </div>
        </div>
        <div className="surface-panel p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{t("topProducts")}</h3>
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-base)]/70 py-10 text-center text-sm text-[var(--color-text-muted)]">
            {t("noDataAvailableYet")}
          </div>
        </div>
      </div>
    </div>
  );
}
