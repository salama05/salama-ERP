"use client";

import React, { useEffect, useState } from "react";
import { LanguageProvider, useI18n } from "@/lib/i18n";
import { PublicLanguageSwitcher } from "@/components/ui/PublicLanguageSwitcher";
import Link from "next/link";

function AuthShellInner({ children }: { children: React.ReactNode }) {
  const { t, language, dir } = useI18n();
  const isRTL = dir === "rtl";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const featureCards = [
    {
      title: t("authFeatureRetailTitle"),
      copy: t("authFeatureRetailDesc"),
    },
    {
      title: t("authFeatureRtlTitle"),
      copy: t("authFeatureRtlDesc"),
    },
    {
      title: t("authFeatureMtTitle"),
      copy: t("authFeatureMtDesc"),
    },
    {
      title: t("authFeatureZeroTitle"),
      copy: t("authFeatureZeroDesc"),
    },
  ];

  return (
    <div
      dir={dir}
      lang={language}
      className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]"
    >
      {/* Minimal public navbar */}
      <header
        className="fixed inset-x-0 top-0 z-30 flex h-[var(--navbar-height,64px)] items-center justify-between border-b border-[var(--glass-border)] px-4 sm:px-6 glass"
        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--color-brand-light),var(--color-brand))] text-xs font-bold text-white">
            S
          </div>
          <span className="font-bold tracking-tight hidden sm:inline">Salama ERP</span>
        </Link>
        <PublicLanguageSwitcher />
      </header>

      {/* Content */}
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-base)] px-4 pb-8 pt-[calc(var(--navbar-height,64px)+2rem)] text-[var(--color-text-primary)]">
        <div className="hero-orb left-[-10rem] top-[-6rem]" />
        <div className="hero-orb right-[-8rem] bottom-[-8rem]" />

        <div
          className="grid w-full max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {/* Left branding panel */}
          <section className="surface-panel relative hidden overflow-hidden p-8 lg:block">
            <div className="absolute inset-0 soft-grid opacity-30" />
            <div className="relative space-y-6">
              <div className="section-kicker w-fit">Salama ERP</div>
              <div className="space-y-4">
                <h1 className="max-w-sm text-4xl font-bold tracking-tight">
                  {isRTL
                    ? "مساحة عمل هادئة وفعّالة للتجار."
                    : language === "fr"
                    ? "Un espace de travail calme et efficace pour les commerçants."
                    : "A calm, efficient workspace for merchants."}
                </h1>
                <p className="max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
                  {isRTL
                    ? "سجّل دخولك مرة واحدة وانتقل بين المنتجات والفواتير والزبائن والمالية بإيقاع تشغيلي واحد."
                    : language === "fr"
                    ? "Connectez-vous une fois et naviguez entre les produits, factures, clients et finance avec un rythme opérationnel unique."
                    : "Sign in once and move across products, invoices, customers, and finance with a single operating rhythm."}
                </p>
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                {featureCards.map(({ title, copy }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4"
                  >
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right form panel */}
          <section className="surface-panel flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md">{children}</div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthShellInner>{children}</AuthShellInner>
    </LanguageProvider>
  );
}
