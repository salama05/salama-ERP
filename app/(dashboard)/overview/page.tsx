"use client";

import { useI18n, formatCurrency, formatNumber } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { DollarSign, Package, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Bell, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";

  // Sample data - in a real app, this would come from Convex
  const stats = [
    {
      label: t("totalRevenue") || "Total Revenue",
      value: formatCurrency(125430, language),
      change: 12.5,
      icon: DollarSign,
      color: "success",
      bgColor: "var(--color-success)",
    },
    {
      label: t("products") || "Total Products",
      value: formatNumber(1248, language),
      change: 8.2,
      icon: Package,
      color: "primary",
      bgColor: "var(--color-primary)",
    },
    {
      label: t("todaySales") || "Today's Sales",
      value: formatCurrency(8920, language),
      change: -2.4,
      icon: TrendingUp,
      color: "primary",
      bgColor: "var(--color-primary)",
    },
    {
      label: t("lowStockAlerts") || "Low Stock Alerts",
      value: formatNumber(23, language),
      change: 0,
      icon: AlertTriangle,
      color: "warning",
      bgColor: "var(--color-warning)",
    },
  ];

  const getDateDisplay = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat(getLocale(language), options).format(today);
  };

  return (
    <div className="space-y-8">
      <div className={cn("surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between", isRTL && "sm:flex-row-reverse")}>
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <Calendar className="h-5 w-5 text-[var(--color-brand-light)]" />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t("today")}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{getDateDisplay()}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2 text-sm text-[var(--color-text-secondary)] sm:flex">
            <Sparkles className="h-4 w-4 text-[var(--color-brand-light)]" />
            <span>{t("liveOperationsBoard")}</span>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] transition hover:bg-[var(--color-bg-hover)]" aria-label="Notifications">
            <Bell className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-danger)]"></span>
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-brand-light),var(--color-brand))] text-sm font-semibold text-white shadow-lg shadow-[rgba(99,102,241,0.2)]">
            U
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="section-kicker w-fit">{t("overview") || "Dashboard"}</p>
        <div className={cn("flex flex-col gap-2", isRTL && "items-end")}>
          <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">{t("overviewPageTitle")}</h1>
          <p className="max-w-2xl text-sm text-[var(--color-text-secondary)] md:text-base">{t("overviewPageDesc")}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <div
              key={index}
              className="surface-panel group p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-base)] ring-1 ring-[var(--color-border-subtle)]">
                  <Icon className="h-6 w-6 text-[var(--color-brand-light)]" />
                </div>
                <div className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", isRTL && "flex-row-reverse")} style={{ backgroundColor: isPositive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: isPositive ? "var(--color-success)" : "var(--color-danger)" }}>
                  <ChangeIcon
                    className="h-4 w-4"
                    strokeWidth={2.3}
                  />
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                {stat.value}
              </p>

              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                {isPositive ? t("upFromYesterday") : t("downFromYesterday")}
              </p>
            </div>
          );
        })}
      </div>

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
