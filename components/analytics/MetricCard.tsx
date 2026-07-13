"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useI18n, formatCurrency, formatNumber } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
  format?: "currency" | "number" | "text";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  format = "currency",
}: MetricCardProps) {
  const { dir, language } = useI18n();
  const isRTL = dir === "rtl";

  let formattedValue = value;

  if (typeof value === "number" && format === "currency") {
    formattedValue = formatCurrency(value, language);
  } else if (typeof value === "number" && format === "number") {
    formattedValue = formatNumber(value, language, { minimumFractionDigits: 0 });
  }

  return (
    <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow", isRTL && "text-right")}>
      <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse") }>
        <div className="flex-1">
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-[var(--color-text-primary)]">
            {formattedValue}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: "var(--color-brand-dim)" }}>
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue !== undefined && (
        <div className={cn("flex items-center gap-1 mt-4 pt-4", isRTL && "flex-row-reverse")} style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4" style={{ color: "var(--color-success)" }} />
          ) : (
            <TrendingDown className="h-4 w-4" style={{ color: "var(--color-danger)" }} />
          )}
          <span
            className="text-sm font-medium"
            style={{ color: trend === "up" ? "var(--color-success)" : "var(--color-danger)" }}
          >
            {trend === "up" ? "+" : "-"}
            {formatNumber(Math.abs(trendValue), language, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {language === "ar" ? "مقارنة بالفترة السابقة" : language === "en" ? "vs previous period" : "vs période précédente"}
          </span>
        </div>
      )}
    </div>
  );
}
