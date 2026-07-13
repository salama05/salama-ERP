"use client";

import { BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/taxCalculator";
import { cn } from "@/lib/utils";

export default function SalesPage() {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[60vh] text-center", isRTL && "text-right")} dir={dir}>
      <div className="bg-indigo-100 p-4 rounded-full mb-4">
        <BarChart3 className="h-12 w-12 text-indigo-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("salesManagement")}</h1>
      <p className="text-gray-500 max-w-md">
        {t("salesDesc")}
      </p>
      <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t("totalSales")}</p>
          <p className="text-2xl font-bold mt-1 text-indigo-600">
            {formatCurrency(0, language)}
          </p>
        </div>
        <div className="p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t("orders")}</p>
          <p className="text-2xl font-bold mt-1 text-indigo-600">0</p>
        </div>
        <div className="p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t("avgOrderValue")}</p>
          <p className="text-2xl font-bold mt-1 text-indigo-600">
            {formatCurrency(0, language)}
          </p>
        </div>
      </div>
    </div>
  );
}
