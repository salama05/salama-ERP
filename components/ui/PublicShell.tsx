"use client";

import React, { useEffect, useState } from "react";
import { LanguageProvider, useI18n } from "@/lib/i18n";
import { PublicLanguageSwitcher } from "@/components/ui/PublicLanguageSwitcher";
import Link from "next/link";

function PublicShellInner({ children }: { children: React.ReactNode }) {
  const { language, dir } = useI18n();
  const isRTL = dir === "rtl";
  const [mounted, setMounted] = useState(false);

  // Sync html element direction and lang
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div dir={dir} lang={language} className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
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

      {/* Page content pushed below fixed header */}
      <div className="pt-[var(--navbar-height,64px)]">{children}</div>
    </div>
  );
}

/**
 * Wraps public pages (marketing home, sign-in, sign-up) with LanguageProvider
 * and a minimal header that includes the language switcher.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PublicShellInner>{children}</PublicShellInner>
    </LanguageProvider>
  );
}
