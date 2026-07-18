"use client";

import { SignIn } from "@clerk/nextjs";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for demo session cookie
    const demoCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('demo_session='));
    const isDemo = demoCookie?.split('=')[1] === 'active';
    setIsDemoMode(isDemo);
    
    if (isDemo) {
      window.location.href = "/overview";
    }
  }, []);

  if (isDemoMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={dir}>
      <div
        className="space-y-2 text-center lg:text-left"
        style={{ textAlign: isRTL ? "right" : undefined }}
      >
        <p className="section-kicker mx-auto w-fit lg:mx-0">{t("signInKicker")}</p>
        <h1 className="text-3xl font-bold tracking-tight">{t("signInTitle")}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{t("signInDesc")}</p>
      </div>
      <SignIn />
    </div>
  );
}
