"use client";

import React from "react";
import { User, Phone } from "lucide-react";
import { useI18n, formatCurrency } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface DebtorItem {
  id: string;
  name: string;
  debt: number;
  phone?: string;
}

interface DebtLeaderboardProps {
  items: DebtorItem[];
  isLoading?: boolean;
  totalDebt?: number;
}

export function DebtLeaderboard({
  items,
  isLoading,
  totalDebt,
}: DebtLeaderboardProps) {
  const { t, dir, language } = useI18n();
  const isRTL = dir === "rtl";

  if (isLoading) {
    return (
      <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
        <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", isRTL && "flex-row-reverse") }>
          <User className="h-5 w-5" style={{ color: "var(--color-info)" }} />
          {t("topDebtors")}
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
          <User className="h-5 w-5" style={{ color: "var(--color-success)" }} />
          {t("topDebtors")}
        </h3>
        <p className="text-[var(--color-text-muted)] text-center py-8">
          {t("noDataAvailable")} 🎉
        </p>
      </div>
    );
  }

  return (
    <div className={cn("bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]", isRTL && "text-right")}>
      <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse") }>
        <h3 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse") }>
          <User className="h-5 w-5" style={{ color: "var(--color-info)" }} />
          {t("topDebtors")}
        </h3>
        {totalDebt && (
          <p className="text-sm font-medium" style={{ color: "var(--color-info)" }}>
            {t("total")}: {formatCurrency(totalDebt, language)}
          </p>
        )}
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={cn("p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors", isRTL && "text-right")}
          >
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse") }>
              <div className="flex-1">
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse") }>
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 text-sm font-bold rounded-full"
                    style={{
                      background: "var(--color-info-dim)",
                      color: "var(--color-info)",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                </div>
                {item.phone && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {item.phone}
                  </p>
                )}
              </div>
              <div className="text-end ms-2">
                <p className="text-lg font-bold" style={{ color: "var(--color-danger)" }}>
                  {formatCurrency(item.debt, language)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
