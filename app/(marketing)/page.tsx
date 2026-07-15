"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, ShieldCheck, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/ui/PublicShell";
import { useI18n } from "@/lib/i18n";

function MarketingContent() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  const features = [
    {
      titleKey: "featureInventoryTitle" as const,
      descKey: "featureInventoryDesc" as const,
      icon: Boxes,
    },
    {
      titleKey: "featureRevenueTitle" as const,
      descKey: "featureRevenueDesc" as const,
      icon: BarChart3,
    },
    {
      titleKey: "featureTrustTitle" as const,
      descKey: "featureTrustDesc" as const,
      icon: ShieldCheck,
    },
  ];

  const previewStats = [
    { labelKey: "dashboardPreviewMonthlyRevenue" as const, value: "DZD 125,430" },
    { labelKey: "dashboardPreviewOrdersToday" as const, value: "84" },
    { labelKey: "dashboardPreviewLowStock" as const, value: "23" },
    { labelKey: "dashboardPreviewMargin" as const, value: "32.4%" },
  ];

  return (
    <main
      dir={dir}
      className="relative min-h-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]"
    >
      <div className="hero-orb -left-24 top-16" />
      <div className="hero-orb right-[-8rem] top-[28rem]" />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-12 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="section-kicker w-fit">
              <Sparkles className="h-4 w-4" />
              {t("heroKicker")}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight text-balance md:text-6xl lg:text-7xl">
                {t("heroTitle")}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] md:text-lg">
                {t("heroDesc")}
              </p>
            </div>

            <div
              className="flex flex-col gap-3 sm:flex-row"
              style={{ flexDirection: isRTL ? "row-reverse" : undefined }}
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(99,102,241,0.24)] transition hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5"
              >
                {t("heroCtaStart")}
                <ArrowRight className="h-4 w-4 rtl-flip" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-6 py-3.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-hover)]"
              >
                {t("heroCtaOpenDashboard")}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.titleKey} className="surface-panel p-4">
                    <Icon className="h-5 w-5 text-[var(--color-brand-light)]" />
                    <h2 className="mt-3 text-sm font-semibold">{t(item.titleKey)}</h2>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {t(item.descKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="soft-grid surface-panel relative overflow-hidden p-5 shadow-2xl shadow-black/20">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[rgba(99,102,241,0.14)] to-transparent" />
              <div
                className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4"
                style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    {t("dashboardPreviewKicker")}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{t("dashboardPreviewTitle")}</p>
                </div>
                <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                  {t("dashboardPreviewLive")}
                </div>
              </div>

              <div className="grid gap-4 py-5 sm:grid-cols-2">
                {previewStats.map(({ labelKey, value }) => (
                  <div
                    key={labelKey}
                    className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      {t(labelKey)}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-[var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(24,24,27,0.96))] p-5">
                <p className="text-sm font-semibold text-white">{t("dashboardPreviewRtlNote")}</p>
                <p className="mt-2 max-w-md text-sm text-white/75">
                  {t("dashboardPreviewRtlSub")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function MarketingPage() {
  return (
    <PublicShell>
      <MarketingContent />
    </PublicShell>
  );
}
