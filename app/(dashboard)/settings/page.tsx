"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MerchantSettingsForm } from "@/components/dashboard/MerchantSettingsForm";

export default function SettingsPage() {
  const { t, dir, language, setLanguage } = useI18n();
  const isRTL = dir === "rtl";

  return (
    <div className={cn("mx-auto max-w-5xl space-y-6", isRTL && "text-right")} dir={dir}>
      <div className="surface-panel p-6">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <SettingsIcon className="h-7 w-7 text-[var(--color-brand-light)]" />
          <div>
            <p className="section-kicker w-fit">{t("settings")}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{language === "ar" ? "إعدادات المتجر" : language === "fr" ? "Paramètres du magasin" : "Store settings"}</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="surface-panel p-6">
          <div className={cn("flex items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
            <div>
              <h3 className="text-lg font-semibold">{t("settings")} ({language === "ar" ? "اللغة" : language === "fr" ? "Langue" : "Language"})</h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{language === "ar" ? "بدّل لغة الواجهة بدون فقدان السياق." : language === "fr" ? "Changez la langue de l'interface sans perdre votre place." : "Switch the UI language without losing your place."}</p>
            </div>
            <div className={cn("flex flex-wrap gap-2", isRTL && "justify-start")}>
              {([
                ["ar", "العربية"],
                ["fr", "Français"],
                ["en", "English"],
              ] as const).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    language === code
                      ? "border-transparent bg-[var(--color-primary)] text-white shadow-lg shadow-[rgba(99,102,241,0.18)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Merchant Settings Form with dynamic validations and RTL support */}
        <MerchantSettingsForm />


        <section className="surface-panel p-6">
          <h3 className="text-lg font-semibold">{t("security")}</h3>
          <div className={cn("mt-5 flex items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
            <div>
              <p className="font-medium">{t("emailNotifications")}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{t("emailNotificationsDesc")}</p>
            </div>
            <div className="h-6 w-11 rounded-full bg-[var(--color-bg-hover)] relative cursor-not-allowed border border-[var(--color-border)]">
              <div className={cn("absolute top-1 h-4 w-4 rounded-full bg-[var(--color-bg-elevated)] shadow-sm", isRTL ? "right-1" : "left-1")} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
