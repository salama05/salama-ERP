"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
  { code: "fr" as const, label: "FR" },
  { code: "en" as const, label: "EN" },
  { code: "ar" as const, label: "AR" },
];

/**
 * Language switcher widget shared by public pages (marketing, sign-in, sign-up).
 * Must be rendered inside a <LanguageProvider>.
 */
export function PublicLanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1">
      {LANGUAGE_OPTIONS.map((option) => {
        const active = language === option.code;
        return (
          <button
            key={option.code}
            onClick={() => setLanguage(option.code)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
