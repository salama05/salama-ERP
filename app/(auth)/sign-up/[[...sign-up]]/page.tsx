"use client";

import { SignUp } from "@clerk/nextjs";
import { useI18n } from "@/lib/i18n";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";
import { useEffect } from "react";

export default function SignUpPage() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const isDemoMode = useIsDemoMode();

  // Redirect demo users away from sign-up page
  useEffect(() => {
    if (isDemoMode) {
      window.location.href = "/overview";
    }
  }, [isDemoMode]);

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
        <p className="section-kicker mx-auto w-fit lg:mx-0">{t("signUpKicker")}</p>
        <h1 className="text-3xl font-bold tracking-tight">{t("signUpTitle")}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{t("signUpDesc")}</p>
      </div>
      <SignUp />
    </div>
  );
}
