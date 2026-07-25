"use client";

import { BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/taxCalculator";
import { cn } from "@/lib/utils";

export default function SalesPage() {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";

  const stats = [
    {
      key: "totalSales",
      value: formatCurrency(0, language),
    },
    {
      key: "orders",
      value: "0",
    },
    {
      key: "avgOrderValue",
      value: formatCurrency(0, language),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] text-center",
        isRTL && "text-right"
      )}
      dir={dir}
    >
      {/* Icon */}
      <div
        className="p-4 rounded-full mb-4"
        style={{ backgroundColor: "var(--color-brand-dim)" }}
      >
        <BarChart3 className="h-12 w-12" style={{ color: "var(--color-brand)" }} />
      </div>

      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
        {t("salesManagement")}
      </h1>
      <p className="text-[var(--color-text-muted)] max-w-md text-sm leading-relaxed">
        {t("salesDesc")}
      </p>

      <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(({ key, value }) => (
          <div
            key={key}
            className="surface-panel p-6"
          >
            <p
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              {t(key as any)}
            </p>
            <p
              className="text-2xl font-bold mt-2"
              style={{ color: "var(--color-brand)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
