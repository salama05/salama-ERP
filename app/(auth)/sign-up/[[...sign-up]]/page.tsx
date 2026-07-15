"use client";

import { SignUp } from "@clerk/nextjs";
import { useI18n } from "@/lib/i18n";

export default function SignUpPage() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

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
