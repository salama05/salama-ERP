"use client";

import { FlaskConical, Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";

interface DemoExplorerBannerProps {
  featureName?: {
    ar: string;
    fr: string;
    en: string;
  };
}

/**
 * Sub-banner displayed at the top of settings/read-only pages when in demo mode.
 * Informs the user that the features are in exploration mode (read-only).
 * Fully responsive on mobile viewports with zero overflow.
 */
export function DemoExplorerBanner({ featureName }: DemoExplorerBannerProps) {
  const isDemoMode = useIsDemoMode();
  const { language, dir } = useI18n();

  if (!isDemoMode) return null;

  const title =
    language === "ar"
      ? "وضع الاستكشاف التجريبي (عرض فقط)"
      : language === "fr"
      ? "Mode d'exploration Démo (Lecture seule)"
      : "Demo Exploration Mode (Read-only)";

  const description =
    language === "ar"
      ? `أنت تتصفح ${featureName?.ar || "هذه الميزة"} في وضع الديمو للاستكشاف فقط. جميع البيانات معروضة للتجربة، والتعديلات مُعطّلة.`
      : language === "fr"
      ? `Vous explorez ${featureName?.fr || "cette fonctionnalité"} en mode démo. Les modifications sont désactivées.`
      : `You are exploring ${featureName?.en || "this feature"} in demo mode. Changes and modifications are disabled.`;

  return (
    <div
      dir={dir}
      className="surface-panel mb-6 flex w-full max-w-full overflow-hidden items-start sm:items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 shadow-sm animate-fade-up"
    >
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
        <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <h4 className="text-xs sm:text-sm font-bold leading-none">{title}</h4>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <Eye className="h-3 w-3" />
            {language === "ar" ? "معاينة" : language === "fr" ? "Aperçu" : "Preview"}
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
