"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface StockAlertItem {
  id: string;
  name: string;
  stock: number;
  minLevel: number;
  price: number;
  sku?: string;
}

interface StockAlertListProps {
  items: StockAlertItem[];
  isLoading?: boolean;
}

export function StockAlertList({ items, isLoading }: StockAlertListProps) {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";

  if (isLoading) {
    return (
      <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
        <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse") }>
          <AlertCircle className="h-5 w-5" style={{ color: "var(--color-warning)" }} />
          {t("stockAlerts")}
        </h3>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
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
          <AlertCircle className="h-5 w-5 text-green-600" />
          {t("stockAlerts")}
        </h3>
        <p className="text-[var(--color-text-muted)] text-center py-8">
          {t("allProductsInStock")} 📦
        </p>
      </div>
    );
  }

  return (
    <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
      <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse") }>
        <AlertCircle className="h-5 w-5 text-red-600" />
        {t("lowStockAlerts")} ({items.length})
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn("p-3 rounded-lg", isRTL && "text-right")}
            style={{
              background: "var(--color-danger-dim)",
              border: "1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)",
            }}
          >
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse") }>
              <div className="flex-1">
                <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                {item.sku && (
                  <p className="text-xs text-[var(--color-text-secondary)]">SKU: {item.sku}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>
                      {item.stock} {t("units")}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {t("minStockLevel")}: {item.minLevel}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-end">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(item.price, language)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
