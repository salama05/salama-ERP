"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsProps {
  items: TopProduct[];
  isLoading?: boolean;
}

export function TopProducts({ items, isLoading }: TopProductsProps) {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";

  if (isLoading) {
    return (
      <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
        <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse") }>
          <TrendingUp className="h-5 w-5 text-green-600" />
          {t("topSellingProducts")}
        </h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[var(--color-bg-hover)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
        <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse") }>
          <TrendingUp className="h-5 w-5 text-green-600" />
          {t("topSellingProducts")}
        </h3>
        <p className="text-[var(--color-text-muted)] text-center py-8">
          {t("noSalesDataAvailable")}
        </p>
      </div>
    );
  }

  const maxRevenue = Math.max(...items.map((p) => p.revenue));

  return (
    <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
      <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse") }>
        <TrendingUp className="h-5 w-5 text-green-600" />
        {t("topSellingProducts")}
      </h3>
      <div className="space-y-4">
        {items.map((product, idx) => {
          const barWidth = (product.revenue / maxRevenue) * 100;
          return (
            <div key={product.id}>
              <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse") }>
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{product.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {product.quantity} {t("units")} • {formatCurrency(product.revenue, language)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-[var(--color-bg-hover)] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
